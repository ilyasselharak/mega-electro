// SEO crawl of every sitemap URL. Usage: node scripts/seo/crawl.mjs [base=https://www.mega-electro.ma] [out=crawl.json]
// Read-only: GET requests only, 6 at a time.
import { writeFileSync } from "node:fs";

const base = (process.argv[2] ?? "https://www.mega-electro.ma").replace(/\/$/, "");
// FETCH_HOST: crawl a different host than the one the sitemap announces (e.g. when the apex redirects to www).
const fetchHost = process.env.FETCH_HOST;
const via = (u) => (fetchHost ? u.replace(/^https?:\/\/[^/]+/, fetchHost) : u);
const out = process.argv[3] ?? "crawl.json";
const UA = { "user-agent": "Mozilla/5.0 (compatible; MegaElectroSEOAudit/1.0)" };

const text = async (u) => (await fetch(u, { headers: UA })).text();

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

async function sitemapUrls() {
  const root = await text(`${base}/sitemap.xml`);
  const urls = locs(root);
  const nested = urls.filter((u) => u.endsWith(".xml"));
  const pages = urls.filter((u) => !u.endsWith(".xml"));
  for (const s of nested) pages.push(...locs(await text(s)).filter((u) => !u.endsWith(".xml")));
  return [...new Set(pages)];
}

const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

function parse(html, url) {
  const one = (re) => decode((html.match(re) ?? [])[1]);
  const all = (re) => [...html.matchAll(re)].map((m) => decode(m[1]));
  const ld = all(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g).flatMap((s) => {
    try { return [JSON.parse(s)].flat(); } catch { return [{ "@type": "INVALID_JSON" }]; }
  });
  const types = ld.flatMap((d) => (d["@graph"] ?? [d]).map((x) => x["@type"]));
  const main = html.split(/<main[^>]*>/)[1]?.split("</main>")[0] ?? html;
  const imgs = [...main.matchAll(/<img\b([^>]*)>/g)].map((m) => m[1]);
  const product = ld.find((d) => d["@type"] === "Product");
  return {
    url,
    lang: one(/<html[^>]*lang="([^"]+)"/),
    dir: one(/<html[^>]*dir="([^"]+)"/),
    title: one(/<title>([^<]*)<\/title>/),
    description: one(/<meta name="description" content="([^"]*)"/),
    robots: one(/<meta name="robots" content="([^"]*)"/),
    canonical: one(/<link rel="canonical" href="([^"]*)"/),
    hreflang: Object.fromEntries([...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/gi)].map((m) => [m[1], m[2]])),
    ogImage: one(/<meta property="og:image" content="([^"]*)"/),
    h1: all(/<h1[^>]*>([\s\S]*?)<\/h1>/g).map((h) => h.replace(/<[^>]+>/g, "").trim()),
    jsonld: types,
    product: product ? { price: product.offers?.price, availability: product.offers?.availability, sku: product.sku, brand: product.brand?.name, hasDescription: Boolean(product.description), images: [product.image].flat().length, rating: Boolean(product.aggregateRating) } : null,
    imgNoAlt: imgs.filter((a) => !/\balt="[^"]+"/.test(a) && !/aria-hidden/.test(a)).length,
    imgCount: imgs.length,
    words: main.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
    links: [...new Set(all(/<a [^>]*href="(\/[^"#?]*)/g))],
  };
}

const urls = await sitemapUrls();
console.error(`${urls.length} URLs in sitemap`);
const results = [];
let i = 0;
async function worker() {
  while (i < urls.length) {
    const url = urls[i++];
    try {
      const res = await fetch(via(url), { headers: UA, redirect: "manual" });
      const r = { status: res.status, location: res.headers.get("location") };
      results.push(res.status === 200 ? { ...r, ...parse(await res.text(), url) } : { url, ...r });
    } catch (e) {
      results.push({ url, status: 0, error: String(e) });
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
writeFileSync(out, JSON.stringify({ base, crawledAt: new Date().toISOString(), results }, null, 1));
console.error(`saved ${out}`);
