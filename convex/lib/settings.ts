import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const DEFAULT_SETTINGS = {
  storeName: "Mega Electro",
  tagline: "Électroménager & maison, livré partout au Maroc",
  phone: "+212 5 00 00 00 00",
  whatsapp: "212600000000",
  email: "contact@mega-electro.ma",
  address: "Casablanca, Maroc",
  shippingFee: 3000,
  freeShippingThreshold: 100000,
  announcement: "Livraison gratuite dès 1 000 DH · Paiement à la livraison",
};

export type StoreSettings = Omit<Doc<"settings">, "_id" | "_creationTime" | "updatedAt" | "announcement" | "facebookUrl" | "instagramUrl" | "tiktokUrl" | "codEnabled" | "acceptUnlistedCities"> & {
  codEnabled: boolean;
  acceptUnlistedCities: boolean;
  announcement: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
};

export async function readSettings(ctx: QueryCtx | MutationCtx): Promise<StoreSettings> {
  const s = await ctx.db.query("settings").first();
  const base = { ...DEFAULT_SETTINGS, facebookUrl: undefined, instagramUrl: undefined, tiktokUrl: undefined, ...(s ?? {}) };
  return {
    storeName: base.storeName,
    tagline: base.tagline,
    phone: base.phone,
    whatsapp: base.whatsapp,
    email: base.email,
    address: base.address,
    shippingFee: base.shippingFee,
    freeShippingThreshold: base.freeShippingThreshold,
    announcement: s ? (s.announcement ?? null) : DEFAULT_SETTINGS.announcement,
    facebookUrl: base.facebookUrl ?? null,
    instagramUrl: base.instagramUrl ?? null,
    tiktokUrl: base.tiktokUrl ?? null,
    codEnabled: s?.codEnabled ?? true,
    acceptUnlistedCities: s?.acceptUnlistedCities ?? true,
  };
}
