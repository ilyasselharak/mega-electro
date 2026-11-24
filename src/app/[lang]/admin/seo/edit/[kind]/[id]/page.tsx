import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { SeoEntityForm, type SuggestionSource } from "@/components/admin/seo/seo-entity-form";
import { getSeoEntity, getSeoOverview } from "@/server/queries/seo";
import { siteBase } from "@/lib/seo";

export const metadata = { title: "Modifier le SEO" };

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export default async function EditSeoPage({ params }: PageProps<"/[lang]/admin/seo/edit/[kind]/[id]">) {
  const { kind, id } = await params;
  if (kind !== "category" && kind !== "product") notFound();
  const [entity, overview] = await Promise.all([getSeoEntity(kind, id), getSeoOverview()]);
  if (!entity) notFound();

  // Titles/descriptions of the other visible pages, for live duplicate detection.
  const others = [
    ...overview.categories.filter((c) => c.isActive && !c.seo.noindex && !(kind === "category" && c.id === id)),
    ...overview.products.filter((p) => p.status === "ACTIVE" && !p.seo.noindex && !(kind === "product" && p.id === id)),
  ];

  let source: SuggestionSource;
  if (kind === "category") {
    const c = overview.categories.find((x) => x.id === id)!;
    source = { kind, name: c.name, parentName: c.parentName, childNames: c.childNames, brandNames: c.brandNames, productCount: c.productCount, hasImage: Boolean(c.imageKey) };
  } else {
    const p = overview.products.find((x) => x.id === id)!;
    source = { kind, name: p.name, brandName: p.brandName, categoryName: p.categoryName, price: p.price, shortDescription: p.shortDescription, images: p.images };
  }

  const s = entity.seo;
  return (
    <>
      <PageHeader title={entity.name} description={kind === "category" ? "SEO de la catégorie" : "SEO du produit"} />
      <SeoEntityForm
        key={String(entity.updatedAt)}
        kind={kind}
        id={entity.id}
        imageKey={entity.imageKey}
        publicPath={entity.publicPath}
        isPublic={entity.isPublic}
        siteName={overview.settings.siteName}
        freeShippingThreshold={overview.store.freeShippingThreshold}
        siteUrl={siteBase(overview.settings)}
        others={{ titles: others.map((o) => o.metaTitle).filter((t): t is string => Boolean(t)).map(norm), descriptions: others.map((o) => o.metaDescription).filter((d): d is string => Boolean(d)).map(norm) }}
        source={source}
        initial={{
          name: kind === "category" ? entity.name : undefined,
          slug: entity.slug,
          metaTitle: entity.metaTitle,
          metaDescription: entity.metaDescription,
          shortText: entity.shortText,
          longText: entity.longText,
          imageAlts: entity.images,
          seo: {
            h1: s.h1 ?? "",
            canonicalUrl: s.canonicalUrl ?? "",
            keywords: s.keywords ?? "",
            titleAr: s.titleAr ?? "",
            metaDescriptionAr: s.metaDescriptionAr ?? "",
            descriptionAr: s.descriptionAr ?? "",
            keywordsAr: s.keywordsAr ?? "",
            ogTitle: s.ogTitle ?? "",
            ogDescription: s.ogDescription ?? "",
            ogImageKey: s.ogImageKey ?? null,
            imageAlt: s.imageAlt ?? "",
            noindex: s.noindex ?? false,
            nofollow: s.nofollow ?? false,
          },
        }}
      />
    </>
  );
}
