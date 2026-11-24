import "server-only";
import { revalidateTag } from "next/cache";

export const TAGS = {
  catalog: "catalog",
  settings: "settings",
  seo: "seo",
} as const;

/** Expire cached storefront data immediately after an admin mutation. */
export function invalidate(...tags: (typeof TAGS)[keyof typeof TAGS][]) {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}
