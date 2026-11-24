import "server-only";
import { unstable_cache } from "next/cache";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { publicQuery } from "@/lib/convex";
import { TAGS } from "@/server/cache";

// Public storefront reads, cached and invalidated by the "catalog" tag after admin changes.
const CACHE = { tags: [TAGS.catalog], revalidate: 600 };
/**
 * Bump when the shape of a cached Convex result changes: the data cache survives deployments
 * (Vercel), so old-shaped entries would otherwise be served to new code.
 */
const V = "v3";

export type ProductCardData = FunctionReturnType<typeof api.catalog.homeCollections>["featured"][number];

export const getNavCategories = unstable_cache(() => publicQuery(api.catalog.navCategories, {}), ["nav-categories", V], CACHE);
export type NavCategory = Awaited<ReturnType<typeof getNavCategories>>[number];

export const getActiveBrands = unstable_cache(() => publicQuery(api.catalog.activeBrands, {}), ["active-brands", V], CACHE);

export const getHomeCollections = unstable_cache(() => publicQuery(api.catalog.homeCollections, {}), ["home-collections", V], CACHE);

export const getProductBySlug = unstable_cache((slug: string) => publicQuery(api.catalog.productBySlug, { slug }), ["product-by-slug", V], CACHE);
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export const getRelatedProducts = unstable_cache(
  (productId: string, categoryId: string | null, brandId: string | null) =>
    publicQuery(api.catalog.relatedProducts, { productId, categoryId: categoryId ?? undefined, brandId: brandId ?? undefined }),
  ["related-products", V],
  CACHE,
);

export type SortOption = "pertinence" | "nouveautes" | "prix-asc" | "prix-desc" | "meilleures-ventes";

export interface ListingParams {
  categoryId?: string;
  includeChildCategories?: string[];
  brandId?: string;
  brandSlugs?: string[];
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: SortOption;
  page?: number;
}

/** Drops undefined keys (Convex rejects explicit undefined in some validators). */
function clean<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export const listProducts = unstable_cache((params: ListingParams) => publicQuery(api.catalog.listProducts, clean(params)), ["list-products", V], CACHE);
export type ListingResult = Awaited<ReturnType<typeof listProducts>>;

export const searchSuggestions = unstable_cache((q: string) => publicQuery(api.catalog.searchSuggestions, { q }), ["search-suggestions", V], { ...CACHE, revalidate: 300 });

export const getCategoryBySlug = unstable_cache((slug: string) => publicQuery(api.catalog.categoryBySlug, { slug }), ["category-by-slug", V], CACHE);

export const getBrandBySlug = unstable_cache((slug: string) => publicQuery(api.catalog.brandBySlug, { slug }), ["brand-by-slug", V], CACHE);

/** Never cached — used to price the cart and at checkout. */
export function getProductsForCart(ids: string[]) {
  if (!ids.length) return Promise.resolve([]);
  return publicQuery(api.catalog.productsForCart, { ids });
}

export const getSitemapData = unstable_cache(() => publicQuery(api.catalog.sitemap, {}), ["sitemap-data", V], { ...CACHE, revalidate: 3600 });
