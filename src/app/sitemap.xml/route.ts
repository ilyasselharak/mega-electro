import { renderAll, XML_HEADERS } from "@/server/sitemap";

// All pages, categories, products and brands. Built on request from cached data, so a
// new domain or product appears without waiting for a deployment.
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await renderAll(), { headers: XML_HEADERS });
}
