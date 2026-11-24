import type { ListingParams, SortOption } from "@/server/queries/catalog";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const SORTS: SortOption[] = ["pertinence", "nouveautes", "prix-asc", "prix-desc", "meilleures-ventes"];

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** Parses filter state from the URL — prices in the URL are dirhams. */
export function parseListingParams(sp: SearchParamsRecord): ListingParams & { hasFilters: boolean } {
  const brands = (first(sp.marque) ?? "").split(",").map((s) => s.trim()).filter((s) => /^[a-z0-9-]{1,96}$/.test(s)).slice(0, 20);
  const min = Number(first(sp.min));
  const max = Number(first(sp.max));
  const sort = first(sp.tri) as SortOption | undefined;
  const page = Number.parseInt(first(sp.page) ?? "1", 10);
  const q = first(sp.q)?.trim().slice(0, 80);
  const params: ListingParams = {
    brandSlugs: brands.length ? brands : undefined,
    minPrice: Number.isFinite(min) && min > 0 ? Math.round(min * 100) : undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? Math.round(max * 100) : undefined,
    inStock: first(sp.stock) === "1" || undefined,
    onSale: first(sp.promo) === "1" || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
    q: q || undefined,
  };
  return {
    ...params,
    // Pagination is not a filter: /categorie/x?page=2 is self-canonical and indexable.
    hasFilters: Boolean(params.brandSlugs || params.minPrice || params.maxPrice || params.inStock || params.onSale || params.sort),
  };
}
