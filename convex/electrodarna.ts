import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction, internalMutation, internalQuery, type ActionCtx } from "./_generated/server";
import { requireStaff } from "./lib/auth";
import { deleteImages, uploadFromUrl, type CloudinaryUpload } from "./lib/cloudinary";
import { fail } from "./lib/errors";
import { buildSearchText } from "./lib/products";
import { slugify } from "./lib/slug";
import { logMovement } from "./products";

/**
 * Link with the Electro Darna shop (its feed: electro-darna/convex/catalogShare.ts).
 * Convex env: ELECTRODARNA_API_URL (https://<deployment>.convex.site), ELECTRODARNA_API_KEY (= its CATALOG_SHARE_KEY).
 */

export type RemoteProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  brandSlug: string | null;
  category: string | null;
  categoryName: string | null;
  description: string;
  warranty: string | null;
  price: number; // DH
  compareAtPrice: number | null; // DH
  stock: number | null; // null = not tracked by quantity
  available: boolean;
  isActive: boolean;
  imageUrls: string[];
  updatedAt: number;
};

/** Stock given to a product Electro Darna marks "in stock" without tracking a quantity. */
const UNTRACKED_AVAILABLE_STOCK = 10;
const MAX_IMAGES = 15;

const remoteStock = (p: RemoteProduct | undefined) => (!p || !p.available ? 0 : (p.stock ?? UNTRACKED_AVAILABLE_STOCK));

async function callFeed(ids?: string[]): Promise<RemoteProduct[]> {
  const base = process.env.ELECTRODARNA_API_URL;
  const key = process.env.ELECTRODARNA_API_KEY;
  if (!base || !key) fail("Le lien n'est pas configuré : ajoutez ELECTRODARNA_API_URL et ELECTRODARNA_API_KEY dans l'environnement Convex.");
  const res = await fetch(`${base.replace(/\/$/, "")}/api/catalog/products`, {
    method: ids ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: ids ? JSON.stringify({ ids }) : undefined,
  });
  if (!res.ok) fail(`Electro Darna a répondu ${res.status}`);
  return ((await res.json()) as { items: RemoteProduct[] }).items;
}

async function fetchByIds(ids: string[]) {
  const out: RemoteProduct[] = [];
  for (let i = 0; i < ids.length; i += 1000) out.push(...(await callFeed(ids.slice(i, i + 1000))));
  return out;
}

function warrantyMonths(text: string | null) {
  if (!text) return undefined;
  const years = text.match(/(\d+)\s*(an|ans|année|years?)/i);
  if (years) return Math.min(240, Number(years[1]) * 12);
  const months = text.match(/(\d+)\s*(mois|months?)/i);
  return months ? Math.min(240, Number(months[1])) : undefined;
}

// ── Browse ─────────────────────────────────────────────────

/** Remote catalog for the admin page. */
export const catalog = action({
  args: {},
  handler: async (ctx): Promise<RemoteProduct[]> => {
    await requireStaff(ctx);
    return callFeed();
  },
});

// ── Clone ──────────────────────────────────────────────────

export const linkedIds = internalQuery({
  args: {},
  handler: async (ctx) => (await ctx.db.query("products").collect()).filter((p) => p.sourceId).map((p) => ({ id: p._id, sourceId: p.sourceId! })),
});

export const createClone = internalMutation({
  args: {
    remote: v.any(),
    images: v.array(v.object({ key: v.string(), width: v.number(), height: v.number(), size: v.number(), mimeType: v.string() })),
    status: v.union(v.literal("DRAFT"), v.literal("ACTIVE")),
    userId: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, { remote, images, status, userId, userName }) => {
    const p = remote as RemoteProduct;
    if (await ctx.db.query("products").withIndex("by_source", (q) => q.eq("sourceId", p.id)).first()) return { created: false };

    // Brand: reuse by slug, create it otherwise.
    let brandId: Id<"brands"> | undefined;
    if (p.brand) {
      const slug = p.brandSlug || slugify(p.brand);
      const brand = await ctx.db.query("brands").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
      brandId = brand?._id ?? (await ctx.db.insert("brands", { name: p.brand, slug, isActive: true, updatedAt: Date.now() }));
    }
    // Category: only matched, never created (the admin can set it afterwards).
    let categoryId: Id<"categories"> | undefined;
    for (const slug of [p.category, p.categoryName ? slugify(p.categoryName) : null]) {
      if (!slug || categoryId) continue;
      categoryId = (await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", slug)).first())?._id;
    }

    const unique = async (base: string, index: "by_slug" | "by_sku") => {
      const taken = async (s: string) => Boolean(await ctx.db.query("products").withIndex(index, (q) => q.eq(index === "by_slug" ? "slug" : "sku", s)).first());
      if (!(await taken(base))) return base;
      for (let i = 2; i < 100; i++) if (!(await taken(`${base}-${i}`))) return `${base}-${i}`;
      return `${base}-${crypto.randomUUID().slice(0, 6)}`;
    };

    const price = Math.round(p.price * 100);
    const compareAtPrice = p.compareAtPrice ? Math.round(p.compareAtPrice * 100) : undefined;
    const stock = remoteStock(p);
    const fields = {
      name: p.name.slice(0, 160),
      slug: await unique(slugify(p.slug || p.name) || "produit", "by_slug"),
      sku: await unique(`ED-${p.id.slice(-8).toUpperCase()}`, "by_sku"),
      description: p.description || undefined,
      price,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
      stock,
      lowStockThreshold: 3,
      status,
      isFeatured: false,
      warrantyMonths: warrantyMonths(p.warranty),
      specs: [],
      brandId,
      categoryId,
      images: images.map((i) => ({ ...i, alt: p.name.slice(0, 160) })),
      salesCount: 0,
      sourceId: p.id,
      sourceSyncedAt: Date.now(),
      updatedAt: Date.now(),
    };
    const productId = await ctx.db.insert("products", { ...fields, searchText: await buildSearchText(ctx, fields) });
    if (stock > 0) await logMovement(ctx, { productId, delta: stock, stockAfter: stock, reason: "RESTOCK", note: "Import Electro Darna", user: { id: userId, name: userName, email: "", role: "STAFF", phone: null } });
    return { created: true };
  },
});

export const importProducts = action({
  args: { ids: v.array(v.string()), status: v.union(v.literal("DRAFT"), v.literal("ACTIVE")) },
  handler: async (ctx, { ids, status }): Promise<{ created: number; skipped: number; failed: string[] }> => {
    const user = await requireStaff(ctx);
    if (!ids.length || ids.length > 50) fail("Sélectionnez entre 1 et 50 produits.");
    const remote = await fetchByIds(ids);
    if (!remote.length) fail("Produits introuvables sur Electro Darna.");
    const linked = new Set((await ctx.runQuery(internal.electrodarna.linkedIds, {})).map((l) => l.sourceId));

    let created = 0;
    let skipped = 0;
    const failed: string[] = [];
    for (const p of remote) {
      if (linked.has(p.id)) {
        skipped++;
        continue;
      }
      const images: CloudinaryUpload[] = [];
      try {
        for (const url of p.imageUrls.slice(0, MAX_IMAGES)) {
          try {
            images.push(await uploadFromUrl(url, "products"));
          } catch (err) {
            console.warn("Electro Darna image import failed", url, err);
          }
        }
        const res = await ctx.runMutation(internal.electrodarna.createClone, { remote: p, images, status, userId: user.id, userName: user.name });
        if (res.created) created++;
        else {
          skipped++;
          await deleteImages(images.map((i) => i.key));
        }
      } catch (err) {
        console.error("Electro Darna clone failed", p.id, err);
        await deleteImages(images.map((i) => i.key));
        failed.push(p.name);
      }
    }
    return { created, skipped, failed };
  },
});

// ── Stock sync ─────────────────────────────────────────────

export const applyStock = internalMutation({
  args: { levels: v.array(v.object({ id: v.id("products"), stock: v.number() })), userId: v.optional(v.string()), userName: v.optional(v.string()) },
  handler: async (ctx, { levels, userId, userName }) => {
    let updated = 0;
    const now = Date.now();
    for (const { id, stock } of levels) {
      const p = await ctx.db.get(id);
      if (!p) continue;
      await ctx.db.patch(id, { stock, sourceSyncedAt: now });
      const delta = stock - p.stock;
      if (delta === 0) continue;
      await ctx.db.insert("inventoryMovements", { productId: id, delta, stockAfter: stock, reason: "ADJUSTMENT", note: "Synchro Electro Darna", userId, userName });
      updated++;
    }
    return updated;
  },
});

type SyncResult = { checked: number; updated: number; outOfStock: number };

/**
 * Aligns the stock of every cloned product with Electro Darna.
 * Products removed or deactivated there fall to 0. Prices are left alone.
 */
async function runSync(ctx: ActionCtx, user?: { id: string; name: string }): Promise<SyncResult> {
  const linked = await ctx.runQuery(internal.electrodarna.linkedIds, {});
  if (!linked.length) return { checked: 0, updated: 0, outOfStock: 0 };
  const remote = new Map((await fetchByIds(linked.map((l) => l.sourceId))).map((p) => [p.id, p]));
  const levels = linked.map((l) => ({ id: l.id, stock: remoteStock(remote.get(l.sourceId)) }));
  const updated: number = await ctx.runMutation(internal.electrodarna.applyStock, { levels, userId: user?.id, userName: user?.name });
  return { checked: linked.length, updated, outOfStock: levels.filter((l) => l.stock === 0).length };
}

/** Scheduled from crons.ts. */
export const syncStock = internalAction({ args: {}, handler: (ctx): Promise<SyncResult> => runSync(ctx) });

/** "Synchroniser le stock" button. */
export const syncNow = action({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    const user = await requireStaff(ctx);
    return runSync(ctx, user);
  },
});
