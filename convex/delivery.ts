import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireAdmin, requireStaff } from "./lib/auth";
import { fail } from "./lib/errors";
import { opt } from "./lib/products";
import { normalizeCity, type DeliveryConfig } from "./lib/delivery";
import { readSettings } from "./lib/settings";

export async function readDeliveryConfig(ctx: QueryCtx): Promise<DeliveryConfig> {
  const [settings, zones] = await Promise.all([readSettings(ctx), ctx.db.query("deliveryZones").collect()]);
  return {
    zones: zones
      .filter((z) => z.isActive)
      .sort((a, b) => a.position - b.position || a.city.localeCompare(b.city, "fr"))
      .map((z) => ({ city: z.city, cityAr: z.cityAr ?? null, fee: z.fee, freeThreshold: z.freeThreshold ?? null, etaMinDays: z.etaMinDays, etaMaxDays: z.etaMaxDays, codAvailable: z.codAvailable })),
    defaultFee: settings.shippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    codEnabled: settings.codEnabled,
    acceptUnlistedCities: settings.acceptUnlistedCities,
  };
}

/** Public: delivery zones and payment switches for the checkout. */
export const config = query({ args: {}, handler: (ctx) => readDeliveryConfig(ctx) });

export const listZones = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    return (await ctx.db.query("deliveryZones").collect())
      .sort((a, b) => a.position - b.position || a.city.localeCompare(b.city, "fr"))
      .map((z) => ({ id: z._id as string, city: z.city, cityAr: z.cityAr ?? null, fee: z.fee, freeThreshold: z.freeThreshold ?? null, etaMinDays: z.etaMinDays, etaMaxDays: z.etaMaxDays, codAvailable: z.codAvailable, isActive: z.isActive, position: z.position }));
  },
});

export const saveZone = mutation({
  args: {
    id: v.union(v.string(), v.null()),
    city: v.string(),
    cityAr: v.optional(v.string()),
    fee: v.number(),
    freeThreshold: v.optional(v.union(v.number(), v.null())),
    etaMinDays: v.number(),
    etaMaxDays: v.number(),
    codAvailable: v.boolean(),
    isActive: v.boolean(),
    position: v.number(),
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const city = a.city.trim();
    if (city.length < 2) fail("Ville requise.");
    if (a.fee < 0 || !Number.isInteger(a.fee)) fail("Frais invalides.");
    if (a.etaMinDays < 0 || a.etaMaxDays < a.etaMinDays) fail("Délai invalide (min ≤ max).");
    const zid = a.id ? ctx.db.normalizeId("deliveryZones", a.id) : null;
    const dup = (await ctx.db.query("deliveryZones").collect()).find((z) => z._id !== zid && normalizeCity(z.city) === normalizeCity(city));
    if (dup) fail(`La ville « ${dup.city} » existe déjà.`);
    const doc = {
      city,
      cityAr: opt(a.cityAr?.trim()),
      fee: a.fee,
      freeThreshold: a.freeThreshold ?? undefined,
      etaMinDays: a.etaMinDays,
      etaMaxDays: a.etaMaxDays,
      codAvailable: a.codAvailable,
      isActive: a.isActive,
      position: a.position,
      updatedAt: Date.now(),
    };
    if (zid) await ctx.db.replace(zid, doc);
    else await ctx.db.insert("deliveryZones", doc);
  },
});

export const deleteZone = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const zid = ctx.db.normalizeId("deliveryZones", id);
    if (zid) await ctx.db.delete(zid);
  },
});

export const savePaymentSettings = mutation({
  args: { codEnabled: v.boolean(), acceptUnlistedCities: v.boolean() },
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("settings").first();
    if (!existing) fail("Enregistrez d'abord les paramètres de la boutique.");
    await ctx.db.patch(existing._id, { ...a, updatedAt: Date.now() });
  },
});
