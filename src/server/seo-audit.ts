import "server-only";
import { auditAll, type AuditInput, type SeoStatus } from "@convex/lib/seoRules";
import type { SeoOverview } from "@/server/queries/seo";

export type SeoRow = {
  kind: "category" | "product";
  id: string;
  name: string;
  context: string | null;
  slug: string;
  publicPath: string;
  isPublic: boolean;
  status: SeoStatus;
  score: number;
  titleLength: number;
  descriptionLength: number;
  effectiveTitle: string;
  metaDescription: string;
  duplicateTitle: boolean;
  duplicateDescription: boolean;
  noindex: boolean;
  hasCanonical: boolean;
  hasArabic: boolean;
  missing: string[];
};

export function buildSeoRows(o: SeoOverview) {
  const inputs: AuditInput[] = [
    ...o.categories.map((c) => ({
      kind: "category" as const,
      id: c.id,
      name: c.name,
      slug: c.slug,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      shortText: c.description,
      longText: c.seo.longDescription ?? null,
      hasImage: Boolean(c.imageKey),
      imagesMissingAlt: 0,
      seo: c.seo,
    })),
    ...o.products.map((p) => ({
      kind: "product" as const,
      id: p.id,
      name: p.name,
      slug: p.slug,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      shortText: p.shortDescription,
      longText: "x".repeat(p.descriptionLength),
      hasImage: p.images.length > 0,
      imagesMissingAlt: p.images.filter((i) => !i.alt?.trim()).length,
      seo: p.seo,
    })),
  ];
  // Duplicates are only meaningful among pages Google can actually see.
  const visible = inputs.filter((i) => (i.kind === "category" ? o.categories.find((c) => c.id === i.id)?.isActive : o.products.find((p) => p.id === i.id)?.status === "ACTIVE"));
  const audits = auditAll(visible, o.settings.siteName);
  const hidden = auditAll(inputs.filter((i) => !visible.includes(i)), o.settings.siteName);

  const row = (i: AuditInput, context: string | null, isPublic: boolean): SeoRow => {
    const a = audits.get(`${i.kind}:${i.id}`) ?? hidden.get(`${i.kind}:${i.id}`)!;
    return {
      kind: i.kind,
      id: i.id,
      name: i.name,
      context,
      slug: i.slug,
      publicPath: `${i.kind === "category" ? "/categorie" : "/produit"}/${i.slug}`,
      isPublic,
      status: a.status,
      score: a.score,
      titleLength: a.titleLength,
      descriptionLength: a.descriptionLength,
      effectiveTitle: a.effectiveTitle,
      metaDescription: a.effectiveDescription,
      duplicateTitle: a.duplicateTitle,
      duplicateDescription: a.duplicateDescription,
      noindex: a.noindex,
      hasCanonical: Boolean(i.seo.canonicalUrl),
      hasArabic: Boolean(i.seo.titleAr || i.seo.descriptionAr),
      missing: a.checks.filter((c) => !c.ok && c.required).map((c) => c.label),
    };
  };

  const categories = o.categories.map((c, idx) => row(inputs[idx], c.parentName ? `Sous-catégorie de ${c.parentName}` : "Catégorie principale", c.isActive));
  const products = o.products.map((p, idx) =>
    row(inputs[o.categories.length + idx], [p.brandName, p.categoryName].filter(Boolean).join(" · ") || null, p.status === "ACTIVE"),
  );
  return { categories, products };
}

export function summarize(rows: SeoRow[]) {
  const visible = rows.filter((r) => r.isPublic);
  return {
    total: rows.length,
    visible: visible.length,
    optimized: visible.filter((r) => r.status === "optimized").length,
    incomplete: visible.filter((r) => r.status === "incomplete").length,
    missing: visible.filter((r) => r.status === "missing").length,
    missingDescription: visible.filter((r) => !r.metaDescription).length,
    duplicateTitles: visible.filter((r) => r.duplicateTitle).length,
    duplicateDescriptions: visible.filter((r) => r.duplicateDescription).length,
    noindex: visible.filter((r) => r.noindex).length,
    averageScore: visible.length ? Math.round(visible.reduce((s, r) => s + r.score, 0) / visible.length) : 0,
  };
}
