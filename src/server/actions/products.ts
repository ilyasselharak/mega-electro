"use server";

import { revalidatePath } from "next/cache";
import { api } from "@convex/_generated/api";
import { deleteImages } from "@convex/lib/cloudinary";
import { fetchAuthMutation } from "@/lib/convex";
import { assertStaff } from "@/lib/session";
import { toCentimes } from "@/lib/money";
import { productFormSchema, type ProductFormInput } from "@/lib/validators/catalog";
import { invalidate, TAGS } from "@/server/cache";
import type { ProductStatus } from "@/lib/types";
import { ok, toActionError, UserFacingError, type ActionResult } from "./result";

const cents = (v: number | null | undefined) => (v == null || v === 0 ? null : toCentimes(v));
const IMAGE_PREFIX = "mega-electro/products/";

export async function saveProduct(id: string | null, input: ProductFormInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await assertStaff();
    const data = productFormSchema.parse(input);
    for (const img of data.images) if (!img.key.startsWith(IMAGE_PREFIX)) throw new UserFacingError("Image invalide.");

    const res = await fetchAuthMutation(api.products.save, {
      id,
      data: {
        name: data.name,
        nameAr: data.nameAr ?? null,
        faq: data.faq.map((f) => ({ question: f.question, answer: f.answer, questionAr: f.questionAr, answerAr: f.answerAr })),
        slug: data.slug,
        sku: data.sku,
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        price: toCentimes(data.price),
        compareAtPrice: cents(data.compareAtPrice),
        costPrice: cents(data.costPrice),
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        status: data.status,
        isFeatured: data.isFeatured,
        warrantyMonths: data.warrantyMonths ?? null,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        specs: data.specs,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        images: data.images.map((img) => ({
          key: img.key,
          alt: img.alt?.trim() || undefined,
          width: img.width ?? undefined,
          height: img.height ?? undefined,
          size: img.size ?? undefined,
          mimeType: img.mimeType ?? undefined,
        })),
      },
    });

    // Storage cleanup happens after the DB commit; failures are only logged.
    await deleteImages(res.removedKeys);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/products");
    return ok({ id: res.id, slug: res.slug });
  } catch (err) {
    return toActionError(err, "saveProduct");
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await assertStaff();
    const { removedKeys } = await fetchAuthMutation(api.products.remove, { id });
    await deleteImages(removedKeys);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/products");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "deleteProduct");
  }
}

export async function setProductStatus(ids: string[], status: ProductStatus): Promise<ActionResult> {
  try {
    await assertStaff();
    await fetchAuthMutation(api.products.setStatus, { ids, status });
    invalidate(TAGS.catalog);
    revalidatePath("/admin/products");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "setProductStatus");
  }
}

export async function duplicateProduct(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await assertStaff();
    const copyId = await fetchAuthMutation(api.products.duplicate, { id });
    revalidatePath("/admin/products");
    return ok({ id: copyId });
  } catch (err) {
    return toActionError(err, "duplicateProduct");
  }
}
