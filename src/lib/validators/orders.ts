import { z } from "zod";
import { moroccanPhone } from "./common";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Nom complet requis").max(100),
  phone: moroccanPhone,
  email: z.union([z.literal(""), z.email("Email invalide")]).optional(),
  city: z.string().trim().min(2, "Ville requise").max(80),
  address: z.string().trim().min(8, "Adresse trop courte").max(300),
  note: z.string().trim().max(500).optional(),
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Votre panier est vide")
    .max(50),
  // Honeypot field: real users never fill it
  website: z.string().max(0).optional(),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]),
  message: z.string().trim().max(500).optional(),
});

export const trackOrderSchema = z.object({
  number: z.string().trim().min(4).max(20),
  phone: moroccanPhone,
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  delta: z.coerce.number().int().refine((v) => v !== 0, "La quantité ne peut pas être 0"),
  reason: z.enum(["RESTOCK", "ADJUSTMENT", "RETURN", "DAMAGE"]),
  note: z.string().trim().max(300).optional(),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(160),
  phone: z.string().trim().max(40),
  whatsapp: z.string().trim().regex(/^\d{8,15}$/, "Format international sans + (ex : 212600000000)"),
  email: z.email(),
  address: z.string().trim().max(200),
  shippingFee: z.coerce.number().min(0).max(100_000),
  freeShippingThreshold: z.coerce.number().min(0).max(10_000_000),
  announcement: z.string().trim().max(160).optional(),
  facebookUrl: z.union([z.literal(""), z.url()]).optional(),
  instagramUrl: z.union([z.literal(""), z.url()]).optional(),
  tiktokUrl: z.union([z.literal(""), z.url()]).optional(),
});
export type SettingsInput = z.input<typeof settingsSchema>;
