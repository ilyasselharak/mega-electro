import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductListing } from "@/components/store/product-listing";
import { getBrandBySlug, listProducts } from "@/server/queries/catalog";
import { parseListingParams } from "@/lib/listing-params";
import { pagedPath, pagedTitle } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { getSeoSettings } from "@/server/queries/seo";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/marque/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [brand, seo, locale] = await Promise.all([getBrandBySlug(slug), getSeoSettings(), getLocale()]);
  if (!brand) return {};
  const t = await getDictionary(locale);
  const { hasFilters, page } = parseListingParams(await searchParams);
  const fr = locale === "fr";
  return localizedMetadata({
    title: pagedTitle((fr ? brand.metaTitle : null) ?? fmt(t.listing.brandTitle, { name: brand.name }), page, t.listing.pageSuffix),
    description: (fr ? brand.metaDescription : null) ?? fmt(t.listing.brandDescription, { name: brand.name, site: fr ? seo.siteName : t.brand.name }),
    path: pagedPath(`/marque/${brand.slug}`, page),
    noIndex: hasFilters,
    seo,
  });
}

export default async function BrandPage({ params, searchParams }: PageProps<"/[lang]/marque/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const { hasFilters: _h, brandSlugs: _b, ...listing } = parseListingParams(sp);
  const result = await listProducts({ ...listing, brandId: brand.id });
  // Out-of-range pagination is a real 404, not an empty 200 page.
  if ((listing.page ?? 1) > result.pageCount) notFound();
  return (
    <div className="container-page space-y-6 py-6 sm:py-8">
      <Breadcrumbs items={[{ name: brand.name, path: `/marque/${brand.slug}` }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{brand.name}</h1>
        {brand.description && (await getLocale()) === "fr" ? <p className="max-w-3xl text-muted-foreground">{brand.description}</p> : null}
      </header>
      <ProductListing result={result} basePath={`/marque/${brand.slug}`} searchParams={sp} />
    </div>
  );
}
