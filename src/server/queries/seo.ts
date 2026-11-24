import "server-only";
import { unstable_cache } from "next/cache";
import { api } from "@convex/_generated/api";
import { DEFAULT_SEO } from "@convex/lib/seoRules";
import { fetchAuthQuery, publicQuery } from "@/lib/convex";
import { logger } from "@/lib/logger";
import { TAGS } from "@/server/cache";

// Saving in Admin → SEO refreshes this immediately (tag "seo").
const cachedSeoSettings = unstable_cache(() => publicQuery(api.seo.publicSettings, {}), ["seo-settings-v1"], { tags: [TAGS.seo], revalidate: 600 });

/** Never throws: metadata must still render (with defaults) if Convex is briefly unreachable. */
export async function getSeoSettings() {
  try {
    return await cachedSeoSettings();
  } catch (err) {
    logger.error("SEO settings unavailable, using defaults", { err });
    return DEFAULT_SEO;
  }
}

// Back-office reads (Convex checks the STAFF/ADMIN role).
export const getSeoOverview = () => fetchAuthQuery(api.seo.overview, {});
export type SeoOverview = Awaited<ReturnType<typeof getSeoOverview>>;

export const getSeoEntity = (kind: "category" | "product", id: string) => fetchAuthQuery(api.seo.entity, { kind, id });
export type SeoEntity = NonNullable<Awaited<ReturnType<typeof getSeoEntity>>>;

export const listRedirects = () => fetchAuthQuery(api.seo.listRedirects, {});
