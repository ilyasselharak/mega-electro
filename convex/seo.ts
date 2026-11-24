import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin, requireStaff } from "./lib/auth";
import { fail } from "./lib/errors";
import { opt, refreshSearchText } from "./lib/products";
import { cleanSeo, readSeoSettings, recordSlugRedirect, seoOut } from "./lib/seo";
import { onlyEmpty, RESERVED_REDIRECT_PREFIXES, suggestForCategory, suggestForProduct, type SeoMetaValues } from "./lib/seoRules";
import { readSettings } from "./lib/settings";
import { seoMeta, seoSettingsFields } from "./schema";

// ── Public reads (storefront) ────────────────────────────────────────────────

export const publicSettings = query({ args: {}, handler: (ctx) => readSeoSettings(ctx) });

/** Used by src/proxy.ts. Redirect rules are public by nature (any visitor can observe them). */
export const redirectMap = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("redirects").collect()).map((r) => ({ from: r.from, to: r.to, statusCode: r.statusCode })),
});

// ── Back office ──────────────────────────────────────────────────────────────

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const [categories, products, brands, redirects, settings, store] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("brands").collect(),
      ctx.db.query("redirects").collect(),
      readSeoSettings(ctx),
      readSettings(ctx),
    ]);
    const brandName = new Map(brands.map((b) => [b._id as string, b.name]));
    const catById = new Map(categories.map((c) => [c._id as string, c]));
    return {
      settings,
      store: { storeName: store.storeName, freeShippingThreshold: store.freeShippingThreshold },
      brandCount: brands.filter((b) => b.isActive).length,
      redirectCount: redirects.length,
      categories: categories
        .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "fr"))
        .map((c) => {
          const own = products.filter((p) => p.categoryId === c._id || (p.categoryId && catById.get(p.categoryId)?.parentId === c._id));
          return {
            id: c._id as string,
            name: c.name,
            slug: c.slug,
            parentId: (c.parentId as string | undefined) ?? null,
            parentName: c.parentId ? (catById.get(c.parentId)?.name ?? null) : null,
            isActive: c.isActive,
            description: c.description ?? null,
            metaTitle: c.metaTitle ?? null,
            metaDescription: c.metaDescription ?? null,
            imageKey: c.imageKey ?? null,
            seo: seoOut(c.seo),
            productCount: own.filter((p) => p.status === "ACTIVE").length,
            childNames: categories.filter((ch) => ch.parentId === c._id).map((ch) => ch.name),
            brandNames: [...new Set(own.map((p) => (p.brandId ? brandName.get(p.brandId) : undefined)).filter((x): x is string => Boolean(x)))],
            updatedAt: c.updatedAt,
          };
        }),
      products: products
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((p) => ({
          id: p._id as string,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          status: p.status,
          price: p.price,
          stock: p.stock,
          shortDescription: p.shortDescription ?? null,
          descriptionLength: p.description?.trim().length ?? 0,
          metaTitle: p.metaTitle ?? null,
          metaDescription: p.metaDescription ?? null,
          images: p.images.map((i) => ({ key: i.key, alt: i.alt ?? null })),
          seo: seoOut(p.seo),
          brandName: p.brandId ? (brandName.get(p.brandId) ?? null) : null,
          categoryName: p.categoryId ? (catById.get(p.categoryId)?.name ?? null) : null,
          updatedAt: p.updatedAt,
        })),
    };
  },
});

/** Full record for the SEO editor dialog. */
export const entity = query({
  args: { kind: v.union(v.literal("category"), v.literal("product")), id: v.string() },
  handler: async (ctx, { kind, id }) => {
    await requireStaff(ctx);
    if (kind === "category") {
      const cid = ctx.db.normalizeId("categories", id);
      const c = cid ? await ctx.db.get(cid) : null;
      if (!c) return null;
      return {
        kind,
        id: c._id as string,
        name: c.name,
        slug: c.slug,
        shortText: c.description ?? "",
        longText: c.seo?.longDescription ?? "",
        metaTitle: c.metaTitle ?? "",
        metaDescription: c.metaDescription ?? "",
        imageKey: c.imageKey ?? null,
        images: [] as { key: string; alt: string }[],
        seo: seoOut(c.seo),
        publicPath: `/categorie/${c.slug}`,
        isPublic: c.isActive,
        updatedAt: c.updatedAt,
      };
    }
    const pid = ctx.db.normalizeId("products", id);
    const p = pid ? await ctx.db.get(pid) : null;
    if (!p) return null;
    return {
      kind,
      id: p._id as string,
      name: p.name,
      slug: p.slug,
      shortText: p.shortDescription ?? "",
      longText: p.description ?? "",
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
      imageKey: p.images[0]?.key ?? null,
      images: p.images.map((i) => ({ key: i.key, alt: i.alt ?? "" })),
      seo: seoOut(p.seo),
      publicPath: `/produit/${p.slug}`,
      isPublic: p.status === "ACTIVE",
      updatedAt: p.updatedAt,
    };
  },
});

export const saveSettings = mutation({
  args: seoSettingsFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(args)) {
      if (val === undefined) continue;
      doc[k] = typeof val === "string" ? val.trim() : val;
    }
    const existing = await ctx.db.query("seoSettings").first();
    if (existing) await ctx.db.replace(existing._id, doc as never);
    else await ctx.db.insert("seoSettings", doc as never);
    const imageFields = ["ogImageKey", "socialImageKey", "orgLogoKey", "homeOgImageKey"] as const;
    const kept = new Set(imageFields.map((k) => doc[k]).filter(Boolean));
    return { replacedKeys: imageFields.map((k) => existing?.[k]).filter((k): k is string => Boolean(k) && !kept.has(k)) };
  },
});

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const updateEntity = mutation({
  args: {
    kind: v.union(v.literal("category"), v.literal("product")),
    id: v.string(),
    data: v.object({
      name: v.optional(v.string()),
      slug: v.string(),
      shortText: v.optional(v.string()),
      longText: v.optional(v.string()),
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      seo: seoMeta,
      imageAlts: v.optional(v.array(v.object({ key: v.string(), alt: v.string() }))),
    }),
  },
  handler: async (ctx, { kind, id, data }) => {
    await requireStaff(ctx);
    if (!SLUG_RE.test(data.slug) || data.slug.length > 96) fail("Slug invalide.");
    const now = Date.now();
    if (kind === "category") {
      const cid = ctx.db.normalizeId("categories", id);
      const c = cid ? await ctx.db.get(cid) : null;
      if (!c) fail("Catégorie introuvable.");
      const same = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", data.slug)).first();
      if (same && same._id !== c._id) fail("Cette valeur existe déjà (slug).");
      const name = data.name?.trim() || c.name;
      await ctx.db.patch(c._id, {
        name,
        slug: data.slug,
        description: opt(data.shortText?.trim()),
        metaTitle: opt(data.metaTitle?.trim()),
        metaDescription: opt(data.metaDescription?.trim()),
        seo: cleanSeo({ ...data.seo, longDescription: data.longText }),
        updatedAt: now,
      });
      await recordSlugRedirect(ctx, "/categorie", c.slug, data.slug);
      const oldOg = c.seo?.ogImageKey;
      if (name !== c.name) await refreshSearchText(ctx, await ctx.db.query("products").withIndex("by_category", (q) => q.eq("categoryId", c._id)).collect());
      return { path: `/categorie/${data.slug}`, replacedKey: oldOg && oldOg !== data.seo.ogImageKey ? oldOg : null };
    }
    const pid = ctx.db.normalizeId("products", id);
    const p = pid ? await ctx.db.get(pid) : null;
    if (!p) fail("Produit introuvable.");
    const same = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", data.slug)).first();
    if (same && same._id !== p._id) fail("Cette valeur existe déjà (slug).");
    const alts = new Map((data.imageAlts ?? []).map((a) => [a.key, a.alt.trim()]));
    const { longDescription: _ignored, ...seo } = data.seo;
    void _ignored;
    await ctx.db.patch(p._id, {
      slug: data.slug,
      shortDescription: opt(data.shortText?.trim()),
      description: opt(data.longText?.trim()),
      metaTitle: opt(data.metaTitle?.trim()),
      metaDescription: opt(data.metaDescription?.trim()),
      seo: cleanSeo(seo),
      images: p.images.map((img) => (alts.has(img.key) ? { ...img, alt: opt(alts.get(img.key)) } : img)),
      updatedAt: now,
    });
    await recordSlugRedirect(ctx, "/produit", p.slug, data.slug);
    const oldOg = p.seo?.ogImageKey;
    return { path: `/produit/${data.slug}`, replacedKey: oldOg && oldOg !== data.seo.ogImageKey ? oldOg : null };
  },
});

async function suggestionContext(ctx: MutationCtx) {
  const [seo, store] = await Promise.all([readSeoSettings(ctx), readSettings(ctx)]);
  return { siteName: seo.siteName, freeShippingThreshold: store.freeShippingThreshold };
}

function mergeEmpty(current: SeoMetaValues | undefined, proposal: SeoMetaValues) {
  return { ...(current ?? {}), ...onlyEmpty(current ?? {}, proposal as Record<string, unknown>) } as SeoMetaValues;
}

/**
 * Fills ONLY empty SEO fields with generated suggestions, after the admin selected the rows
 * and confirmed. Existing content is never overwritten. Returns how many fields were filled.
 */
export const applySuggestions = mutation({
  args: { kind: v.union(v.literal("category"), v.literal("product")), ids: v.array(v.string()) },
  handler: async (ctx, { kind, ids }) => {
    await requireStaff(ctx);
    if (ids.length > 500) fail("500 éléments maximum par lot.");
    const sctx = await suggestionContext(ctx);
    let filled = 0;
    let touched = 0;
    const now = Date.now();
    if (kind === "category") {
      const all = await ctx.db.query("categories").collect();
      const products = (await ctx.db.query("products").collect()).filter((p) => p.status === "ACTIVE");
      const brands = new Map((await ctx.db.query("brands").collect()).map((b) => [b._id as string, b.name]));
      for (const id of ids) {
        const c = all.find((x) => x._id === id);
        if (!c) continue;
        const own = products.filter((p) => p.categoryId === c._id || (p.categoryId && all.find((x) => x._id === p.categoryId)?.parentId === c._id));
        const s = suggestForCategory(
          {
            name: c.name,
            parentName: c.parentId ? all.find((x) => x._id === c.parentId)?.name : null,
            childNames: all.filter((x) => x.parentId === c._id).map((x) => x.name),
            brandNames: [...new Set(own.map((p) => (p.brandId ? brands.get(p.brandId) : undefined)).filter((x): x is string => Boolean(x)))],
            productCount: own.length,
            hasImage: Boolean(c.imageKey),
          },
          sctx,
        );
        const top = onlyEmpty({ metaTitle: c.metaTitle, metaDescription: c.metaDescription, description: c.description }, { metaTitle: s.metaTitle, metaDescription: s.metaDescription, description: s.shortText });
        const seo = mergeEmpty(c.seo, s.seo);
        const count = Object.keys(top).length + (Object.keys(seo).length - Object.keys(c.seo ?? {}).length);
        if (!count) continue;
        await ctx.db.patch(c._id, { ...(top as Partial<Doc<"categories">>), seo: cleanSeo(seo), updatedAt: now });
        filled += count;
        touched++;
      }
    } else {
      for (const id of ids) {
        const pid = ctx.db.normalizeId("products", id);
        const p = pid ? await ctx.db.get(pid) : null;
        if (!p) continue;
        const brand = p.brandId ? await ctx.db.get(p.brandId) : null;
        const category = p.categoryId ? await ctx.db.get(p.categoryId as Id<"categories">) : null;
        const s = suggestForProduct({ name: p.name, brandName: brand?.name, categoryName: category?.name, price: p.price, shortDescription: p.shortDescription, images: p.images }, sctx);
        const top = onlyEmpty({ metaTitle: p.metaTitle, metaDescription: p.metaDescription }, { metaTitle: s.metaTitle, metaDescription: s.metaDescription });
        const seo = mergeEmpty(p.seo, s.seo);
        let altFilled = 0;
        const images = p.images.map((img) => {
          if (img.alt?.trim()) return img;
          const alt = s.imageAlts.find((a) => a.key === img.key)?.alt;
          if (!alt) return img;
          altFilled++;
          return { ...img, alt };
        });
        const count = Object.keys(top).length + (Object.keys(seo).length - Object.keys(p.seo ?? {}).length) + altFilled;
        if (!count) continue;
        await ctx.db.patch(p._id, { ...(top as Partial<Doc<"products">>), seo: cleanSeo(seo), images, updatedAt: now });
        filled += count;
        touched++;
      }
    }
    return { filled, touched };
  },
});

export const setRobots = mutation({
  args: { kind: v.union(v.literal("category"), v.literal("product")), ids: v.array(v.string()), noindex: v.boolean() },
  handler: async (ctx, { kind, ids, noindex }) => {
    await requireStaff(ctx);
    const table = kind === "category" ? "categories" : "products";
    for (const id of ids) {
      const nid = ctx.db.normalizeId(table, id);
      const doc = nid ? await ctx.db.get(nid) : null;
      if (!doc) continue;
      await ctx.db.patch(doc._id, { seo: cleanSeo({ ...(doc.seo ?? {}), noindex }), updatedAt: Date.now() });
    }
  },
});

// ── Redirects ────────────────────────────────────────────────────────────────

export const listRedirects = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    return (await ctx.db.query("redirects").collect())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((r) => ({ id: r._id as string, from: r.from, to: r.to, statusCode: r.statusCode, note: r.note ?? null, auto: r.auto ?? false, updatedAt: r.updatedAt }));
  },
});

function normalizePath(p: string) {
  const t = p.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export const saveRedirect = mutation({
  args: { id: v.union(v.string(), v.null()), from: v.string(), to: v.string(), statusCode: v.number(), note: v.optional(v.string()) },
  handler: async (ctx, a) => {
    await requireStaff(ctx);
    const from = normalizePath(a.from);
    const to = normalizePath(a.to);
    if (!from.startsWith("/") || from === "/") fail("L'URL source doit être un chemin du site (ex : /ancienne-page).");
    if (RESERVED_REDIRECT_PREFIXES.some((p) => from === p || from.startsWith(`${p}/`))) fail("Ce chemin est réservé et ne peut pas être redirigé.");
    if (from === to) fail("La source et la destination sont identiques.");
    if (![301, 302].includes(a.statusCode)) fail("Code de redirection invalide.");
    const target = await ctx.db.query("redirects").withIndex("by_from", (q) => q.eq("from", to)).first();
    if (target && target.to === from) fail("Cette redirection créerait une boucle.");
    const rid = a.id ? ctx.db.normalizeId("redirects", a.id) : null;
    const same = await ctx.db.query("redirects").withIndex("by_from", (q) => q.eq("from", from)).first();
    if (same && same._id !== rid) fail("Une redirection existe déjà pour cette URL source.");
    const doc = { from, to, statusCode: a.statusCode, note: opt(a.note?.trim()), updatedAt: Date.now() };
    if (rid) await ctx.db.patch(rid, doc);
    else await ctx.db.insert("redirects", { ...doc, auto: false });
  },
});

export const deleteRedirect = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const rid = ctx.db.normalizeId("redirects", id);
    if (rid) await ctx.db.delete(rid);
  },
});
