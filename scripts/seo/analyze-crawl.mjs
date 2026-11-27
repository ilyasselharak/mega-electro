// Summarizes crawl.json into audit findings. Usage: node scripts/seo/analyze-crawl.mjs crawl.json
import { readFileSync } from "node:fs";
const { results, base } = JSON.parse(readFileSync(process.argv[2], "utf8"));
const ok = results.filter((r) => r.status === 200);
const kind = (u) => (u.includes("/produit/") ? "product" : u.includes("/categorie/") ? "category" : u.includes("/marque/") ? "brand" : "page");
const lang = (u) => (new URL(u).pathname.startsWith("/ar") ? "ar" : "fr");
const group = (key) => {
  const m = new Map();
  for (const r of ok) if (r[key]) m.set(r[key], [...(m.get(r[key]) ?? []), r.url]);
  return [...m.values()].filter((v) => v.length > 1);
};
const counts = {};
for (const r of results) counts[`${kind(r.url)}-${lang(r.url)}`] = (counts[`${kind(r.url)}-${lang(r.url)}`] ?? 0) + 1;
const path = (u) => new URL(u).pathname;
const linked = new Set(ok.flatMap((r) => r.links));
const out = {
  base,
  urls: results.length,
  byType: counts,
  non200: results.filter((r) => r.status !== 200).map((r) => `${r.status} ${r.url} ${r.location ?? ""}`),
  dupTitles: group("title"),
  dupDescriptions: group("description"),
  missingDescription: ok.filter((r) => !r.description).map((r) => r.url),
  titleLength: ok.filter((r) => r.title && (r.title.length < 30 || r.title.length > 70)).map((r) => `${r.title.length} ${r.url} | ${r.title}`),
  descLength: ok.filter((r) => r.description && (r.description.length < 90 || r.description.length > 170)).map((r) => `${r.description.length} ${r.url}`),
  canonicalMismatch: ok.filter((r) => r.canonical && r.canonical.replace(/\/$/, "") !== r.url.replace(/\/$/, "")).map((r) => `${r.url} -> ${r.canonical}`),
  missingCanonical: ok.filter((r) => !r.canonical).map((r) => r.url),
  hreflangMissing: ok.filter((r) => !r.hreflang["fr-MA"] || !r.hreflang["ar-MA"]).map((r) => r.url),
  hreflangNotReciprocal: ok.filter((r) => r.hreflang[lang(r.url) === "ar" ? "ar-MA" : "fr-MA"] && r.hreflang[lang(r.url) === "ar" ? "ar-MA" : "fr-MA"].replace(/\/$/, "") !== r.url.replace(/\/$/, "")).map((r) => r.url),
  noindex: ok.filter((r) => /noindex/.test(r.robots ?? "")).map((r) => r.url),
  h1Issues: ok.filter((r) => r.h1.length !== 1).map((r) => `${r.h1.length} h1: ${r.url}`),
  productsNoProductLd: ok.filter((r) => kind(r.url) === "product" && !r.product).map((r) => r.url),
  productsNoLdDescription: ok.filter((r) => r.product && !r.product.hasDescription).map((r) => r.url),
  productsWithRating: ok.filter((r) => r.product?.rating).map((r) => r.url),
  imgsMissingAlt: ok.filter((r) => r.imgNoAlt > 0).map((r) => `${r.imgNoAlt}/${r.imgCount} ${r.url}`),
  thinPages: ok.filter((r) => r.words < 250).map((r) => `${r.words} ${r.url}`),
  arabicPagesWithLatinTitle: ok.filter((r) => lang(r.url) === "ar" && kind(r.url) === "product" && !/[؀-ۿ]/.test(r.title.replace(/\|.*$/, ""))).map((r) => r.url),
  orphans: ok.filter((r) => !linked.has(path(r.url))).map((r) => r.url),
  brokenInternal: [],
};
// Internal links not in the sitemap and not crawled: check their status.
const known = new Set(results.map((r) => path(r.url)));
const extra = [...linked].filter((p) => !known.has(p) && !/^\/(api|_next|admin|compte|panier|commande|connexion|inscription|favoris|recherche|suivi-commande)/.test(p.replace(/^\/ar/, "")));
for (const p of extra) {
  const res = await fetch(base + p, { redirect: "manual" });
  if (res.status >= 400) out.brokenInternal.push(`${res.status} ${p}`);
}
for (const [k, v] of Object.entries(out)) {
  if (Array.isArray(v)) console.log(`\n## ${k}: ${v.length}\n` + v.slice(0, 12).map((x) => "  " + (Array.isArray(x) ? x.length + "× " + x.slice(0, 3).join(" , ") : x)).join("\n"));
  else console.log(`${k}: ${JSON.stringify(v)}`);
}
