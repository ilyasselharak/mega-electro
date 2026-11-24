import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug trop court")
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Utilisez uniquement des minuscules, chiffres et tirets");

/** Moroccan phone: 06/07/05 + 8 digits, or +212/00212 prefix. */
export const moroccanPhone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s.-]/g, ""))
  .refine((v) => /^(?:\+212|00212|0)[5-7]\d{8}$/.test(v), "Numéro de téléphone marocain invalide (ex : 06 12 34 56 78)")
  .transform((v) => v.replace(/^(?:\+212|00212)/, "0"));

/** Price input in dirhams (form) → centimes (db). */
export const priceDirhams = z.coerce
  .number({ error: "Prix invalide" })
  .min(0, "Le prix doit être positif")
  .max(10_000_000);

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const imageInputSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1),
  thumbKey: z.string().optional().nullable(),
  alt: z.string().max(200).optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  size: z.number().int().optional().nullable(),
  mimeType: z.string().optional().nullable(),
});
export type ImageInput = z.infer<typeof imageInputSchema>;
