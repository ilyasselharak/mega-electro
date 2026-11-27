"use server";

import { revalidatePath } from "next/cache";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/lib/convex";
import { assertAdmin } from "@/lib/session";
import { storefrontSchema, type StorefrontInput } from "@/lib/validators/storefront";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, type ActionResult } from "./result";

/** Admin → Vitrine: banners, collections, homepage section order and theme colours. */
export async function saveStorefront(input: StorefrontInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    const d = storefrontSchema.parse(input);
    const theme = d.theme.accent || d.theme.navy ? { accent: d.theme.accent, navy: d.theme.navy } : undefined;
    // JSON round-trip drops undefined optional fields (Convex validators reject explicit undefined).
    const args = JSON.parse(JSON.stringify({ banners: d.banners, collections: d.collections, sections: d.sections, theme }));
    await fetchAuthMutation(api.settings.saveStorefront, args);
    invalidate(TAGS.catalog);
    revalidatePath("/", "layout");
    revalidatePath("/admin/vitrine");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "saveStorefront");
  }
}
