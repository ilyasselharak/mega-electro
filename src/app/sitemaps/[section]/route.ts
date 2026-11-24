import { renderUrlset, SITEMAP_SECTIONS, sitemapEntries, XML_HEADERS, type SitemapSection } from "@/server/sitemap";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return SITEMAP_SECTIONS.map((s) => ({ section: `${s}.xml` }));
}

export async function GET(_req: Request, { params }: RouteContext<"/sitemaps/[section]">) {
  const { section } = await params;
  const name = section.replace(/\.xml$/, "") as SitemapSection;
  if (!SITEMAP_SECTIONS.includes(name)) return new Response("Not found", { status: 404 });
  return new Response(renderUrlset(await sitemapEntries(name)), { headers: XML_HEADERS });
}
