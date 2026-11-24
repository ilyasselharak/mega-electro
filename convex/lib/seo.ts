import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { DEFAULT_SEO, type SeoMetaValues, type SeoSettingsValues } from "./seoRules";

export async function readSeoSettings(ctx: QueryCtx | MutationCtx): Promise<SeoSettingsValues> {
  const doc = await ctx.db.query("seoSettings").first();
  const out: SeoSettingsValues = { ...DEFAULT_SEO };
  if (doc) {
    for (const key of Object.keys(DEFAULT_SEO) as (keyof SeoSettingsValues)[]) {
      const value = doc[key];
      if (value !== undefined) (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

/** Normalised copy of an entity's SEO object (empty strings dropped). */
export function cleanSeo(seo: SeoMetaValues | undefined | null): SeoMetaValues | undefined {
  if (!seo) return undefined;
  const out: SeoMetaValues = {};
  for (const [k, v] of Object.entries(seo)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string") {
      const t = v.trim();
      if (t) (out as Record<string, unknown>)[k] = t;
    } else if (v === true) (out as Record<string, unknown>)[k] = true;
  }
  return Object.keys(out).length ? out : undefined;
}

export function seoOut(seo: Doc<"categories">["seo"] | Doc<"products">["seo"]): SeoMetaValues {
  return { ...(seo ?? {}) };
}

/**
 * Records a 301 after a slug change: old path → new path.
 * Re-points older redirects to the new path (no chains) and drops any redirect from the new path (no loops).
 */
export async function recordSlugRedirect(ctx: MutationCtx, prefix: "/produit" | "/categorie" | "/marque", oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  const from = `${prefix}/${oldSlug}`;
  const to = `${prefix}/${newSlug}`;
  const now = Date.now();
  for (const r of await ctx.db.query("redirects").collect()) {
    if (r.to === from) await ctx.db.patch(r._id, { to, updatedAt: now });
  }
  const loop = await ctx.db.query("redirects").withIndex("by_from", (q) => q.eq("from", to)).first();
  if (loop) await ctx.db.delete(loop._id);
  const existing = await ctx.db.query("redirects").withIndex("by_from", (q) => q.eq("from", from)).first();
  if (existing) await ctx.db.patch(existing._id, { to, statusCode: 301, updatedAt: now });
  else await ctx.db.insert("redirects", { from, to, statusCode: 301, auto: true, note: "Changement d'URL", updatedAt: now });
}
