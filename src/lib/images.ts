/**
 * Image URL helpers — safe for both server and client.
 *
 * Images live on Cloudinary; `key` is the public_id (e.g. "mega-electro/products/abc123").
 * Cloudinary resizes on the fly and serves AVIF/WebP depending on the browser (f_auto).
 */
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export function originalUrl(key: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${key}`;
}

export function imageUrl(key: string, width = 1200, quality = 80) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_${quality},c_limit,w_${width}/${key}`;
}
