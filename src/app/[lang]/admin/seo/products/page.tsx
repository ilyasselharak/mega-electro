import { PageHeader } from "@/components/admin/page-header";
import { SeoEntityTable, type SeoFilter } from "@/components/admin/seo/seo-entity-table";
import { getSeoOverview } from "@/server/queries/seo";
import { buildSeoRows } from "@/server/seo-audit";

export const metadata = { title: "Produits" };

export default async function SeoProductsPage({ searchParams }: PageProps<"/[lang]/admin/seo/products">) {
  const { filtre } = await searchParams;
  const { products } = buildSeoRows(await getSeoOverview());
  return (
    <>
      <PageHeader title="SEO des produits" description="Métadonnées, textes ALT et indexation de chaque fiche produit. Les produits en brouillon ou archivés ne sont pas visibles par Google." />
      <SeoEntityTable kind="product" rows={products} initialFilter={(typeof filtre === "string" ? filtre : "all") as SeoFilter} />
    </>
  );
}
