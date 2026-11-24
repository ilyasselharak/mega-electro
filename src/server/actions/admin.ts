"use server";

import { revalidatePath } from "next/cache";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/lib/convex";
import { assertAdmin, assertStaff } from "@/lib/session";
import { toCentimes } from "@/lib/money";
import { settingsSchema, stockAdjustmentSchema, type SettingsInput } from "@/lib/validators/orders";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, UserFacingError, type ActionResult } from "./result";

export async function adjustStock(input: { productId: string; delta: number; reason: string; note?: string }): Promise<ActionResult<{ stock: number }>> {
  try {
    await assertStaff();
    const data = stockAdjustmentSchema.parse(input);
    const stock = await fetchAuthMutation(api.products.adjustStock, { productId: data.productId, delta: data.delta, reason: data.reason, note: data.note || undefined });
    invalidate(TAGS.catalog);
    revalidatePath("/admin/inventory");
    return ok({ stock });
  } catch (err) {
    return toActionError(err, "adjustStock");
  }
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    const d = settingsSchema.parse(input);
    await fetchAuthMutation(api.settings.save, {
      ...d,
      shippingFee: toCentimes(d.shippingFee),
      freeShippingThreshold: toCentimes(d.freeShippingThreshold),
      announcement: d.announcement || null,
      facebookUrl: d.facebookUrl || null,
      instagramUrl: d.instagramUrl || null,
      tiktokUrl: d.tiktokUrl || null,
    });
    invalidate(TAGS.settings);
    revalidatePath("/", "layout");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "saveSettings");
  }
}

export async function setUserRole(userId: string, role: "CUSTOMER" | "STAFF" | "ADMIN"): Promise<ActionResult> {
  try {
    await assertAdmin();
    if (!["CUSTOMER", "STAFF", "ADMIN"].includes(role)) throw new UserFacingError("Rôle invalide.");
    await fetchAuthMutation(api.users.setRole, { userId, role });
    revalidatePath("/admin/customers");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "setUserRole");
  }
}
