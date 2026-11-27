import { z } from "zod";
import { imageInputSchema, optionalText, priceDirhams, slugSchema } from "./common";

export const specSchema = z.object({
  label: z.string().trim().min(1, "Libellé requis").max(80),
  value: z.string().trim().min(1, "Valeur requise").max(200),
});

export const faqEntrySchema = z.object({
  question: z.string().trim().min(5, "Question requise").max(300),
  answer: z.string().trim().min(2, "Réponse requise").max(3000),
  questionAr: optionalText(300),
  answerAr: optionalText(3000),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Nom requis").max(160),
    nameAr: optionalText(160),
    faq: z.array(faqEntrySchema).max(20).default([]),
    slug: slugSchema,
    sku: z.string().trim().min(2, "SKU requis").max(64),
    shortDescription: optionalText(300),
    description: optionalText(20_000),
    price: priceDirhams,
    compareAtPrice: priceDirhams.optional().nullable(),
    costPrice: priceDirhams.optional().nullable(),
    stock: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0).max(10_000),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),
    warrantyMonths: z.coerce.number().int().min(0).max(240).optional().nullable(),
    categoryId: z.string().optional().nullable(),
    brandId: z.string().optional().nullable(),
    specs: z.array(specSchema).max(60),
    images: z.array(imageInputSchema).max(15),
    metaTitle: optionalText(70),
    metaDescription: optionalText(170),
  })
  .refine((d) => d.compareAtPrice == null || d.compareAtPrice === 0 || d.compareAtPrice > d.price, {
    message: "Le prix barré doit être supérieur au prix de vente",
    path: ["compareAtPrice"],
  });
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  nameAr: optionalText(80),
  slug: slugSchema,
  description: optionalText(2000),
  parentId: z.string().optional().nullable(),
  icon: optionalText(40),
  position: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
  imageKey: z.string().optional().nullable(),
  metaTitle: optionalText(70),
  metaDescription: optionalText(170),
});
export type CategoryFormInput = z.input<typeof categoryFormSchema>;

export const brandFormSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slugSchema,
  description: optionalText(2000),
  isActive: z.boolean(),
  logoKey: z.string().optional().nullable(),
  metaTitle: optionalText(70),
  metaDescription: optionalText(170),
});
export type BrandFormInput = z.input<typeof brandFormSchema>;

export const uploadRequestSchema = z.object({
  filename: z.string().max(200),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  size: z.number().int().positive().max(10 * 1024 * 1024, "Image trop volumineuse (10 Mo max)"),
  scope: z.enum(["products", "categories", "brands", "seo", "banners"]),
});
