import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, type ActionCtx, type MutationCtx } from "./_generated/server";
import { requireStaff } from "./lib/auth";
import { deleteImages, uploadFromUrl, type CloudinaryUpload } from "./lib/cloudinary";
import { fail } from "./lib/errors";
import { splitSpecs } from "./lib/description";
import { buildSearchText } from "./lib/products";
import { slugify } from "./lib/slug";
import { logMovement } from "./products";

/**
 * Link with the Electro Darna shop (its feed: electro-darna/convex/catalogShare.ts).
 * Convex env: ELECTRODARNA_API_URL (https://<deployment>.convex.site), ELECTRODARNA_API_KEY (= its CATALOG_SHARE_KEY).
 */

export type RemoteProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  brandSlug: string | null;
  category: string | null;
  categoryName: string | null;
  description: string;
  warranty: string | null;
  price: number; // DH
  compareAtPrice: number | null; // DH
  stock: number | null; // null = not tracked by quantity
  available: boolean;
  isActive: boolean;
  imageUrls: string[];
  updatedAt: number;
};

/** Stock given to a product Electro Darna marks "in stock" without tracking a quantity. */
const UNTRACKED_AVAILABLE_STOCK = 10;
const MAX_IMAGES = 15;

const remoteStock = (p: RemoteProduct | undefined) => (!p || !p.available ? 0 : (p.stock ?? UNTRACKED_AVAILABLE_STOCK));

async function callFeed(ids?: string[]): Promise<RemoteProduct[]> {
  const base = process.env.ELECTRODARNA_API_URL;
  const key = process.env.ELECTRODARNA_API_KEY;
  if (!base || !key) fail("Le lien n'est pas configuré : ajoutez ELECTRODARNA_API_URL et ELECTRODARNA_API_KEY dans l'environnement Convex.");
  const res = await fetch(`${base.replace(/\/$/, "")}/api/catalog/products`, {
    method: ids ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: ids ? JSON.stringify({ ids }) : undefined,
  });
  if (!res.ok) fail(`Electro Darna a répondu ${res.status}`);
  return ((await res.json()) as { items: RemoteProduct[] }).items;
}

async function fetchByIds(ids: string[]) {
  const out: RemoteProduct[] = [];
  for (let i = 0; i < ids.length; i += 1000) out.push(...(await callFeed(ids.slice(i, i + 1000))));
  return out;
}

function warrantyMonths(text: string | null) {
  if (!text) return undefined;
  const years = text.match(/(\d+)\s*(an|ans|année|years?)/i);
  if (years) return Math.min(240, Number(years[1]) * 12);
  const months = text.match(/(\d+)\s*(mois|months?)/i);
  return months ? Math.min(240, Number(months[1])) : undefined;
}



// ── Category matching ──────────────────────────────────────
// Electro Darna's categories are broad ("Gros Electromenager"); the product
// name says more, so it is checked first. Then Darna's category (slugified,
// with aliases). A category still missing is created as a top-level one.

const NAME_RULES: [RegExp, string][] = [
  [/cong[ée]lateur/i, "congelateurs"],
  [/am[ée]ricain|side[- ]by[- ]side/i, "refrigerateurs-americains"],
  [/r[ée]f[rg][ie]g[ée]?rateur|frigo|mini[- ]?bar|no[- ]?frost|\bref\b|\bdp\s?\d{3}\b|\b2 portes\b/i, "refrigerateurs"],
  [/lave[- ]vaisselle/i, "lave-vaisselle"],
  [/machine [àa] laver|lave[- ]linge|s[ée]che[- ]linge|ecobubble|\bmal\b|\bww\d|\b\d{1,2}\s?kg\b.*\b(?:tr|tours?|1[0-6]00|inverter)\b/i, "machines-a-laver"],
  [/micro[- ]?ondes?/i, "micro-ondes"],
  [/cuisini[èe]re|plaque de cuisson|\bhotte\b/i, "cuisinieres"],
  [/\bfours?\b/i, "fours"],
  [/t[ée]l[ée]vis|\bsmart tv\b|\btv\b|\bled\b.*pouces|pouces/i, "tv-image"],
  [/climatiseur|climatisation|\bsplit\b/i, "climatisation"],
  [/chauffe[- ]?eau|chauffe[- ]bain/i, "chauffe-eau"],
  [/chauffage|radiateur|\bpo[êe]le\b|convecteur|mdfa|مدفأة/i, "chauffage"],
  [/distributeur d.eau|fontaine [àa] eau/i, "petit-electromenager"],
];

const CATEGORY_ALIASES: Record<string, string> = {
  televisions: "tv-image",
  "four-cuisson": "cuisson",
  congelateur: "congelateurs",
  "gros-electromenager": "gros-electromenager",
};

async function categoryBySlug(ctx: MutationCtx, slug: string) {
  return (await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).first())?._id;
}

async function resolveCategory(ctx: MutationCtx, p: Pick<RemoteProduct, "name" | "category" | "categoryName">): Promise<Id<"categories"> | undefined> {
  for (const [re, slug] of NAME_RULES) {
    if (!re.test(p.name)) continue;
    const id = await categoryBySlug(ctx, slug);
    if (id) return id;
  }
  const label = (p.categoryName || p.category || "").trim();
  if (!label) return undefined;
  const raw = slugify(label);
  const slug = CATEGORY_ALIASES[raw] ?? raw;
  const existing = await categoryBySlug(ctx, slug);
  if (existing) return existing;
  const last = await ctx.db.query("categories").withIndex("by_parent", (q) => q.eq("parentId", undefined)).collect();
  return ctx.db.insert("categories", {
    name: label.charAt(0).toUpperCase() + label.slice(1),
    slug,
    position: last.reduce((m, c) => Math.max(m, c.position), 0) + 1,
    isActive: true,
    updatedAt: Date.now(),
  });
}

/** Puts already-cloned products into a category (for clones made before matching improved). */
export const recategorize = internalAction({
  args: {},
  handler: async (ctx): Promise<{ updated: number }> => {
    const remote = await callFeed();
    return ctx.runMutation(internal.electrodarna.applyCategories, {
      items: remote.map((p) => ({ id: p.id, name: p.name, category: p.category, categoryName: p.categoryName })),
    });
  },
});

export const applyCategories = internalMutation({
  args: { items: v.array(v.object({ id: v.string(), name: v.string(), category: v.union(v.string(), v.null()), categoryName: v.union(v.string(), v.null()) })) },
  handler: async (ctx, { items }) => {
    let updated = 0;
    for (const item of items) {
      const product = await ctx.db.query("products").withIndex("by_source", (q) => q.eq("sourceId", item.id)).first();
      if (!product || product.categoryId) continue;
      const categoryId = await resolveCategory(ctx, item);
      if (categoryId) {
        await ctx.db.patch(product._id, { categoryId, searchText: await buildSearchText(ctx, { ...product, categoryId }), updatedAt: Date.now() });
        updated++;
      }
    }
    return { updated };
  },
});

/**
 * One-time cleanup for products cloned before these improvements:
 * moves products out of the catch-all "gros-electromenager" when their name
 * now matches a category, and turns "Label : value" description lines into specs.
 *   npx convex run electrodarna:tidyClones
 */
export const tidyClones = internalMutation({
  args: {},
  handler: async (ctx) => {
    const fallback = await categoryBySlug(ctx, "gros-electromenager");
    let moved = 0;
    let withSpecs = 0;
    for (const product of await ctx.db.query("products").collect()) {
      if (!product.sourceId) continue;
      const patch: Partial<Doc<"products">> = {};
      if (fallback && product.categoryId === fallback) {
        for (const [re, slug] of NAME_RULES) {
          if (!re.test(product.name)) continue;
          const id = await categoryBySlug(ctx, slug);
          if (id) { patch.categoryId = id; moved++; break; }
        }
      }
      if (!product.specs.length && product.description) {
        const text = splitSpecs(product.description);
        if (text.specs.length) { patch.specs = text.specs; patch.description = text.description; withSpecs++; }
      }
      if (Object.keys(patch).length) {
        const next = { ...product, ...patch };
        await ctx.db.patch(product._id, { ...patch, searchText: await buildSearchText(ctx, next), updatedAt: Date.now() });
      }
    }
    // The catch-all disappears once nothing is left in it.
    if (fallback && !(await ctx.db.query("products").withIndex("by_category", (q) => q.eq("categoryId", fallback)).first())) {
      await ctx.db.delete(fallback);
    }
    return { moved, withSpecs };
  },
});

// ── Browse ─────────────────────────────────────────────────

/** Remote catalog for the admin page. */
export const catalog = action({
  args: {},
  handler: async (ctx): Promise<RemoteProduct[]> => {
    await requireStaff(ctx);
    return callFeed();
  },
});

// ── Clone ──────────────────────────────────────────────────

export const linkedIds = internalQuery({
  args: {},
  handler: async (ctx) => (await ctx.db.query("products").collect()).filter((p) => p.sourceId).map((p) => ({ id: p._id, sourceId: p.sourceId! })),
});

export const createClone = internalMutation({
  args: {
    remote: v.any(),
    images: v.array(v.object({ key: v.string(), width: v.number(), height: v.number(), size: v.number(), mimeType: v.string() })),
    status: v.union(v.literal("DRAFT"), v.literal("ACTIVE")),
    userId: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, { remote, images, status, userId, userName }) => {
    const p = remote as RemoteProduct;
    if (await ctx.db.query("products").withIndex("by_source", (q) => q.eq("sourceId", p.id)).first()) return { created: false };

    // Brand: reuse by slug, create it otherwise.
    let brandId: Id<"brands"> | undefined;
    if (p.brand) {
      const slug = p.brandSlug || slugify(p.brand);
      const brand = await ctx.db.query("brands").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
      brandId = brand?._id ?? (await ctx.db.insert("brands", { name: p.brand, slug, isActive: true, updatedAt: Date.now() }));
    }
    const categoryId = await resolveCategory(ctx, p);

    const unique = async (base: string, index: "by_slug" | "by_sku") => {
      const taken = async (s: string) => Boolean(await ctx.db.query("products").withIndex(index, (q) => q.eq(index === "by_slug" ? "slug" : "sku", s)).first());
      if (!(await taken(base))) return base;
      for (let i = 2; i < 100; i++) if (!(await taken(`${base}-${i}`))) return `${base}-${i}`;
      return `${base}-${crypto.randomUUID().slice(0, 6)}`;
    };

    const price = Math.round(p.price * 100);
    const compareAtPrice = p.compareAtPrice ? Math.round(p.compareAtPrice * 100) : undefined;
    const stock = remoteStock(p);
    const text = splitSpecs(p.description);
    const fields = {
      name: p.name.slice(0, 160),
      slug: await unique(slugify(p.slug || p.name) || "produit", "by_slug"),
      sku: await unique(`ED-${p.id.slice(-8).toUpperCase()}`, "by_sku"),
      description: text.description,
      price,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
      stock,
      lowStockThreshold: 3,
      status,
      isFeatured: false,
      warrantyMonths: warrantyMonths(p.warranty),
      specs: text.specs,
      brandId,
      categoryId,
      images: images.map((i) => ({ ...i, alt: p.name.slice(0, 160) })),
      salesCount: 0,
      sourceId: p.id,
      sourceSyncedAt: Date.now(),
      updatedAt: Date.now(),
    };
    const productId = await ctx.db.insert("products", { ...fields, searchText: await buildSearchText(ctx, fields) });
    if (stock > 0) await logMovement(ctx, { productId, delta: stock, stockAfter: stock, reason: "RESTOCK", note: "Import Electro Darna", user: { id: userId, name: userName, email: "", role: "STAFF", phone: null } });
    return { created: true };
  },
});

async function cloneProducts(
  ctx: ActionCtx,
  ids: string[],
  status: "DRAFT" | "ACTIVE",
  user: { id: string; name: string },
): Promise<{ created: number; skipped: number; failed: string[] }> {
  const remote = await fetchByIds(ids);
  if (!remote.length) fail("Produits introuvables sur Electro Darna.");
  const linked = new Set((await ctx.runQuery(internal.electrodarna.linkedIds, {})).map((l) => l.sourceId));

  let created = 0;
  let skipped = 0;
  const failed: string[] = [];
  for (const p of remote) {
    if (linked.has(p.id)) {
      skipped++;
      continue;
    }
    const images: CloudinaryUpload[] = [];
    try {
      for (const url of p.imageUrls.slice(0, MAX_IMAGES)) {
        try {
          images.push(await uploadFromUrl(url, "products"));
        } catch (err) {
          console.warn("Electro Darna image import failed", url, err);
        }
      }
      const res = await ctx.runMutation(internal.electrodarna.createClone, { remote: p, images, status, userId: user.id, userName: user.name });
      if (res.created) created++;
      else {
        skipped++;
        await deleteImages(images.map((i) => i.key));
      }
    } catch (err) {
      console.error("Electro Darna clone failed", p.id, err);
      await deleteImages(images.map((i) => i.key));
      failed.push(p.name);
    }
  }
  return { created, skipped, failed };
}

export const importProducts = action({
  args: { ids: v.array(v.string()), status: v.union(v.literal("DRAFT"), v.literal("ACTIVE")) },
  handler: async (ctx, { ids, status }): Promise<{ created: number; skipped: number; failed: string[] }> => {
    const user = await requireStaff(ctx);
    if (!ids.length || ids.length > 50) fail("Sélectionnez entre 1 et 50 produits.");
    return cloneProducts(ctx, ids, status, user);
  },
});

// Bulk import from the terminal (e.g. to fill a new store):
//   npx convex run electrodarna:importFromCli '{"limit":40,"status":"ACTIVE"}'
// Skips products already cloned; run again to import the next batch.
export const importFromCli = internalAction({
  args: { limit: v.optional(v.number()), status: v.optional(v.union(v.literal("DRAFT"), v.literal("ACTIVE"))) },
  handler: async (ctx, { limit, status }): Promise<{ created: number; skipped: number; failed: string[]; remaining: number }> => {
    const all = await callFeed();
    const linked = new Set((await ctx.runQuery(internal.electrodarna.linkedIds, {})).map((l) => l.sourceId));
    const todo = all.filter((p) => !linked.has(p.id)).map((p) => p.id);
    const batch = todo.slice(0, Math.min(Math.max(limit ?? 20, 1), 50));
    if (!batch.length) return { created: 0, skipped: 0, failed: [], remaining: 0 };
    const res = await cloneProducts(ctx, batch, status ?? "ACTIVE", { id: "cli", name: "Import terminal" });
    return { ...res, remaining: todo.length - batch.length };
  },
});

// ── Stock sync ─────────────────────────────────────────────

export const applyStock = internalMutation({
  args: { levels: v.array(v.object({ id: v.id("products"), stock: v.number() })), userId: v.optional(v.string()), userName: v.optional(v.string()) },
  handler: async (ctx, { levels, userId, userName }) => {
    let updated = 0;
    const now = Date.now();
    for (const { id, stock } of levels) {
      const p = await ctx.db.get(id);
      if (!p) continue;
      await ctx.db.patch(id, { stock, sourceSyncedAt: now });
      const delta = stock - p.stock;
      if (delta === 0) continue;
      await ctx.db.insert("inventoryMovements", { productId: id, delta, stockAfter: stock, reason: "ADJUSTMENT", note: "Synchro Electro Darna", userId, userName });
      updated++;
    }
    return updated;
  },
});

type SyncResult = { checked: number; updated: number; outOfStock: number };

/**
 * Aligns the stock of every cloned product with Electro Darna.
 * Products removed or deactivated there fall to 0. Prices are left alone.
 */
async function runSync(ctx: ActionCtx, user?: { id: string; name: string }): Promise<SyncResult> {
  const linked = await ctx.runQuery(internal.electrodarna.linkedIds, {});
  if (!linked.length) return { checked: 0, updated: 0, outOfStock: 0 };
  const remote = new Map((await fetchByIds(linked.map((l) => l.sourceId))).map((p) => [p.id, p]));
  const levels = linked.map((l) => ({ id: l.id, stock: remoteStock(remote.get(l.sourceId)) }));
  const updated: number = await ctx.runMutation(internal.electrodarna.applyStock, { levels, userId: user?.id, userName: user?.name });
  return { checked: linked.length, updated, outOfStock: levels.filter((l) => l.stock === 0).length };
}

/** Scheduled from crons.ts. */
export const syncStock = internalAction({ args: {}, handler: (ctx): Promise<SyncResult> => runSync(ctx) });

/** "Synchroniser le stock" button. */
export const syncNow = action({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    const user = await requireStaff(ctx);
    return runSync(ctx, user);
  },
});
