import "server-only";
import { getSitemapData } from "@/server/queries/catalog";
import { getSeoSettings } from "@/server/queries/seo";
import { STATIC_PAGES } from "@/lib/content/pages";
import { imageUrl } from "@/lib/images";
import { urlFor, type SeoSettings } from "@/lib/seo";

export const SITEMAP_SECTIONS = ["pages", "categories", "products", "brands"] as const;
export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

/** `loc` is the French (default) URL; the Arabic twin is emitted alongside with hreflang links. */
type Entry = { loc: string; lastmod?: number; changefreq?: string; priority?: number; images?: string[] };

const arabicTwin = (loc: string) => {
  const u = new URL(loc);
  u.pathname = u.pathname === "/" ? "/ar" : `/ar${u.pathname}`;
  return u.toString().replace(/\/$/, "");
};

/** Only self-canonical, indexable pages belong in the sitemap. */
const selfCanonical = (seo: SeoSettings, path: string, canonical: string | null) => !canonical || urlFor(canonical, seo) === urlFor(path, seo);

export async function sitemapEntries(section: SitemapSection): Promise<Entry[]> {
  const [data, seo] = await Promise.all([getSitemapData(), getSeoSettings()]);
  if (!seo.robotsIndex) return [];
  const now = Date.now();
  switch (section) {
    case "pages":
      return [
        { loc: urlFor("/", seo), lastmod: now, changefreq: "daily", priority: 1 },
        { loc: urlFor("/promotions", seo), lastmod: now, changefreq: "daily", priority: 0.8 },
        { loc: urlFor("/recherche", seo), lastmod: now, changefreq: "daily", priority: 0.6 },
        ...(seo.sitemapIncludeStaticPages
          ? [...Object.keys(STATIC_PAGES).map((p) => ({ loc: urlFor(`/${p}`, seo), changefreq: "yearly", priority: 0.3 })), { loc: urlFor("/suivi-commande", seo), changefreq: "yearly", priority: 0.3 }]
          : []),
      ];
    case "categories":
      return data.categories
        .filter((c) => !c.noindex && selfCanonical(seo, `/categorie/${c.slug}`, c.canonicalUrl))
        .map((c) => ({
          loc: urlFor(`/categorie/${c.slug}`, seo),
          lastmod: c.updatedAt,
          changefreq: "daily",
          priority: 0.9,
          images: seo.sitemapIncludeImages && c.imageKey ? [imageUrl(c.imageKey, 1200)] : undefined,
        }));
    case "products":
      return data.products
        .filter((p) => !p.noindex && selfCanonical(seo, `/produit/${p.slug}`, p.canonicalUrl))
        .map((p) => ({
          loc: urlFor(`/produit/${p.slug}`, seo),
          lastmod: p.updatedAt,
          changefreq: "weekly",
          priority: 0.8,
          images: seo.sitemapIncludeImages ? p.images.map((i) => imageUrl(i.key, 1200)) : undefined,
        }));
    case "brands":
      return seo.sitemapIncludeBrands ? data.brands.map((b) => ({ loc: urlFor(`/marque/${b.slug}`, seo), lastmod: b.updatedAt, changefreq: "weekly", priority: 0.6 })) : [];
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const iso = (t: number) => new Date(t).toISOString();

export function renderUrlset(entries: Entry[]) {
  const body = entries
    .flatMap((e) => {
      const fr = e.loc.replace(/\/$/, "") || e.loc;
      const ar = arabicTwin(e.loc);
      const alternates = `<xhtml:link rel="alternate" hreflang="fr-MA" href="${esc(fr)}"/><xhtml:link rel="alternate" hreflang="ar-MA" href="${esc(ar)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${esc(fr)}"/>`;
      return [{ ...e, loc: fr, alternates }, { ...e, loc: ar, alternates }];
    })
    .map((e) =>
      [
        "<url>",
        `<loc>${esc(e.loc)}</loc>`,
        e.alternates,
        e.lastmod ? `<lastmod>${iso(e.lastmod)}</lastmod>` : "",
        e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : "",
        e.priority != null ? `<priority>${e.priority}</priority>` : "",
        ...(e.images ?? []).map((img) => `<image:image><image:loc>${esc(img)}</image:loc></image:image>`),
        "</url>",
      ].join(""),
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

/** Every page in one sitemap (limit per file: 50 000 URLs). */
export async function renderAll() {
  const all = [];
  for (const s of SITEMAP_SECTIONS) all.push(...(await sitemapEntries(s)));
  return renderUrlset(all);
}

export const XML_HEADERS = { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" };
