import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
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
