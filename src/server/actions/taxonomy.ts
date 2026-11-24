"use server";

import { revalidatePath } from "next/cache";
import { api } from "@convex/_generated/api";
import { deleteImages } from "@convex/lib/cloudinary";
import { fetchAuthMutation } from "@/lib/convex";
import { assertStaff } from "@/lib/session";
import { brandFormSchema, categoryFormSchema, type BrandFormInput, type CategoryFormInput } from "@/lib/validators/catalog";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, UserFacingError, type ActionResult } from "./result";

const cleanup = (key: string | null) => (key ? deleteImages([key]) : Promise.resolve());

export async function saveCategory(id: string | null, input: CategoryFormInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertStaff();
    const data = categoryFormSchema.parse(input);
    if (data.imageKey && !data.imageKey.startsWith("mega-electro/categories/")) throw new UserFacingError("Image invalide.");
    const res = await fetchAuthMutation(api.taxonomy.saveCategory, {
      id,
      data: {
        name: data.name,
        nameAr: data.nameAr ?? null,
        slug: data.slug,
        description: data.description ?? null,
        parentId: data.parentId || null,
        icon: data.icon ?? null,
        position: data.position,
        isActive: data.isActive,
        imageKey: data.imageKey || null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });
    await cleanup(res.replacedKey);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/categories");
    return ok({ id: res.id });
  } catch (err) {
    return toActionError(err, "saveCategory");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await assertStaff();
    const res = await fetchAuthMutation(api.taxonomy.deleteCategory, { id });
    await cleanup(res.replacedKey);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/categories");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "deleteCategory");
  }
}

export async function saveBrand(id: string | null, input: BrandFormInput): Promise<ActionResult<{ id: string }>> {
  try {
    await assertStaff();
    const data = brandFormSchema.parse(input);
    if (data.logoKey && !data.logoKey.startsWith("mega-electro/brands/")) throw new UserFacingError("Image invalide.");
    const res = await fetchAuthMutation(api.taxonomy.saveBrand, {
      id,
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        isActive: data.isActive,
        logoKey: data.logoKey || null,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });
    await cleanup(res.replacedKey);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/brands");
    return ok({ id: res.id });
  } catch (err) {
    return toActionError(err, "saveBrand");
  }
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    await assertStaff();
    const res = await fetchAuthMutation(api.taxonomy.deleteBrand, { id });
    await cleanup(res.replacedKey);
    invalidate(TAGS.catalog);
    revalidatePath("/admin/brands");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "deleteBrand");
  }
}
