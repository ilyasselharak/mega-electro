import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductListing } from "@/components/store/product-listing";
import { listProducts } from "@/server/queries/catalog";
import { parseListingParams } from "@/lib/listing-params";
import { pagedPath, pagedTitle } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { getSeoSettings } from "@/server/queries/seo";
import { fmt } from "@/i18n/fmt";
import { getDictionary } from "@/i18n/server";


export async function generateMetadata({ searchParams }: PageProps<"/[lang]/recherche">): Promise<Metadata> {
  const [{ q, hasFilters, page }, seo, t] = await Promise.all([searchParams.then(parseListingParams), getSeoSettings(), getDictionary()]);
  return localizedMetadata({
    title: q ? fmt(t.listing.searchTitle, { q }) : pagedTitle(t.listing.allProductsMetaTitle, page, t.listing.pageSuffix),
    path: q ? "/recherche" : pagedPath("/recherche", page),
    // Internal search results are never indexed (Google guidelines); the full catalogue is.
    noIndex: Boolean(q) || hasFilters,
    seo,
  });
}

export default async function SearchPage({ searchParams }: PageProps<"/[lang]/recherche">) {
  const sp = await searchParams;
  const t = await getDictionary();
  const { hasFilters: _h, ...listing } = parseListingParams(sp);
  const result = await listProducts({ ...listing, q: listing.q?.toLowerCase() });
  // Out-of-range pagination is a real 404, not an empty 200 page.
  if ((listing.page ?? 1) > result.pageCount) notFound();
  return (
    <div className="container-page space-y-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ name: listing.q ? t.listing.search : t.listing.allProductsTitle, path: "/recherche" }]} />
      <h1 className="text-3xl font-extrabold sm:text-4xl">{listing.q ? fmt(t.listing.searchTitle, { q: listing.q }) : t.listing.allProductsTitle}</h1>
      <ProductListing result={result} basePath="/recherche" searchParams={sp} />
    </div>
  );
}
