import { z } from "zod";
import { isProtectedRobotsPath } from "@convex/lib/seoRules";
import { slugSchema } from "./common";

const text = (max: number) => z.string().trim().max(max, `${max} caractères maximum`).optional().default("");

const canonicalSchema = text(500).refine((v) => !v || v.startsWith("/") || /^https?:\/\/[^\s]+$/i.test(v), "Chemin (/…) ou URL complète (https://…)");
const imageKey = z
  .string()
  .optional()
  .nullable()
  .refine((v) => !v || v.startsWith("mega-electro/"), "Image invalide.");

export const seoMetaFormSchema = z.object({
  h1: text(120),
  canonicalUrl: canonicalSchema,
  keywords: text(400),
  titleAr: text(120),
  metaDescriptionAr: text(250),
  descriptionAr: text(5000),
  keywordsAr: text(400),
  ogTitle: text(120),
  ogDescription: text(250),
  ogImageKey: imageKey,
  imageAlt: text(200),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
});

export const entitySeoFormSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(160).optional(),
  slug: slugSchema,
  metaTitle: text(70),
  metaDescription: text(170),
  shortText: text(2000),
  longText: text(20_000),
  seo: seoMetaFormSchema,
  imageAlts: z.array(z.object({ key: z.string(), alt: z.string().trim().max(200) })).max(30).default([]),
});
export type EntitySeoFormInput = z.input<typeof entitySeoFormSchema>;
export type EntitySeoFormValues = z.output<typeof entitySeoFormSchema>;

const pathLines = (label: string) =>
  text(2000).refine((v) => v.split("\n").every((l) => !l.trim() || l.trim().startsWith("/")), `${label} : une règle par ligne, commençant par /`);

const days = z.coerce.number().int().min(0).max(60);

export const seoSettingsFormSchema = z
  .object({
    siteName: z.string().trim().min(2).max(60),
    defaultTitle: z.string().trim().min(10).max(90),
    defaultDescription: z.string().trim().min(50).max(200),
    defaultKeywords: text(500),
    canonicalBaseUrl: text(200).refine((v) => !v || /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(v.replace(/\/$/, "")), "URL d'origine sans chemin, ex : https://www.mega-electro.ma"),
    robotsIndex: z.boolean(),
    robotsFollow: z.boolean(),
    ogTitle: text(120),
    ogDescription: text(250),
    ogImageKey: imageKey,
    socialImageKey: imageKey,
    orgType: z.enum(["Store", "OnlineStore", "Organization"]),
    orgLegalName: text(160),
    orgDescription: text(500),
    orgLogoKey: imageKey,
    orgSameAs: text(1000).refine((v) => v.split(/\s+/).every((u) => !u || /^https?:\/\//.test(u)), "Une URL complète par ligne"),
    priceRange: text(10),
    homeTitle: text(90),
    homeDescription: text(200),
    homeKeywords: text(500),
    homeH1: text(120),
    homeSeoHeading: text(160),
    homeSeoText: text(5000),
    homeOgTitle: text(120),
    homeOgDescription: text(250),
    homeOgImageKey: imageKey,
    robotsExtraDisallow: pathLines("Disallow").refine(
      (v) => v.split("\n").every((l) => !l.trim() || !isProtectedRobotsPath(l)),
      "Une règle bloquerait des pages importantes (accueil, produits, catégories, marques).",
    ),
    robotsExtraAllow: pathLines("Allow"),
    sitemapIncludeBrands: z.boolean(),
    sitemapIncludeStaticPages: z.boolean(),
    sitemapIncludeImages: z.boolean(),
    googleVerification: text(120).refine((v) => !/[<>"]/.test(v), "Collez uniquement la valeur content=\"…\""),
    bingVerification: text(120).refine((v) => !/[<>"]/.test(v), "Collez uniquement la valeur content=\"…\""),
    sdOrganization: z.boolean(),
    sdWebsite: z.boolean(),
    sdBreadcrumbs: z.boolean(),
    sdProduct: z.boolean(),
    sdItemList: z.boolean(),
    sdShipping: z.boolean(),
    shippingHandlingMin: days,
    shippingHandlingMax: days,
    shippingTransitMin: days,
    shippingTransitMax: days,
    sdReturnPolicy: z.boolean(),
    returnDays: z.coerce.number().int().min(0).max(365),
    returnFees: z.enum(["", "FreeReturn", "ReturnFeesCustomerResponsibility", "ReturnShippingFees"]),
    returnMethod: z.enum(["", "ReturnByMail", "ReturnInStore", "ReturnAtKiosk"]),
  })
  .refine((d) => d.shippingHandlingMin <= d.shippingHandlingMax, { message: "Min ≤ max", path: ["shippingHandlingMax"] })
  .refine((d) => d.shippingTransitMin <= d.shippingTransitMax, { message: "Min ≤ max", path: ["shippingTransitMax"] });
export type SeoSettingsFormInput = z.input<typeof seoSettingsFormSchema>;
export type SeoSettingsFormValues = z.output<typeof seoSettingsFormSchema>;

export const redirectFormSchema = z.object({
  from: z.string().trim().min(2).max(500),
  to: z.string().trim().min(1).max(500),
  statusCode: z.coerce.number().refine((v) => v === 301 || v === 302),
  note: text(200),
});
export type RedirectFormInput = z.input<typeof redirectFormSchema>;
