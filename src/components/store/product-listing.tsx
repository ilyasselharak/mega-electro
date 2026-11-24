import { ProductGrid } from "@/components/store/product-card";
import { ActiveFilters, EmptyResults, ListingSidebar, ListingToolbar } from "@/components/store/listing-filters";
import { PaginationNav } from "@/components/store/pagination-nav";
import { JsonLd } from "@/components/shared/json-ld";
import { localizePath, localName } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { itemListJsonLd } from "@/lib/seo";
import type { ListingResult } from "@/server/queries/catalog";
import { getSeoSettings } from "@/server/queries/seo";

export async function ProductListing({ result, basePath, searchParams }: { result: ListingResult; basePath: string; searchParams: Record<string, string | string[] | undefined> }) {
  const [seo, locale] = await Promise.all([getSeoSettings(), getLocale()]);
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <ListingSidebar facets={result.facets} />
      <div className="min-w-0 space-y-5">
        <ListingToolbar total={result.total} facets={result.facets} />
        <ActiveFilters brands={result.facets.brands} />
        {result.items.length ? (
          <>
            {seo.sdItemList ? <JsonLd data={itemListJsonLd(result.items.map((p) => ({ path: localizePath(locale, `/produit/${p.slug}`), name: localName(locale, p) })), seo)} /> : null}
            <ProductGrid products={result.items} priorityCount={4} />
            <PaginationNav page={result.page} pageCount={result.pageCount} basePath={basePath} searchParams={searchParams} />
          </>
        ) : (
          <EmptyResults basePath={basePath} />
        )}
      </div>
    </div>
  );
}
