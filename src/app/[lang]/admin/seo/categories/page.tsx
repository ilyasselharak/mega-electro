import { PageHeader } from "@/components/admin/page-header";
import { SeoEntityTable, type SeoFilter } from "@/components/admin/seo/seo-entity-table";
import { getSeoOverview } from "@/server/queries/seo";
import { buildSeoRows } from "@/server/seo-audit";

export const metadata = { title: "Catégories" };

export default async function SeoCategoriesPage({ searchParams }: PageProps<"/[lang]/admin/seo/categories">) {
  const { filtre } = await searchParams;
  const { categories } = buildSeoRows(await getSeoOverview());
  return (
    <>
      <PageHeader title="SEO des catégories" description="Toutes les catégories et sous-catégories. Sélectionnez des lignes pour compléter les champs vides ou changer l'indexation." />
      <SeoEntityTable kind="category" rows={categories} initialFilter={(typeof filtre === "string" ? filtre : "all") as SeoFilter} />
    </>
  );
}
