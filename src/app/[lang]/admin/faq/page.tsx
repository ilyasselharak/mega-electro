import { PageHeader } from "@/components/admin/page-header";
import { FaqManager } from "./faq-manager";
import { getTaxonomyOptions, listFaqs } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  await requireStaffPage();
  const [faqs, { categories }] = await Promise.all([listFaqs(), getTaxonomyOptions()]);
  return (
    <>
      <PageHeader title="Questions fréquentes" description="Questions affichées sur les fiches produit : pour toute la boutique ou pour une catégorie. Les questions propres à un produit se gèrent dans sa fiche." />
      <FaqManager faqs={faqs} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
