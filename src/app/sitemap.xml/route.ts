import { renderIndex, XML_HEADERS } from "@/server/sitemap";

// Sitemap index → /sitemaps/{pages,categories,products,brands}.xml
export const revalidate = 3600;

export async function GET() {
  return new Response(await renderIndex(), { headers: XML_HEADERS });
}
