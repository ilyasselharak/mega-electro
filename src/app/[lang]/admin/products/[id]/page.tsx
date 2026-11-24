import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ProductRowActions } from "../product-row-actions";
import { getAdminProduct, getTaxonomyOptions } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";
import { toDirhams } from "@/lib/money";

export const metadata = { title: "Modifier le produit" };

export default async function EditProductPage({ params }: PageProps<"/[lang]/admin/products/[id]">) {
  await requireStaffPage();
  const { id } = await params;
  const [product, { categories, brands }] = await Promise.all([getAdminProduct(id), getTaxonomyOptions()]);
  if (!product) notFound();
  return (
    <>
      <PageHeader title={product.name} description={`SKU ${product.sku} · ${product.salesCount} vendu(s)`} actions={<ProductRowActions id={product.id} name={product.name} withLabels />} />
      <ProductForm
        key={String(product.updatedAt)}
        productId={product.id}
        categories={categories}
        brands={brands}
        initial={{
          name: product.name,
          nameAr: product.nameAr ?? "",
          faq: product.faq.map((f) => ({ question: f.question, answer: f.answer, questionAr: f.questionAr ?? "", answerAr: f.answerAr ?? "" })),
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          price: toDirhams(product.price),
          compareAtPrice: product.compareAtPrice != null ? toDirhams(product.compareAtPrice) : null,
          costPrice: product.costPrice != null ? toDirhams(product.costPrice) : null,
          stock: product.stock,
          lowStockThreshold: product.lowStockThreshold,
          status: product.status,
          isFeatured: product.isFeatured,
          warrantyMonths: product.warrantyMonths,
          categoryId: product.categoryId,
          brandId: product.brandId,
          specs: (Array.isArray(product.specs) ? product.specs : []) as { label: string; value: string }[],
          images: product.images.map((i) => ({ id: i.id, key: i.key, thumbKey: i.thumbKey, alt: i.alt ?? "", width: i.width, height: i.height, size: i.size, mimeType: i.mimeType })),
          metaTitle: product.metaTitle ?? "",
          metaDescription: product.metaDescription ?? "",
        }}
      />
    </>
  );
}
