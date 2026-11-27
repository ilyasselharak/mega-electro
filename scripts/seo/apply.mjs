#!/usr/bin/env node
// Safe bulk SEO updates for Mega Electro.
//
//   node scripts/seo/apply.mjs <proposals.json>                     dry run (default): validate + field diff + report
//   node scripts/seo/apply.mjs <proposals.json> --apply --batch pilot-10   write, 5 documents at a time
//   node scripts/seo/apply.mjs --rollback <batchId> [--apply]        undo a batch (dry run unless --apply)
//
// Writes go through convex/seoBulk.ts (allow-listed fields, optimistic concurrency, change log).
// Reads use `npx convex data` (read-only). The target deployment is CONVEX_DEPLOYMENT from .env.local;
// the script refuses to run against any deployment not listed in ALLOWED_DEPLOYMENTS.
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The deployment that serves www.mega-electro.ma (verified 2026-11-27 by matching live data). Never Electro Darna.
const ALLOWED_DEPLOYMENTS = ["beaming-jay-54"];
const BATCH_SIZE = 5;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const APPLY = flag("--apply");

const env = readFileSync(".env.local", "utf8");
const deployment = (env.match(/^CONVEX_DEPLOYMENT=([^\s#]+)/m) ?? [])[1]?.replace(/^\w+:/, "");
if (!ALLOWED_DEPLOYMENTS.includes(deployment)) {
  console.error(`Refusing to run: CONVEX_DEPLOYMENT=${deployment} is not an approved Mega Electro deployment.`);
  process.exit(1);
}

const convex = (...a) => execFileSync("npx", ["convex", ...a], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
const snapshot = (table) => JSON.parse(convex("data", table, "--limit", "5000", "--format", "jsonArray") || "[]");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
mkdirSync("backups/seo/logs", { recursive: true });

// ── Rollback ─────────────────────────────────────────────────────────────
if (opt("--rollback")) {
  const batchId = opt("--rollback");
  const res = JSON.parse(convex("run", "seoBulk:rollbackBatch", JSON.stringify({ batchId, dryRun: !APPLY })));
  console.log(`${APPLY ? "Rolled back" : "Would roll back"} ${res.restored} field(s) of ${batchId}.`);
  if (res.conflicts.length) console.log(`Skipped (edited since the batch):\n  ${res.conflicts.join("\n  ")}`);
  process.exit(0);
}

// ── Validation ───────────────────────────────────────────────────────────
const file = args.find((a) => a.endsWith(".json"));
if (!file) {
  console.error("Usage: node scripts/seo/apply.mjs <proposals.json> [--apply --batch <id>]");
  process.exit(1);
}
const proposals = JSON.parse(readFileSync(file, "utf8"));
const products = snapshot("products");
const categories = snapshot("categories");
// Backup of the current SEO fields of every document touched, before anything else happens.
writeFileSync(`backups/seo/logs/${stamp}-snapshot.json`, JSON.stringify({ deployment, products, categories }, null, 1));

const PRODUCT_KEYS = new Set(["name", "nameAr", "shortDescription", "description", "metaTitle", "metaDescription", "seo", "faq", "imageAlts", "specs"]);
const CATEGORY_KEYS = new Set(["nameAr", "description", "metaTitle", "metaDescription", "seo"]);
const SEO_KEYS = new Set(["h1", "keywords", "titleAr", "metaDescriptionAr", "descriptionAr", "shortDescriptionAr", "keywordsAr", "ogTitle", "ogDescription", "longDescription", "imageAlt"]);
const TITLE_SUFFIX = " | Mega Electro".length; // added by the page template

const errors = [];
const warnings = [];
const seenTitles = new Map();
for (const p of [...products, ...categories]) {
  if (p.metaTitle) seenTitles.set(p.metaTitle.trim().toLowerCase(), p.slug);
  if (p.seo?.titleAr) seenTitles.set(p.seo.titleAr.trim().toLowerCase(), p.slug);
}

function validate(entry) {
  const where = `${entry.kind}:${entry.slug}`;
  const changes = entry.changes ?? {};
  const allowed = entry.kind === "product" ? PRODUCT_KEYS : CATEGORY_KEYS;
  for (const k of Object.keys(changes)) if (!allowed.has(k)) errors.push(`${where}: field "${k}" is not allowed`);
  for (const k of Object.keys(changes.seo ?? {})) if (!SEO_KEYS.has(k)) errors.push(`${where}: field "seo.${k}" is not allowed`);
  if (changes.specs && !entry.specsVerified) errors.push(`${where}: specs need "specsVerified": true and sources`);
  const len = (label, v, [lo, hi], hard) => {
    if (v == null) return;
    const n = v.trim().length;
    if (n > hard) errors.push(`${where}: ${label} ${n} chars (hard max ${hard})`);
    else if (n < lo || n > hi) warnings.push(`${where}: ${label} ${n} chars (target ${lo}–${hi})`);
  };
  len("metaTitle", changes.metaTitle, [40, 60 - 0], 75);
  len("seo.titleAr", changes.seo?.titleAr, [30, 60], 75);
  len("metaDescription", changes.metaDescription, [120, 160], 175);
  len("seo.metaDescriptionAr", changes.seo?.metaDescriptionAr, [100, 160], 175);
  for (const t of [changes.metaTitle, changes.seo?.titleAr]) {
    if (!t) continue;
    if (t.length + TITLE_SUFFIX > 70) warnings.push(`${where}: "${t}" + " | Mega Electro" = ${t.length + TITLE_SUFFIX} chars`);
    const prev = seenTitles.get(t.trim().toLowerCase());
    if (prev && prev !== entry.slug) errors.push(`${where}: title duplicates ${prev}`);
    seenTitles.set(t.trim().toLowerCase(), entry.slug);
  }
  for (const k of ["keywords", "keywordsAr"]) {
    const v = changes.seo?.[k];
    if (!v) continue;
    const list = v.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length < 3 || list.length > 15) warnings.push(`${where}: seo.${k} has ${list.length} keywords (3–15 expected)`);
    if (new Set(list.map((s) => s.toLowerCase())).size !== list.length) errors.push(`${where}: seo.${k} has duplicates`);
    if (/[;|]/.test(v)) errors.push(`${where}: seo.${k} must be comma-separated`);
  }
  if (/\p{Extended_Pictographic}/u.test(JSON.stringify(changes))) errors.push(`${where}: emoji are not allowed in SEO text`);
  if (/\b(\d(\.\d)?\/5|étoiles|avis clients|meilleur prix garanti)\b/i.test(JSON.stringify(changes))) errors.push(`${where}: rating / unverifiable claim found`);
}

// ── Field-level diff (mirrors convex/seoBulk.ts) ─────────────────────────
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function diff(doc, changes) {
  const out = [];
  const push = (field, before, after) => {
    if (typeof after === "string") after = after.trim();
    if (!same(before, after)) out.push({ field, before: before ?? null, after });
  };
  for (const [k, val] of Object.entries(changes)) {
    if (k === "seo") for (const [s, x] of Object.entries(val)) push(`seo.${s}`, doc.seo?.[s], x);
    else if (k === "imageAlts")
      for (const { key, alt, altAr } of val) {
        const img = doc.images.find((i) => i.key === key);
        if (alt !== undefined) push(`imageAlt:${key}`, img?.alt, alt);
        if (altAr !== undefined) push(`imageAltAr:${key}`, img?.altAr, altAr);
      }
    else push(k, doc[k], val);
  }
  return out;
}

const plan = [];
for (const entry of proposals) {
  validate(entry);
  const doc = (entry.kind === "product" ? products : categories).find((d) => d.slug === entry.slug);
  if (!doc) {
    errors.push(`${entry.kind}:${entry.slug}: not found`);
    continue;
  }
  if (entry.kind === "product" && doc.status !== "ACTIVE") warnings.push(`product:${entry.slug}: status ${doc.status}`);
  for (const img of entry.changes.imageAlts ?? []) if (!doc.images.some((i) => i.key === img.key)) errors.push(`product:${entry.slug}: unknown image ${img.key}`);
  plan.push({ entry, doc, diff: diff(doc, entry.changes) });
}

// ── Report ───────────────────────────────────────────────────────────────
const short = (v) => (v == null ? "∅" : typeof v === "string" ? (v.length > 140 ? `${v.slice(0, 140)}…` : v) : JSON.stringify(v).slice(0, 140));
const lines = [`# SEO ${APPLY ? "apply" : "dry run"} — ${file}`, "", `Deployment: ${deployment} · ${plan.length} document(s) · ${plan.reduce((n, p) => n + p.diff.length, 0)} field change(s)`, ""];
if (errors.length) lines.push("## Errors (nothing will be written)", ...errors.map((e) => `- ${e}`), "");
if (warnings.length) lines.push("## Warnings", ...warnings.map((w) => `- ${w}`), "");
for (const { entry, diff: d } of plan) {
  lines.push(`## ${entry.kind} · ${entry.slug}`, "");
  if (entry.verify?.length) lines.push("Needs manual verification:", ...entry.verify.map((v) => `- ${v}`), "");
  if (entry.sources?.length) lines.push("Sources:", ...entry.sources.map((s) => `- ${s}`), "");
  lines.push("| Field | Before | After |", "|---|---|---|", ...d.map((c) => `| ${c.field} | ${short(c.before).replace(/\|/g, "\\|").replace(/\n/g, " ")} | ${short(c.after).replace(/\|/g, "\\|").replace(/\n/g, " ")} |`), "");
}
const reportPath = `backups/seo/logs/${stamp}-${APPLY ? "apply" : "dry-run"}.md`;
writeFileSync(reportPath, lines.join("\n"));
console.log(`${plan.length} documents, ${plan.reduce((n, p) => n + p.diff.length, 0)} field changes, ${errors.length} errors, ${warnings.length} warnings`);
console.log(`Report: ${reportPath}`);
if (errors.length) {
  console.log(errors.map((e) => `  ✗ ${e}`).join("\n"));
  process.exit(1);
}
if (!APPLY) process.exit(0);

// ── Apply (small batches, one mutation per document) ─────────────────────
const batchId = opt("--batch");
if (!batchId || !/^[a-z0-9-]{3,60}$/.test(batchId)) {
  console.error("--apply needs --batch <id> (lowercase letters, digits, dashes)");
  process.exit(1);
}
const log = `backups/seo/logs/${batchId}.jsonl`;
let applied = 0;
for (let i = 0; i < plan.length; i += BATCH_SIZE) {
  for (const { entry, doc } of plan.slice(i, i + BATCH_SIZE)) {
    const body = { batchId, source: entry.source ?? batchId, dryRun: false, kind: entry.kind, id: doc._id, expectedUpdatedAt: doc.updatedAt, [entry.kind]: entry.changes };
    try {
      const res = JSON.parse(convex("run", "seoBulk:apply", JSON.stringify(body)));
      appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), slug: entry.slug, ...res }) + "\n");
      console.log(`  ${res.status.padEnd(9)} ${entry.slug} (${res.diff.length} field(s))`);
      if (res.status === "applied") applied++;
    } catch (e) {
      appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), slug: entry.slug, status: "error", error: String(e.stderr ?? e) }) + "\n");
      console.log(`  error     ${entry.slug}: ${String(e.stderr ?? e).split("\n").slice(-3).join(" ")}`);
    }
  }
}
console.log(`Applied ${applied}/${plan.length}. Log: ${log}. Undo: node scripts/seo/apply.mjs --rollback ${batchId} --apply`);
