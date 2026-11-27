import { z } from "zod";

// Admin → Vitrine. Dates are sent as epoch milliseconds (converted in the admin's browser, so its time zone applies).

const text = (max: number) => z.string().trim().max(max);
const optText = (max: number) => text(max).optional().transform((v) => v || undefined);
const date = z.number().int().positive().nullable().optional().transform((v) => v ?? undefined);
const href = z
  .string()
  .trim()
  .min(1, "Lien requis")
  .max(300)
  .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Lien interne (/promotions) ou https://…");

export const bannerSchema = z
  .object({
    id: text(40).min(1),
    placement: z.enum(["hero", "promo"]),
    title: text(90).min(2, "Titre requis"),
    titleAr: optText(90),
    subtitle: optText(180),
    subtitleAr: optText(180),
    ctaLabel: optText(40),
    ctaLabelAr: optText(40),
    href,
    imageKey: optText(200),
    isActive: z.boolean(),
    startsAt: date,
    endsAt: date,
  })
  .refine((b) => !b.startsAt || !b.endsAt || b.startsAt < b.endsAt, { message: "La fin doit suivre le début", path: ["endsAt"] });

export const collectionSchema = z
  .object({
    id: text(40).min(1),
    title: text(90).min(2, "Titre requis"),
    titleAr: optText(90),
    description: optText(240),
    descriptionAr: optText(240),
    skus: z.array(text(80).min(1)).max(24, "24 produits au maximum"),
    isActive: z.boolean(),
    startsAt: date,
    endsAt: date,
  })
  .refine((c) => !c.startsAt || !c.endsAt || c.startsAt < c.endsAt, { message: "La fin doit suivre le début", path: ["endsAt"] });

const hex = z
  .string()
  .trim()
  .regex(/^(#[0-9a-fA-F]{6})?$/, "Format #rrggbb")
  .optional()
  .transform((v) => v || undefined);

export const storefrontSchema = z.object({
  banners: z.array(bannerSchema).max(20),
  collections: z.array(collectionSchema).max(12),
  sections: z.array(z.object({ key: text(40), visible: z.boolean() })).max(30),
  theme: z.object({ accent: hex, navy: hex }),
});

export type StorefrontInput = z.input<typeof storefrontSchema>;
export type BannerInput = z.input<typeof bannerSchema>;
export type CollectionInput = z.input<typeof collectionSchema>;
