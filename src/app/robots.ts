import type { MetadataRoute } from "next";
import { BASE_ROBOTS_DISALLOW, isProtectedRobotsPath } from "@convex/lib/seoRules";
import { getSeoSettings } from "@/server/queries/seo";
import { urlFor } from "@/lib/seo";

export const revalidate = 3600;

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("/"));

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  // Extra rules from Admin → SEO → Technique. Rules that would block products, categories,
  // brands or the home page are ignored (also rejected when saving).
  const extraDisallow = lines(seo.robotsExtraDisallow).filter((p) => !isProtectedRobotsPath(p));
  return {
    rules: [{ userAgent: "*", allow: ["/", ...lines(seo.robotsExtraAllow)], disallow: [...new Set([...BASE_ROBOTS_DISALLOW, ...extraDisallow])] }],
    sitemap: urlFor("/sitemap.xml", seo),
  };
}
