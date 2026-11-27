import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireStaff } from "./lib/auth";
import { storefrontFields } from "./schema";
import { fail } from "./lib/errors";
import { opt } from "./lib/products";

export const save = mutation({
  args: {
    storeName: v.string(),
    tagline: v.string(),
    phone: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    address: v.string(),
    shippingFee: v.number(),
    freeShippingThreshold: v.number(),
    announcement: v.optional(v.union(v.string(), v.null())),
    facebookUrl: v.optional(v.union(v.string(), v.null())),
    instagramUrl: v.optional(v.union(v.string(), v.null())),
    tiktokUrl: v.optional(v.union(v.string(), v.null())),
    codEnabled: v.optional(v.boolean()),
    acceptUnlistedCities: v.optional(v.boolean()),
  },
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    const doc = {
      ...a,
      announcement: opt(a.announcement),
      facebookUrl: opt(a.facebookUrl),
      instagramUrl: opt(a.instagramUrl),
      tiktokUrl: opt(a.tiktokUrl),
      updatedAt: Date.now(),
    };
    const existing = await ctx.db.query("settings").first();
    // Switches not sent by a form keep their current value.
    const full = { ...doc, codEnabled: a.codEnabled ?? existing?.codEnabled, acceptUnlistedCities: a.acceptUnlistedCities ?? existing?.acceptUnlistedCities };
    if (existing) await ctx.db.replace(existing._id, full);
    else await ctx.db.insert("settings", full);
  },
});

/** Admin → Vitrine: the raw storefront document (SKUs, inactive entries included). */
export const storefrontAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const doc = await ctx.db.query("storefront").first();
    if (!doc) return null;
    const { _id, _creationTime, ...rest } = doc;
    return rest;
  },
});

const HEX = /^#[0-9a-f]{6}$/i;

export const saveStorefront = mutation({
  args: storefrontFields,
  handler: async (ctx, a) => {
    await requireAdmin(ctx);
    if (a.banners.length > 20 || a.collections.length > 12) fail("Trop d'éléments (20 bannières et 12 collections au maximum)");
    for (const color of [a.theme?.accent, a.theme?.navy]) if (color && !HEX.test(color)) fail("Couleur invalide (format #rrggbb)");
    const doc = { ...a, updatedAt: Date.now() };
    const existing = await ctx.db.query("storefront").first();
    if (existing) await ctx.db.replace(existing._id, doc);
    else await ctx.db.insert("storefront", doc);
  },
});
