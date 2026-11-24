// Cloudinary REST helpers using only fetch + Web Crypto, so they run in Convex and in Next.js.
// Env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.

export const CLOUDINARY_ROOT = "mega-electro";

function config() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new Error("CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET ne sont pas configurés");
  return { cloud, key, secret };
}

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

async function sha1Hex(input: string) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Cloudinary signature: sorted "k=v&k=v" + api_secret, SHA-1. */
export async function signParams(params: Record<string, string | number>) {
  const { secret, key, cloud } = config();
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return { signature: await sha1Hex(toSign + secret), apiKey: key, cloudName: cloud };
}

export type CloudinaryUpload = { key: string; width: number; height: number; size: number; mimeType: string };

/** Uploads from a remote URL (Cloudinary fetches it) or a data URI. */
export async function uploadFromUrl(file: string, folder: string): Promise<CloudinaryUpload> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: `${CLOUDINARY_ROOT}/${folder}`, timestamp };
  const { signature, apiKey, cloudName } = await signParams(params);
  const body = new FormData();
  body.set("file", file);
  body.set("folder", params.folder);
  body.set("timestamp", String(timestamp));
  body.set("api_key", apiKey);
  body.set("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  const data = (await res.json()) as { public_id?: string; width?: number; height?: number; bytes?: number; format?: string; error?: { message: string } };
  if (!res.ok || !data.public_id) throw new Error(`Cloudinary: ${data.error?.message ?? res.status}`);
  return { key: data.public_id, width: data.width ?? 0, height: data.height ?? 0, size: data.bytes ?? 0, mimeType: `image/${data.format ?? "jpeg"}` };
}

/** Deletes images by public_id. Failures are reported, never thrown. */
export async function deleteImages(keys: string[]) {
  if (!keys.length || !isCloudinaryConfigured()) return;
  await Promise.all(
    keys.map(async (public_id) => {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const { signature, apiKey, cloudName } = await signParams({ public_id, timestamp });
        const body = new FormData();
        body.set("public_id", public_id);
        body.set("timestamp", String(timestamp));
        body.set("api_key", apiKey);
        body.set("signature", signature);
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body });
      } catch (err) {
        console.warn("Cloudinary delete failed", public_id, err);
      }
    }),
  );
}
