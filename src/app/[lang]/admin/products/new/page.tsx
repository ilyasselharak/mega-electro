import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getTaxonomyOptions } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";

export const metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  await requireStaffPage();
  const { categories, brands } = await getTaxonomyOptions();
  return (
    <>
      <PageHeader title="Nouveau produit" />
      <ProductForm
        productId={null}
        categories={categories}
        brands={brands}
        initial={{ name: "", nameAr: "", faq: [], slug: "", sku: "", shortDescription: "", description: "", price: 0, compareAtPrice: null, costPrice: null, stock: 0, lowStockThreshold: 3, status: "DRAFT", isFeatured: false, warrantyMonths: 24, categoryId: null, brandId: null, specs: [], images: [], metaTitle: "", metaDescription: "" }}
      />
    </>
  );
}
