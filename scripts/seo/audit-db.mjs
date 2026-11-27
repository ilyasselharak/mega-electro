// Completeness audit of product / category SEO fields from a JSON export (read-only).
// Usage: node scripts/seo/audit-db.mjs <backupDir>
import { readFileSync } from "node:fs";
const dir = process.argv[2];
const load = (t) => { try { return JSON.parse(readFileSync(`${dir}/${t}.json`, "utf8") || "[]"); } catch { return []; } };
const products = load("products").filter((p) => p.status === "ACTIVE");
const categories = load("categories");
const brands = new Map(load("brands").map((b) => [b._id, b.name]));
const has = (v) => typeof v === "string" ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : v != null;
const checks = {
  nameAr: (p) => has(p.nameAr),
  shortDescription: (p) => has(p.shortDescription),
  description: (p) => has(p.description),
  "description>=600 chars": (p) => (p.description ?? "").length >= 600,
  metaTitle: (p) => has(p.metaTitle),
  metaDescription: (p) => has(p.metaDescription),
  "seo.titleAr": (p) => has(p.seo?.titleAr),
  "seo.metaDescriptionAr": (p) => has(p.seo?.metaDescriptionAr),
  "seo.descriptionAr": (p) => has(p.seo?.descriptionAr),
  "seo.keywords": (p) => has(p.seo?.keywords),
  "seo.keywordsAr": (p) => has(p.seo?.keywordsAr),
  specs: (p) => has(p.specs),
  faq: (p) => has(p.faq),
  "all images have alt": (p) => p.images.length > 0 && p.images.every((i) => has(i.alt)),
  brand: (p) => has(p.brandId),
  category: (p) => has(p.categoryId),
  warrantyMonths: (p) => has(p.warrantyMonths),
};
console.log(`Active products: ${products.length} (cloned from Electro Darna: ${products.filter((p) => p.sourceId).length})`);
for (const [k, f] of Object.entries(checks)) {
  const n = products.filter(f).length;
  console.log(`${k.padEnd(26)} ${String(n).padStart(4)} / ${products.length}  (${Math.round((n / products.length) * 100)}%)`);
}
const dup = (key) => {
  const m = new Map();
  for (const p of products) { const v = key(p)?.trim(); if (v) m.set(v, [...(m.get(v) ?? []), p.slug]); }
  return [...m.entries()].filter(([, v]) => v.length > 1);
};
console.log(`\nDuplicate descriptions: ${dup((p) => p.description).length} groups`);
console.log(`Duplicate short descriptions: ${dup((p) => p.shortDescription).length} groups`);
const stuffed = products.filter((p) => (p.shortDescription ?? "").split(",").length >= 5);
console.log(`Short descriptions that look like keyword lists (5+ commas): ${stuffed.length}`);
console.log(`Products with emoji in text: ${products.filter((p) => /\p{Extended_Pictographic}/u.test((p.description ?? "") + (p.shortDescription ?? "") + p.name)).length}`);
console.log(`Slugs with dropped accents (rfrig, gnial, combin…): ${products.filter((p) => /rfrig|gnial|combin(?!e)|lectr(?!o)|vapeu|lav-|chaud-|lgum/.test(p.slug)).length}`);
const bySales = products.filter((p) => p.salesCount > 0).length;
console.log(`Products with recorded sales: ${bySales}`);
console.log(`\nCategories: ${categories.length}`);
for (const c of categories) {
  const miss = ["nameAr", "description", "metaTitle", "metaDescription", "imageKey"].filter((k) => !has(c[k])).concat(["titleAr", "metaDescriptionAr", "longDescription", "descriptionAr", "keywords", "keywordsAr"].filter((k) => !has(c.seo?.[k])));
  console.log(`  ${c.isActive ? " " : "x"} ${(c.parentId ? "  └ " : "") + c.name} — missing: ${miss.join(", ") || "none"}`);
}
