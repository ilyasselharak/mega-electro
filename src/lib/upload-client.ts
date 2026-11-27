"use client";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";

export type UploadedImage = {
  key: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
};

export type UploadScope = "products" | "categories" | "brands" | "seo" | "banners";

export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return `${file.name} : format non supporté (JPEG, PNG, WebP, AVIF)`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} : fichier trop lourd (10 Mo max)`;
  return null;
}

/**
 * 1. Ask our API to sign the upload (auth + validation server-side)
 * 2. POST the file directly to Cloudinary (never through our server)
 */
export async function uploadImage(file: File, scope: UploadScope, onProgress?: (pct: number) => void): Promise<UploadedImage> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const sign = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, scope }),
  });
  const target = await sign.json();
  if (!sign.ok) throw new Error(target.error ?? "Échec de la préparation de l'envoi");

  const form = new FormData();
  for (const [k, v] of Object.entries(target.fields as Record<string, string>)) form.set(k, v);
  form.set("file", file);

  const result = await new Promise<{ public_id: string; width: number; height: number; bytes: number; format: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", target.url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 95));
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.error?.message ?? `Envoi refusé (${xhr.status})`));
      } catch {
        reject(new Error(`Envoi refusé (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'envoi"));
    xhr.send(form);
  });
  onProgress?.(100);
  return { key: result.public_id, width: result.width, height: result.height, size: result.bytes, mimeType: `image/${result.format}` };
}
