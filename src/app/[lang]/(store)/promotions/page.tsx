import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductListing } from "@/components/store/product-listing";
import { listProducts } from "@/server/queries/catalog";
import { parseListingParams } from "@/lib/listing-params";
import { pagedPath, pagedTitle } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { getSeoSettings } from "@/server/queries/seo";
import { getDictionary } from "@/i18n/server";


export async function generateMetadata({ searchParams }: PageProps<"/[lang]/promotions">): Promise<Metadata> {
  const [{ hasFilters, page }, seo, t] = await Promise.all([searchParams.then(parseListingParams), getSeoSettings(), getDictionary()]);
  return localizedMetadata({
    title: pagedTitle(t.listing.promotionsMetaTitle, page, t.listing.pageSuffix),
    description: t.listing.promotionsMetaDescription,
    path: pagedPath("/promotions", page),
    noIndex: hasFilters,
    seo,
  });
}

export default async function PromotionsPage({ searchParams }: PageProps<"/[lang]/promotions">) {
  const sp = await searchParams;
  const t = await getDictionary();
  const { hasFilters: _h, ...listing } = parseListingParams(sp);
  const result = await listProducts({ ...listing, onSale: true });
  // Out-of-range pagination is a real 404, not an empty 200 page.
  if ((listing.page ?? 1) > result.pageCount) notFound();
  return (
    <div className="container-page space-y-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ name: t.listing.promotionsTitle, path: "/promotions" }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t.listing.promotionsTitle}</h1>
        <p className="text-muted-foreground">{t.listing.promotionsIntro}</p>
      </header>
      <ProductListing result={result} basePath="/promotions" searchParams={sp} />
    </div>
  );
}
