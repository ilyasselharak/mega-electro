"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/lib/convex";
import { assertAdmin, assertStaff } from "@/lib/session";
import { toCentimes } from "@/lib/money";
import { faqEntrySchema } from "@/lib/validators/catalog";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, type ActionResult } from "./result";

// Delivery zones, payment switches and FAQs (Admin → Livraison & paiement, Admin → FAQ).

const zoneSchema = z.object({
  city: z.string().trim().min(2, "Ville requise").max(80),
  cityAr: z.string().trim().max(80).optional(),
  fee: z.coerce.number().min(0, "Frais invalides").max(100_000),
  freeThreshold: z.union([z.literal(""), z.coerce.number().min(0)]).optional(),
  etaMinDays: z.coerce.number().int().min(0).max(60),
  etaMaxDays: z.coerce.number().int().min(0).max(60),
  codAvailable: z.boolean(),
  isActive: z.boolean(),
  position: z.coerce.number().int().min(0).max(9999),
}).refine((d) => d.etaMinDays <= d.etaMaxDays, { message: "Délai min ≤ max", path: ["etaMaxDays"] });
export type ZoneInput = z.input<typeof zoneSchema>;

function refreshStorefront() {
  invalidate(TAGS.settings); // delivery config is cached under the settings tag
  revalidatePath("/admin/livraison");
}

export async function saveZone(id: string | null, input: ZoneInput): Promise<ActionResult> {
  try {
    await assertAdmin();
    const d = zoneSchema.parse(input);
    await fetchAuthMutation(api.delivery.saveZone, {
      id,
      city: d.city,
      cityAr: d.cityAr || undefined,
      fee: toCentimes(d.fee),
      freeThreshold: d.freeThreshold === "" || d.freeThreshold == null ? null : toCentimes(d.freeThreshold),
      etaMinDays: d.etaMinDays,
      etaMaxDays: d.etaMaxDays,
      codAvailable: d.codAvailable,
      isActive: d.isActive,
      position: d.position,
    });
    refreshStorefront();
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "saveZone");
  }
}

export async function deleteZone(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await fetchAuthMutation(api.delivery.deleteZone, { id });
    refreshStorefront();
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "deleteZone");
  }
}

export async function savePaymentSettings(input: { codEnabled: boolean; acceptUnlistedCities: boolean }): Promise<ActionResult> {
  try {
    await assertAdmin();
    await fetchAuthMutation(api.delivery.savePaymentSettings, { codEnabled: Boolean(input.codEnabled), acceptUnlistedCities: Boolean(input.acceptUnlistedCities) });
    refreshStorefront();
    revalidatePath("/", "layout");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "savePaymentSettings");
  }
}

const faqSchema = faqEntrySchema.extend({
  categoryId: z.string().optional().nullable(),
  position: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});
export type FaqInput = z.input<typeof faqSchema>;

export async function saveFaq(id: string | null, input: FaqInput): Promise<ActionResult> {
  try {
    await assertStaff();
    const d = faqSchema.parse(input);
    await fetchAuthMutation(api.faq.save, { id, ...d, categoryId: d.categoryId || null });
    invalidate(TAGS.catalog); // product pages read FAQs
    revalidatePath("/admin/faq");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "saveFaq");
  }
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  try {
    await assertStaff();
    await fetchAuthMutation(api.faq.remove, { id });
    invalidate(TAGS.catalog);
    revalidatePath("/admin/faq");
    return ok(undefined);
  } catch (err) {
    return toActionError(err, "deleteFaq");
  }
}
