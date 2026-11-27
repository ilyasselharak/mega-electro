import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { makeCardLoader, normalize } from "./lib/products";
import { seoOut } from "./lib/seo";
import { readSettings } from "./lib/settings";

// Public storefront reads. Only ACTIVE products and active categories/brands are exposed.

const PRODUCTS_PER_PAGE = 24;

const activeProducts = (ctx: QueryCtx) => ctx.db.query("products").withIndex("by_status", (q) => q.eq("status", "ACTIVE")).collect();

const byPositionThenName = (a: Doc<"categories">, b: Doc<"categories">) => a.position - b.position || a.name.localeCompare(b.name, "fr");

function categoryOut(c: Doc<"categories">) {
  return {
    id: c._id as string,
    name: c.name,
    nameAr: c.nameAr ?? null,
    slug: c.slug,
    description: c.description ?? null,
    imageKey: c.imageKey ?? null,
    icon: c.icon ?? null,
    position: c.position,
    isActive: c.isActive,
    parentId: (c.parentId as string | undefined) ?? null,
    metaTitle: c.metaTitle ?? null,
    metaDescription: c.metaDescription ?? null,
    seo: seoOut(c.seo),
    createdAt: c._creationTime,
    updatedAt: c.updatedAt,
  };
}

function brandOut(b: Doc<"brands">) {
  return {
    id: b._id as string,
    name: b.name,
    slug: b.slug,
    description: b.description ?? null,
    logoKey: b.logoKey ?? null,
    isActive: b.isActive,
    metaTitle: b.metaTitle ?? null,
    metaDescription: b.metaDescription ?? null,
    createdAt: b._creationTime,
    updatedAt: b.updatedAt,
  };
}

export const settings = query({ args: {}, handler: (ctx) => readSettings(ctx) });

export const navCategories = query({
  args: {},
  handler: async (ctx) => {
    const all = (await ctx.db.query("categories").collect()).filter((c) => c.isActive);
    const products = await activeProducts(ctx);
    const roots = all.filter((c) => !c.parentId).sort(byPositionThenName);
    return roots.map((c) => ({
      id: c._id as string,
      name: c.name,
      nameAr: c.nameAr ?? null,
      slug: c.slug,
      icon: c.icon ?? null,
      imageKey: c.imageKey ?? null,
      imageAlt: c.seo?.imageAlt ?? null,
      children: all
        .filter((ch) => ch.parentId === c._id)
        .sort(byPositionThenName)
        .map((ch) => ({ id: ch._id as string, name: ch.name, nameAr: ch.nameAr ?? null, slug: ch.slug })),
      _count: {
        products: products.filter((p) => p.categoryId === c._id || all.some((ch) => ch.parentId === c._id && ch._id === p.categoryId)).length,
      },
    }));
  },
});

export const activeBrands = query({
  args: {},
  handler: async (ctx) => {
    const withProducts = new Set((await activeProducts(ctx)).map((p) => p.brandId).filter(Boolean));
    return (await ctx.db.query("brands").collect())
      .filter((b) => b.isActive && withProducts.has(b._id))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      .map((b) => ({ id: b._id as string, name: b.name, slug: b.slug, logoKey: b.logoKey ?? null }));
  },
});

export const homeCollections = query({
  args: {},
  handler: async (ctx) => {
    const all = await activeProducts(ctx);
    const card = makeCardLoader(ctx);
    // Each product appears in one section only, in this priority order.
    const shown = new Set<string>();
    const pick = (list: Doc<"products">[]) => {
      const chosen = list.filter((p) => !shown.has(p._id)).slice(0, 8);
      for (const p of chosen) shown.add(p._id);
      return Promise.all(chosen.map(card));
    };
    const discount = (p: Doc<"products">) => (p.compareAtPrice && p.compareAtPrice > p.price ? (p.compareAtPrice - p.price) / p.compareAtPrice : 0);
    return {
      deals: await pick(all.filter((p) => discount(p) > 0 && p.stock > 0).sort((a, b) => discount(b) - discount(a))),
      featured: await pick(all.filter((p) => p.isFeatured).sort((a, b) => b.updatedAt - a.updatedAt)),
      // Only products that really sold: no invented "best sellers".
      bestSellers: await pick(all.filter((p) => p.salesCount > 0).sort((a, b) => b.salesCount - a.salesCount)),
      newest: await pick([...all].sort((a, b) => b._creationTime - a._creationTime)),
    };
  },
});

export const productBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const p = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
    if (!p || p.status !== "ACTIVE") return null;
    const brand = p.brandId ? await ctx.db.get(p.brandId) : null;
    const category = p.categoryId ? await ctx.db.get(p.categoryId) : null;
    const parent = category?.parentId ? await ctx.db.get(category.parentId) : null;
    // FAQ: product entries first, then its category (and parent category), then store-wide entries.
    const scoped = async (categoryId: Doc<"categories">["_id"] | undefined) =>
      (await ctx.db.query("faqs").withIndex("by_category", (q) => q.eq("categoryId", categoryId)).collect()).filter((f) => f.isActive).sort((a, b) => a.position - b.position);
    const faq = [
      ...(p.faq ?? []),
      ...(category ? await scoped(category._id) : []),
      ...(parent ? await scoped(parent._id) : []),
      ...(await scoped(undefined)),
    ]
      .slice(0, 10)
      .map((f) => ({ question: f.question, answer: f.answer, questionAr: f.questionAr ?? null, answerAr: f.answerAr ?? null }));
    return {
      id: p._id as string,
      name: p.name,
      nameAr: p.nameAr ?? null,
      faq,
      slug: p.slug,
      sku: p.sku,
      shortDescription: p.shortDescription ?? null,
      description: p.description ?? null,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isFeatured: p.isFeatured,
      warrantyMonths: p.warrantyMonths ?? null,
      specs: p.specs,
      categoryId: (p.categoryId as string | undefined) ?? null,
      brandId: (p.brandId as string | undefined) ?? null,
      metaTitle: p.metaTitle ?? null,
      metaDescription: p.metaDescription ?? null,
      seo: seoOut(p.seo),
      createdAt: p._creationTime,
      updatedAt: p.updatedAt,
      images: p.images.map((i, position) => ({ id: i.key, key: i.key, alt: i.alt ?? null, width: i.width ?? null, height: i.height ?? null, position })),
      brand: brand ? { id: brand._id as string, name: brand.name, slug: brand.slug } : null,
      category: category
        ? { id: category._id as string, name: category.name, nameAr: category.nameAr ?? null, slug: category.slug, parent: parent ? { name: parent.name, nameAr: parent.nameAr ?? null, slug: parent.slug } : null }
        : null,
    };
  },
});

export const relatedProducts = query({
  args: { productId: v.string(), categoryId: v.optional(v.string()), brandId: v.optional(v.string()) },
  handler: async (ctx, { productId, categoryId, brandId }) => {
    if (!categoryId && !brandId) return [];
    const list = (await activeProducts(ctx))
      .filter((p) => p._id !== productId && ((categoryId && p.categoryId === categoryId) || (brandId && p.brandId === brandId)))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 8);
    return Promise.all(list.map(makeCardLoader(ctx)));
  },
});

const sortValidator = v.optional(
  v.union(v.literal("pertinence"), v.literal("nouveautes"), v.literal("prix-asc"), v.literal("prix-desc"), v.literal("meilleures-ventes")),
);

const listingArgs = {
  categoryId: v.optional(v.string()),
  includeChildCategories: v.optional(v.array(v.string())),
  brandId: v.optional(v.string()),
  brandSlugs: v.optional(v.array(v.string())),
  q: v.optional(v.string()),
  minPrice: v.optional(v.number()),
  maxPrice: v.optional(v.number()),
  inStock: v.optional(v.boolean()),
  onSale: v.optional(v.boolean()),
  sort: sortValidator,
  page: v.optional(v.number()),
};

type Filters = {
  categoryIds?: Set<string>;
  brandId?: string;
  brandIds?: Set<string>;
  terms?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
};

function matches(p: Doc<"products">, f: Filters) {
  if (f.categoryIds && !(p.categoryId && f.categoryIds.has(p.categoryId))) return false;
  if (f.brandId && p.brandId !== f.brandId) return false;
  if (f.brandIds && !(p.brandId && f.brandIds.has(p.brandId))) return false;
  if (f.inStock && p.stock <= 0) return false;
  if (f.onSale && p.compareAtPrice == null) return false;
  if (f.minPrice != null && p.price < f.minPrice) return false;
  if (f.maxPrice != null && p.price > f.maxPrice) return false;
  if (f.terms?.length && !f.terms.every((t) => p.searchText.includes(t))) return false;
  return true;
}

const searchTerms = (q?: string) => (q ? normalize(q).split(/\s+/).filter(Boolean).slice(0, 6) : undefined);

export const listProducts = query({
  args: listingArgs,
  handler: async (ctx, a) => {
    const page = Math.max(1, a.page ?? 1);
    const all = await activeProducts(ctx);
    const brands = await ctx.db.query("brands").collect();

    const base: Filters = {
      categoryIds: a.categoryId ? new Set([a.categoryId, ...(a.includeChildCategories ?? [])]) : undefined,
      brandId: a.brandId,
      terms: searchTerms(a.q),
      inStock: a.inStock,
      onSale: a.onSale,
    };
    const brandIds = a.brandSlugs?.length ? new Set(brands.filter((b) => a.brandSlugs!.includes(b.slug)).map((b) => b._id as string)) : undefined;
    const filtered = all.filter((p) => matches(p, { ...base, brandIds, minPrice: a.minPrice, maxPrice: a.maxPrice }));
    // Facets ignore the brand and price filters so users can multi-select brands
    const facetSet = all.filter((p) => matches(p, base));

    const sorted = filtered.sort((x, y) => {
      switch (a.sort) {
        case "nouveautes":
          return y._creationTime - x._creationTime;
        case "prix-asc":
          return x.price - y.price;
        case "prix-desc":
          return y.price - x.price;
        case "meilleures-ventes":
          return y.salesCount - x.salesCount || y._creationTime - x._creationTime;
        default:
          return Number(y.isFeatured) - Number(x.isFeatured) || y.salesCount - x.salesCount || y._creationTime - x._creationTime;
      }
    });

    const counts = new Map<string, number>();
    for (const p of facetSet) if (p.brandId) counts.set(p.brandId, (counts.get(p.brandId) ?? 0) + 1);
    const prices = facetSet.map((p) => p.price);
    const card = makeCardLoader(ctx);

    return {
      items: await Promise.all(sorted.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE).map(card)),
      total: filtered.length,
      page,
      pageCount: Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE)),
      facets: {
        brands: brands
          .filter((b) => counts.has(b._id))
          .sort((x, y) => x.name.localeCompare(y.name, "fr"))
          .map((b) => ({ id: b._id as string, name: b.name, slug: b.slug, count: counts.get(b._id)! })),
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
      },
    };
  },
});

export const searchSuggestions = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    const terms = searchTerms(q);
    const list = (await activeProducts(ctx))
      .filter((p) => matches(p, { terms }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 6);
    return Promise.all(
      list.map(async (p) => {
        const brand = p.brandId ? await ctx.db.get(p.brandId) : null;
        return { id: p._id as string, name: p.name, nameAr: p.nameAr ?? null, slug: p.slug, price: p.price, images: p.images.slice(0, 1).map((i) => ({ key: i.key })), brand: brand ? { name: brand.name } : null };
      }),
    );
  },
});

export const categoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const c = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
    if (!c || !c.isActive) return null;
    const parent = c.parentId ? await ctx.db.get(c.parentId) : null;
    const children = (await ctx.db.query("categories").withIndex("by_parent", (q) => q.eq("parentId", c._id)).collect())
      .filter((ch) => ch.isActive)
      .sort(byPositionThenName)
      .map((ch) => ({ id: ch._id as string, name: ch.name, nameAr: ch.nameAr ?? null, slug: ch.slug }));
    return { ...categoryOut(c), parent: parent ? { id: parent._id as string, name: parent.name, nameAr: parent.nameAr ?? null, slug: parent.slug } : null, children };
  },
});

export const brandBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const b = await ctx.db.query("brands").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
    return b && b.isActive ? brandOut(b) : null;
  },
});

export const productsForCart = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    const out = [];
    for (const id of ids.slice(0, 50)) {
      const nid = ctx.db.normalizeId("products", id);
      const p = nid ? await ctx.db.get(nid) : null;
      if (!p || p.status !== "ACTIVE") continue;
      out.push({ id: p._id as string, name: p.name, slug: p.slug, sku: p.sku, price: p.price, stock: p.stock, images: p.images.slice(0, 1).map((i) => ({ key: i.key })) });
    }
    return out;
  },
});

export const sitemap = query({
  args: {},
  handler: async (ctx) => ({
    products: (await activeProducts(ctx)).map((p) => ({
      slug: p.slug,
      updatedAt: p.updatedAt,
      noindex: p.seo?.noindex ?? false,
      canonicalUrl: p.seo?.canonicalUrl ?? null,
      images: p.images.slice(0, 5).map((i) => ({ key: i.key })),
    })),
    categories: (await ctx.db.query("categories").collect())
      .filter((c) => c.isActive)
      .map((c) => ({ slug: c.slug, updatedAt: c.updatedAt, noindex: c.seo?.noindex ?? false, canonicalUrl: c.seo?.canonicalUrl ?? null, imageKey: c.imageKey ?? null })),
    brands: (await ctx.db.query("brands").collect()).filter((b) => b.isActive).map((b) => ({ slug: b.slug, updatedAt: b.updatedAt })),
  }),
});

/** Product cards by id (wishlist, recently viewed). Unknown or inactive ids are skipped. */
export const productCards = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    const card = makeCardLoader(ctx);
    const out = [];
    for (const id of ids.slice(0, 50)) {
      const nid = ctx.db.normalizeId("products", id);
      const p = nid ? await ctx.db.get(nid) : null;
      if (p && p.status === "ACTIVE") out.push(await card(p));
    }
    return out;
  },
});

/**
 * Homepage merchandising. Collections are resolved to product cards (active products only).
 * Campaign dates are applied by the storefront at render time.
 */
export const storefront = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("storefront").first();
    if (!doc) return null;
    const card = makeCardLoader(ctx);
    const collections = [];
    for (const c of doc.collections.filter((c) => c.isActive)) {
      const products = [];
      for (const sku of c.skus.slice(0, 24)) {
        const p = await ctx.db.query("products").withIndex("by_sku", (q) => q.eq("sku", sku)).first();
        if (p && p.status === "ACTIVE") products.push(await card(p));
      }
      const { skus: _skus, ...rest } = c;
      collections.push({ ...rest, products });
    }
    return {
      banners: doc.banners.filter((b) => b.isActive),
      collections,
      sections: doc.sections,
      theme: doc.theme ?? null,
    };
  },
});

export { categoryOut, brandOut };
