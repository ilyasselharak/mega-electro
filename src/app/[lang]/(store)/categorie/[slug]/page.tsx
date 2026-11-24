import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductListing } from "@/components/store/product-listing";
import { Link } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { getCategoryBySlug, listProducts } from "@/server/queries/catalog";
import { getSeoSettings } from "@/server/queries/seo";
import { parseListingParams } from "@/lib/listing-params";
import { keywordList, pagedPath, pagedTitle } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { imageUrl } from "@/lib/images";
import { truncate } from "@/lib/utils";

export async function generateMetadata({ params, searchParams }: PageProps<"/[lang]/categorie/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [category, seo, locale] = await Promise.all([getCategoryBySlug(slug), getSeoSettings(), getLocale()]);
  if (!category) return {};
  const t = await getDictionary(locale);
  const { hasFilters, page } = parseListingParams(await searchParams);
  const meta = category.seo;
  const name = localName(locale, category);
  const ogKey = meta.ogImageKey ?? category.imageKey;
  const fallbackDesc = fmt(t.listing.categoryDescription, { name: locale === "fr" ? name.toLowerCase() : name, site: locale === "ar" ? t.brand.name : seo.siteName });
  // Arabic pages use the Arabic SEO fields from Admin → SEO, else Arabic fallbacks (never the French text).
  const title = locale === "ar" ? meta.titleAr || fmt(t.listing.categoryTitle, { name }) : category.metaTitle ?? fmt(t.listing.categoryTitle, { name });
  const description = locale === "ar" ? meta.metaDescriptionAr || fallbackDesc : category.metaDescription ?? (category.description ? truncate(category.description, 160) : fallbackDesc);
  return localizedMetadata({
    title: pagedTitle(title, page, t.listing.pageSuffix),
    description,
    path: pagedPath(`/categorie/${category.slug}`, page),
    // A custom canonical only applies to the unfiltered first page.
    canonical: page && page > 1 ? null : meta.canonicalUrl,
    image: ogKey ? imageUrl(ogKey, 1200) : undefined,
    imageAlt: meta.imageAlt,
    keywords: keywordList(locale === "ar" ? meta.keywordsAr : meta.keywords),
    ogTitle: locale === "ar" ? null : meta.ogTitle,
    ogDescription: locale === "ar" ? null : meta.ogDescription,
    // Filtered/sorted variants stay out of the index; pagination stays indexable.
    noIndex: hasFilters || meta.noindex,
    noFollow: meta.nofollow,
    seo,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/categorie/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const [category, locale] = await Promise.all([getCategoryBySlug(slug), getLocale()]);
  if (!category) notFound();
  const t = await getDictionary(locale);

  const { hasFilters, ...listing } = parseListingParams(sp);
  const result = await listProducts({ ...listing, categoryId: category.id, includeChildCategories: category.children.map((c) => c.id) });
  // Out-of-range pagination is a real 404, not an empty 200 page.
  if ((listing.page ?? 1) > result.pageCount) notFound();
  const meta = category.seo;
  const name = localName(locale, category);
  const firstPage = (listing.page ?? 1) === 1 && !hasFilters;
  const intro = locale === "ar" ? meta.metaDescriptionAr : category.description;
  const longText = locale === "ar" ? meta.descriptionAr : meta.longDescription;
  const h1 = locale === "ar" ? name : meta.h1 || name;

  const crumbs = [
    ...(category.parent ? [{ name: localName(locale, category.parent), path: `/categorie/${category.parent.slug}` }] : []),
    { name, path: `/categorie/${category.slug}` },
  ];

  return (
    <div className="container-page space-y-6 py-6 sm:py-8">
      <Breadcrumbs items={crumbs} />
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{h1}</h1>
        {intro ? <p className="max-w-3xl leading-7 text-muted-foreground">{intro}</p> : null}
        {category.children.length ? (
          <nav aria-label={t.listing.subcategories}>
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pt-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
              {category.children.map((c) => (
                <li key={c.id} className="shrink-0">
                  <Link href={`/categorie/${c.slug}`} className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
                    {localName(locale, c)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>
      <ProductListing result={result} basePath={`/categorie/${category.slug}`} searchParams={sp} />

      {/* SEO copy: only on the first, unfiltered page to avoid duplicate content across pages. */}
      {firstPage && longText ? (
        <section className="max-w-3xl space-y-4 border-t pt-8">
          <h2 className="text-xl font-bold">{fmt(t.listing.buyingGuide, { name })}</h2>
          <div className="prose-store">
            {longText.split(/\n{2,}/).map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
          </div>
          {category.parent ? (
            <p className="text-sm text-muted-foreground">
              {t.listing.seeAlso} : <Link href={`/categorie/${category.parent.slug}`} className="font-medium text-primary hover:underline">{localName(locale, category.parent)}</Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
