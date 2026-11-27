"use server";

import { revalidatePath } from "next/cache";
import { api } from "@convex/_generated/api";
import { deleteImages } from "@convex/lib/cloudinary";
import { fetchAuthMutation } from "@/lib/convex";
import { assertAdmin, assertStaff } from "@/lib/session";
import { entitySeoFormSchema, redirectFormSchema, seoSettingsFormSchema, type EntitySeoFormInput, type RedirectFormInput, type SeoSettingsFormInput } from "@/lib/validators/seo";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, UserFacingError, type ActionResult } from "./result";

type Kind = "category" | "product";

const blankToUndefined = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === "" || v === null ? undefined : v])) as { [K in keyof T]: Exclude<T[K], null> | undefined };

function refreshSeoPaths() {
  revalidatePath("/admin/seo", "layout");
}

export async function saveSeoSettings(input: SeoSettingsFormInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    const d = seoSettingsFormSchema.parse(input);
    // Empty strings are kept (an admin may clear a default); only missing images become undefined.
    const args = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v === null ? undefined : v])) as { [K in keyof typeof d]: Exclude<(typeof d)[K], null> | undefined };
    const { replacedKeys } = await fetchAuthMutation(api.seo.saveSettings, args);
    await deleteImages(replacedKeys);
    invalidate(TAGS.seo);
    revalidatePath("/", "layout");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "saveSeoSettings");
  }
}

export async function saveEntitySeo(kind: Kind, id: string, input: EntitySeoFormInput): Promise<ActionResult<{ path: string }>> {
  try {
    await assertStaff();
    const d = entitySeoFormSchema.parse(input);
    const { noindex, nofollow, ...rest } = d.seo;
    const res = await fetchAuthMutation(api.seo.updateEntity, {
      kind,
      id,
      data: {
        name: kind === "category" ? d.name : undefined,
        slug: d.slug,
        shortText: d.shortText,
        longText: d.longText,
        metaTitle: d.metaTitle,
        metaDescription: d.metaDescription,
        seo: { ...blankToUndefined(rest), noindex, nofollow },
        imageAlts: kind === "product" ? d.imageAlts : undefined,
      },
    });
    if (res.replacedKey) await deleteImages([res.replacedKey]);
    invalidate(TAGS.catalog);
    refreshSeoPaths();
    revalidatePath(kind === "category" ? "/admin/categories" : "/admin/products", "layout");
    return ok({ path: res.path });
  } catch (err) {
    return toActionError(err, "saveEntitySeo");
  }
}

/** Fills only EMPTY fields with suggestions for the selected rows (admin-confirmed). */
export async function applySeoSuggestions(kind: Kind, ids: string[]): Promise<ActionResult<{ filled: number; touched: number }>> {
  try {
    await assertStaff();
    const res = await fetchAuthMutation(api.seo.applySuggestions, { kind, ids: ids.slice(0, 500) });
    invalidate(TAGS.catalog);
    refreshSeoPaths();
    return ok(res);
  } catch (err) {
    return toActionError(err, "applySeoSuggestions");
  }
}

export async function setSeoRobots(kind: Kind, ids: string[], noindex: boolean): Promise<ActionResult> {
  try {
    await assertStaff();
    await fetchAuthMutation(api.seo.setRobots, { kind, ids: ids.slice(0, 500), noindex });
    invalidate(TAGS.catalog);
    refreshSeoPaths();
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "setSeoRobots");
  }
}

export async function saveRedirect(id: string | null, input: RedirectFormInput): Promise<ActionResult> {
  try {
    await assertStaff();
    const d = redirectFormSchema.parse(input);
    await fetchAuthMutation(api.seo.saveRedirect, { id, from: d.from, to: d.to, statusCode: d.statusCode, note: d.note || undefined });
    refreshSeoPaths();
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "saveRedirect");
  }
}

export async function deleteRedirect(id: string): Promise<ActionResult> {
  try {
    await assertStaff();
    await fetchAuthMutation(api.seo.deleteRedirect, { id });
    refreshSeoPaths();
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "deleteRedirect");
  }
}

/** Undo a bulk SEO batch (fields edited since the batch are left untouched and reported). */
export async function rollbackSeoBatch(batchId: string): Promise<ActionResult<{ restored: number; conflicts: string[] }>> {
  try {
    await assertAdmin();
    if (!/^[a-z0-9-]{3,60}$/.test(batchId)) throw new UserFacingError("Lot invalide.");
    const res = await fetchAuthMutation(api.seoBulk.rollbackBatchAdmin, { batchId });
    invalidate(TAGS.catalog);
    revalidatePath("/admin/seo/historique");
    return ok(res);
  } catch (err) {
    return toActionError(err, "rollbackSeoBatch");
  }
}
