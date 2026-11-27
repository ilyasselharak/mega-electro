// Usage: node scripts/seo-diff.mjs <baseA> <baseB> <path...> — compares the SEO head of two deployments.
const [a, b, ...paths] = process.argv.slice(2);
const pick = (html) => {
  const m = (re) => [...html.matchAll(re)].map((x) => x[1]);
  const ld = m(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g).flatMap((s) => { try { return [JSON.parse(s)].flat(); } catch { return []; } });
  const types = ld.flatMap((d) => (d["@graph"] ?? [d]).map((x) => x["@type"])).sort();
  return {
    title: m(/<title>([^<]*)<\/title>/g)[0],
    description: m(/<meta name="description" content="([^"]*)"/g)[0],
    robots: m(/<meta name="robots" content="([^"]*)"/g)[0],
    canonical: m(/<link rel="canonical" href="([^"]*)"/g)[0]?.replace(/^https?:\/\/[^/]+/, ""),
    hreflang: m(/<link rel="alternate" hrefLang="([^"]*)"/gi).sort().join(","),
    h1: (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1]?.replace(/<[^>]+>/g, "").trim(),
    jsonld: types.join(","),
  };
};
let diffs = 0;
for (const p of paths) {
  const [ha, hb] = await Promise.all([a, b].map((base) => fetch(base + p, { headers: { "user-agent": "Mozilla/5.0 seo-diff" } }).then((r) => r.text())));
  const [x, y] = [pick(ha), pick(hb)];
  for (const k of Object.keys(x)) {
    if (x[k] !== y[k]) { diffs++; console.log(`${p}  ${k}\n   live: ${x[k]}\n   new:  ${y[k]}`); }
  }
}
console.log(diffs ? `${diffs} difference(s)` : "identical SEO head on all pages");
