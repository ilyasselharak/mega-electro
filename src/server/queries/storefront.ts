import "server-only";
import { unstable_cache } from "next/cache";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { publicQuery } from "@/lib/convex";
import { logger } from "@/lib/logger";
import { TAGS } from "@/server/cache";
import { getNavCategories, listProducts, type ProductCardData } from "@/server/queries/catalog";

const CACHE = { tags: [TAGS.catalog], revalidate: 600 };
const V = "v1";

export type Storefront = NonNullable<FunctionReturnType<typeof api.catalog.storefront>>;
const EMPTY: Storefront = { banners: [], collections: [], sections: [], theme: null };

/**
 * Homepage merchandising (Admin → Vitrine). Falls back to an empty configuration when the
 * Convex functions are not deployed yet, so the storefront never breaks on a code/backend mismatch.
 */
export const getStorefront = unstable_cache(
  async (): Promise<Storefront> => {
    try {
      return (await publicQuery(api.catalog.storefront, {})) ?? EMPTY;
    } catch (err) {
      logger.warn("storefront query unavailable, using defaults", { err: String(err) });
      return EMPTY;
    }
  },
  ["storefront", V],
  CACHE,
);

/** Fresh cards for saved product ids (wishlist, recently viewed). Never cached: prices and stock must be current. */
export async function getProductCards(ids: string[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  try {
    return await publicQuery(api.catalog.productCards, { ids });
  } catch {
    // Older backend: same live price and stock, without brand or original price (never guessed).
    const rows = await publicQuery(api.catalog.productsForCart, { ids });
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      nameAr: null,
      slug: p.slug,
      price: p.price,
      compareAtPrice: null,
      stock: p.stock,
      isFeatured: false,
      createdAt: 0,
      brand: null,
      images: p.images.map((i) => ({ key: i.key, alt: null, altAr: null, width: null, height: null })),
    }));
  }
}

/**
 * Photo for each top-level category: its own image when set in Admin, else the photo of its
 * best-selling in-stock product (a real product of that category, never a stock picture).
 */
export const getCategoryCovers = unstable_cache(
  async (): Promise<Record<string, { key: string; alt: string | null } | null>> => {
    const cats = await getNavCategories();
    const entries = await Promise.all(
      cats.map(async (c) => {
        if (c.imageKey) return [c.id, { key: c.imageKey, alt: c.imageAlt }] as const;
        const r = await listProducts({ categoryId: c.id, includeChildCategories: c.children.map((ch) => ch.id), inStock: true, sort: "meilleures-ventes" });
        const img = r.items.find((p) => p.images.length)?.images[0];
        return [c.id, img ? { key: img.key, alt: null } : null] as const;
      }),
    );
    return Object.fromEntries(entries);
  },
  ["category-covers", V],
  CACHE,
);

/** Brands ranked by number of active products (from the catalog facets), with their logos. */
export const getBrandRanking = unstable_cache(
  async () => {
    const r = await listProducts({});
    return r.facets.brands.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
  },
  ["brand-ranking", V],
  CACHE,
);
