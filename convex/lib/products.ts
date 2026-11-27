import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function buildSearchText(ctx: Ctx, p: { name: string; sku: string; shortDescription?: string; brandId?: Id<"brands">; categoryId?: Id<"categories"> }) {
  const brand = p.brandId ? await ctx.db.get(p.brandId) : null;
  const category = p.categoryId ? await ctx.db.get(p.categoryId) : null;
  return normalize([p.name, p.sku, brand?.name, category?.name, p.shortDescription].filter(Boolean).join(" "));
}

/** Keeps searchText in sync after a brand/category rename. */
export async function refreshSearchText(ctx: MutationCtx, products: Doc<"products">[]) {
  for (const p of products) {
    const searchText = await buildSearchText(ctx, p);
    if (searchText !== p.searchText) await ctx.db.patch(p._id, { searchText });
  }
}

/** Card shape shared by every product listing. */
export function makeCardLoader(ctx: Ctx) {
  const brands = new Map<string, Doc<"brands"> | null>();
  return async (p: Doc<"products">) => {
    let brand: Doc<"brands"> | null = null;
    if (p.brandId) {
      if (!brands.has(p.brandId)) brands.set(p.brandId, await ctx.db.get(p.brandId));
      brand = brands.get(p.brandId) ?? null;
    }
    return {
      id: p._id as string,
      name: p.name,
      nameAr: p.nameAr ?? null,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stock: p.stock,
      isFeatured: p.isFeatured,
      createdAt: p._creationTime,
      brand: brand ? { name: brand.name, slug: brand.slug } : null,
      images: p.images.slice(0, 2).map((i) => ({ key: i.key, alt: i.alt ?? null, altAr: i.altAr ?? null, width: i.width ?? null, height: i.height ?? null })),
    };
  };
}
export type ProductCard = Awaited<ReturnType<ReturnType<typeof makeCardLoader>>>;

export const opt = <T>(v: T | null | undefined): T | undefined => (v === null || v === undefined || v === "" ? undefined : v);
