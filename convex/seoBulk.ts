import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin, requireStaff } from "./lib/auth";
import { fail } from "./lib/errors";
import { buildSearchText } from "./lib/products";
import { cleanSeo, recordSlugRedirect } from "./lib/seo";
import { faqEntry } from "./schema";

/**
 * Bulk SEO updates with a field-level change log and rollback (scripts/seo/apply.mjs, Admin → SEO → Historique).
 *
 * Safety rules enforced here, not only in the script:
 *  - Allow-list: only the SEO/content fields in the validators below can be written. Slugs, prices, stock,
 *    images (except ALT text), status, orders and customers are not reachable from this module.
 *  - Optimistic concurrency: `expectedUpdatedAt` must match the document, or the write is refused.
 *  - Idempotent: unchanged fields are skipped; re-running a batch writes nothing new.
 *  - Additive: a bulk update never clears a field (empty values are rejected).
 *  - Every changed field is logged with its previous value; rollback only restores fields nobody edited since.
 */

const seoFields = {
  h1: v.optional(v.string()),
  keywords: v.optional(v.string()),
  titleAr: v.optional(v.string()),
  metaDescriptionAr: v.optional(v.string()),
  descriptionAr: v.optional(v.string()),
  keywordsAr: v.optional(v.string()),
  ogTitle: v.optional(v.string()),
  ogDescription: v.optional(v.string()),
};

const productChanges = v.object({
  /** Display name only: the slug (URL) never changes here. */
  name: v.optional(v.string()),
  nameAr: v.optional(v.string()),
  shortDescription: v.optional(v.string()),
  description: v.optional(v.string()),
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  seo: v.optional(v.object({ ...seoFields, shortDescriptionAr: v.optional(v.string()) })),
  faq: v.optional(v.array(faqEntry)),
  /** ALT text per existing image key, French and Arabic (images themselves are never added, removed or reordered). */
  imageAlts: v.optional(v.array(v.object({ key: v.string(), alt: v.optional(v.string()), altAr: v.optional(v.string()) }))),
  /** Only verified specifications (the script refuses unverified ones). */
  specs: v.optional(v.array(v.object({ label: v.string(), value: v.string() }))),
});

const categoryChanges = v.object({
  nameAr: v.optional(v.string()),
  description: v.optional(v.string()),
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  seo: v.optional(v.object({ ...seoFields, longDescription: v.optional(v.string()), imageAlt: v.optional(v.string()) })),
});

const LIMITS: Record<string, number> = {
  name: 160,
  nameAr: 160,
  shortDescription: 400,
  description: 8000,
  metaTitle: 75,
  metaDescription: 175,
  "seo.h1": 120,
  "seo.keywords": 500,
  "seo.keywordsAr": 500,
  "seo.titleAr": 75,
  "seo.metaDescriptionAr": 175,
  "seo.descriptionAr": 8000,
  "seo.shortDescriptionAr": 400,
  "seo.longDescription": 8000,
  "seo.ogTitle": 95,
  "seo.ogDescription": 200,
  "seo.imageAlt": 160,
  imageAlt: 160,
  imageAltAr: 160,
};

type Change = { field: string; before: unknown; after: unknown };
/** Order-independent comparison: Convex returns object keys sorted, proposals may not be. */
const stable = (v: unknown): unknown => (Array.isArray(v) ? v.map(stable) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])])) : (v ?? null));
const same = (a: unknown, b: unknown) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));

/** Flattens the requested changes into field-level operations against the current document. */
function plan(doc: Doc<"products"> | Doc<"categories">, changes: Record<string, unknown>): Change[] {
  const out: Change[] = [];
  const push = (field: string, before: unknown, after: unknown) => {
    if (typeof after === "string") {
      const value = after.trim();
      if (!value) fail(`${field} : une mise à jour groupée ne peut pas vider un champ.`);
      const max = LIMITS[field] ?? LIMITS[field.split(":")[0]];
      if (max && value.length > max) fail(`${field} : ${value.length} caractères (maximum ${max}).`);
      after = value;
    }
    if (!same(before, after)) out.push({ field, before: before ?? null, after });
  };
  const d = doc as Record<string, unknown> & { seo?: Record<string, unknown>; images?: Doc<"products">["images"] };
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) continue;
    if (key === "seo") {
      for (const [k, val] of Object.entries(value as Record<string, unknown>)) if (val !== undefined) push(`seo.${k}`, d.seo?.[k], val);
    } else if (key === "imageAlts") {
      for (const { key: imageKey, alt, altAr } of value as { key: string; alt?: string; altAr?: string }[]) {
        const img = d.images?.find((i) => i.key === imageKey);
        if (!img) fail(`Image inconnue : ${imageKey}`);
        if (alt !== undefined) push(`imageAlt:${imageKey}`, img.alt, alt);
        if (altAr !== undefined) push(`imageAltAr:${imageKey}`, img.altAr, altAr);
      }
    } else if (key === "faq") {
      const faq = value as Doc<"products">["faq"];
      if ((faq?.length ?? 0) > 10) fail("faq : 10 questions au maximum.");
      if (!faq?.length) fail("faq : une mise à jour groupée ne peut pas vider la FAQ.");
      push("faq", d.faq, faq);
    } else if (key === "specs") {
      const specs = value as Doc<"products">["specs"];
      if (!specs.length || specs.length > 60) fail("specs : 1 à 60 lignes.");
      push("specs", d.specs, specs);
    } else {
      push(key, d[key], value);
    }
  }
  return out;
}

/** Applies field-level values to a document copy (shared by apply and rollback). */
function patchFor(doc: Doc<"products"> | Doc<"categories">, values: { field: string; value: unknown }[]) {
  const patch: Record<string, unknown> = {};
  let seo = { ...((doc as { seo?: Record<string, unknown> }).seo ?? {}) };
  let images = "images" in doc ? [...doc.images] : null;
  let seoTouched = false;
  for (const { field, value } of values) {
    if (field.startsWith("seo.")) {
      seo = { ...seo, [field.slice(4)]: value ?? undefined };
      seoTouched = true;
    } else if ((field.startsWith("imageAlt:") || field.startsWith("imageAltAr:")) && images) {
      const ar = field.startsWith("imageAltAr:");
      const key = field.slice(ar ? "imageAltAr:".length : "imageAlt:".length);
      images = images.map((i) => (i.key === key ? { ...i, [ar ? "altAr" : "alt"]: (value as string | null) ?? undefined } : i));
      patch.images = images;
    } else {
      patch[field] = value ?? undefined;
    }
  }
  if (seoTouched) patch.seo = cleanSeo(seo);
  return patch;
}

async function load(ctx: MutationCtx, kind: "product" | "category", id: string) {
  const doc = kind === "product" ? await ctx.db.get(ctx.db.normalizeId("products", id) as Id<"products">) : await ctx.db.get(ctx.db.normalizeId("categories", id) as Id<"categories">);
  if (!doc) fail(`${kind} introuvable : ${id}`);
  return doc;
}

async function write(ctx: MutationCtx, kind: "product" | "category", doc: Doc<"products"> | Doc<"categories">, patch: Record<string, unknown>) {
  const now = Date.now();
  if (kind === "product") {
    const p = doc as Doc<"products">;
    const next = { ...p, ...patch } as Doc<"products">;
    const searchText = "shortDescription" in patch || "name" in patch ? await buildSearchText(ctx, next) : p.searchText;
    await ctx.db.patch(p._id, { ...(patch as Partial<Doc<"products">>), searchText, updatedAt: now });
  } else {
    await ctx.db.patch((doc as Doc<"categories">)._id, { ...(patch as Partial<Doc<"categories">>), updatedAt: now });
  }
}

const applyArgs = {
  batchId: v.string(),
  /** Short label stored in the log ("pilot-10", "categories-v1"). */
  source: v.string(),
  dryRun: v.boolean(),
  kind: v.union(v.literal("product"), v.literal("category")),
  id: v.string(),
  expectedUpdatedAt: v.number(),
  product: v.optional(productChanges),
  category: v.optional(categoryChanges),
};

/** One entity per call (the script batches calls). Returns the field-level diff that was (or would be) applied. */
export const apply = internalMutation({
  args: applyArgs,
  handler: async (ctx, a) => {
    if (!/^[a-z0-9-]{3,60}$/.test(a.batchId)) fail("batchId invalide.");
    const doc = await load(ctx, a.kind, a.id);
    const changes = (a.kind === "product" ? a.product : a.category) ?? fail("Aucune modification fournie.");
    const diff = plan(doc, changes as Record<string, unknown>);
    if (doc.updatedAt !== a.expectedUpdatedAt) {
      return { status: "conflict" as const, slug: doc.slug, diff, message: "Modifié depuis la préparation : relancez la préparation pour ce document." };
    }
    if (!diff.length) return { status: "unchanged" as const, slug: doc.slug, diff };
    if (a.dryRun) return { status: "dry-run" as const, slug: doc.slug, diff };
    await write(ctx, a.kind, doc, patchFor(doc, diff.map((c) => ({ field: c.field, value: c.after }))));
    const appliedAt = Date.now();
    for (const c of diff) {
      await ctx.db.insert("seoChangeLog", { batchId: a.batchId, source: a.source, kind: a.kind, entityId: a.id, slug: doc.slug, field: c.field, before: c.before, after: c.after, appliedAt });
    }
    return { status: "applied" as const, slug: doc.slug, diff };
  },
});

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Renames a category (display names and URL slug). The old URL gets a 301 to the new one through the same
 * helper the admin uses (no chains, no loops). Logged in seoChangeLog so it can be rolled back.
 */
export const renameCategory = internalMutation({
  args: { batchId: v.string(), id: v.string(), expectedUpdatedAt: v.number(), name: v.string(), nameAr: v.string(), slug: v.string(), dryRun: v.boolean() },
  handler: async (ctx, a) => {
    if (!/^[a-z0-9-]{3,60}$/.test(a.batchId)) fail("batchId invalide.");
    if (!SLUG_RE.test(a.slug) || a.slug.length > 96) fail("Slug invalide.");
    const c = (await load(ctx, "category", a.id)) as Doc<"categories">;
    if (c.updatedAt !== a.expectedUpdatedAt) return { status: "conflict" as const, diff: [] };
    const taken = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", a.slug)).first();
    if (taken && taken._id !== c._id) fail("Ce slug est déjà utilisé par une autre catégorie.");
    const diff = plan(c, { name: a.name, nameAr: a.nameAr }).concat(c.slug === a.slug ? [] : [{ field: "slug", before: c.slug, after: a.slug }]);
    if (!diff.length || a.dryRun) return { status: (diff.length ? "dry-run" : "unchanged") as "dry-run" | "unchanged", diff };
    await ctx.db.patch(c._id, { name: a.name.trim(), nameAr: a.nameAr.trim(), slug: a.slug, updatedAt: Date.now() });
    await recordSlugRedirect(ctx, "/categorie", c.slug, a.slug);
    // Product search text includes the category name.
    const products = await ctx.db.query("products").withIndex("by_category", (q) => q.eq("categoryId", c._id)).collect();
    for (const p of products) {
      const searchText = await buildSearchText(ctx, p);
      if (searchText !== p.searchText) await ctx.db.patch(p._id, { searchText });
    }
    const appliedAt = Date.now();
    for (const d of diff) await ctx.db.insert("seoChangeLog", { batchId: a.batchId, source: "rename", kind: "category", entityId: a.id, slug: a.slug, field: d.field, before: d.before, after: d.after, appliedAt });
    return { status: "applied" as const, diff, redirect: `/categorie/${c.slug} -> /categorie/${a.slug}` };
  },
});

async function rollback(ctx: MutationCtx, batchId: string, dryRun: boolean) {
  const rows = (await ctx.db.query("seoChangeLog").withIndex("by_batch", (q) => q.eq("batchId", batchId)).collect()).filter((r) => r.rolledBackAt == null);
  if (!rows.length) fail("Lot introuvable ou déjà annulé.");
  const byEntity = new Map<string, typeof rows>();
  for (const r of rows) byEntity.set(`${r.kind}:${r.entityId}`, [...(byEntity.get(`${r.kind}:${r.entityId}`) ?? []), r]);
  let restored = 0;
  const conflicts: string[] = [];
  const now = Date.now();
  for (const list of byEntity.values()) {
    const { kind, entityId } = list[0];
    const doc = await load(ctx, kind, entityId);
    // Current value of each logged field, through the same flattening as apply.
    const current = (field: string): unknown => {
      const d = doc as Record<string, unknown> & { seo?: Record<string, unknown>; images?: Doc<"products">["images"] };
      if (field.startsWith("seo.")) return d.seo?.[field.slice(4)] ?? null;
      if (field.startsWith("imageAlt:")) return d.images?.find((i) => i.key === field.slice(9))?.alt ?? null;
      if (field.startsWith("imageAltAr:")) return d.images?.find((i) => i.key === field.slice(11))?.altAr ?? null;
      return d[field] ?? null;
    };
    const ok = list.filter((r) => same(current(r.field), r.after));
    for (const r of list.filter((x) => !ok.includes(x))) conflicts.push(`${r.slug} · ${r.field} (modifié depuis)`);
    if (!ok.length) continue;
    if (!dryRun) {
      await write(ctx, kind, doc, patchFor(doc, ok.map((r) => ({ field: r.field, value: r.before }))));
      const slugRow = ok.find((r) => r.field === "slug");
      if (slugRow && kind === "category") await recordSlugRedirect(ctx, "/categorie", slugRow.after as string, slugRow.before as string);
      for (const r of ok) await ctx.db.patch(r._id, { rolledBackAt: now });
    }
    restored += ok.length;
  }
  return { restored, conflicts };
}

/** CLI rollback: npx convex run seoBulk:rollbackBatch '{"batchId":"…","dryRun":true}' */
export const rollbackBatch = internalMutation({
  args: { batchId: v.string(), dryRun: v.boolean() },
  handler: (ctx, { batchId, dryRun }) => rollback(ctx, batchId, dryRun),
});

/** Admin → SEO → Historique: undo a batch (admins only). */
export const rollbackBatchAdmin = mutation({
  args: { batchId: v.string() },
  handler: async (ctx, { batchId }) => {
    await requireAdmin(ctx);
    return rollback(ctx, batchId, false);
  },
});

/** Admin → SEO → Historique: batches, newest first, with their field changes. */
export const history = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireStaff(ctx);
    const rows = await ctx.db.query("seoChangeLog").order("desc").take(Math.min(limit ?? 400, 1000));
    const batches = new Map<string, { batchId: string; source: string; appliedAt: number; rolledBack: number; entities: Set<string>; changes: typeof rows }>();
    for (const r of rows) {
      const b = batches.get(r.batchId) ?? { batchId: r.batchId, source: r.source, appliedAt: r.appliedAt, rolledBack: 0, entities: new Set<string>(), changes: [] };
      b.entities.add(`${r.kind}:${r.entityId}`);
      b.changes.push(r);
      if (r.rolledBackAt) b.rolledBack++;
      b.appliedAt = Math.max(b.appliedAt, r.appliedAt);
      batches.set(r.batchId, b);
    }
    return [...batches.values()].map((b) => ({
      batchId: b.batchId,
      source: b.source,
      appliedAt: b.appliedAt,
      entities: b.entities.size,
      fields: b.changes.length,
      rolledBack: b.rolledBack,
      changes: b.changes.slice(0, 200).map((c) => ({ id: c._id as string, kind: c.kind, slug: c.slug, field: c.field, before: c.before, after: c.after, rolledBackAt: c.rolledBackAt ?? null })),
    }));
  },
});
