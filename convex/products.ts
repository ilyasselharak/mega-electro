import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { requireStaff, type AppUser } from "./lib/auth";
import { fail } from "./lib/errors";
import { buildSearchText, opt } from "./lib/products";
import { recordSlugRedirect } from "./lib/seo";
import { faqEntry, movementReason, productImage, productStatus } from "./schema";

const productInput = v.object({
  name: v.string(),
  nameAr: v.optional(v.union(v.string(), v.null())),
  faq: v.optional(v.array(faqEntry)),
  slug: v.string(),
  sku: v.string(),
  shortDescription: v.optional(v.union(v.string(), v.null())),
  description: v.optional(v.union(v.string(), v.null())),
  price: v.number(),
  compareAtPrice: v.optional(v.union(v.number(), v.null())),
  costPrice: v.optional(v.union(v.number(), v.null())),
  stock: v.number(),
  lowStockThreshold: v.number(),
  status: productStatus,
  isFeatured: v.boolean(),
  warrantyMonths: v.optional(v.union(v.number(), v.null())),
  categoryId: v.optional(v.union(v.string(), v.null())),
  brandId: v.optional(v.union(v.string(), v.null())),
  specs: v.array(v.object({ label: v.string(), value: v.string() })),
  images: v.array(productImage),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
});

export async function logMovement(
  ctx: MutationCtx,
  m: { productId: Id<"products">; delta: number; stockAfter: number; reason: "RESTOCK" | "SALE" | "ORDER_CANCELLED" | "ADJUSTMENT" | "RETURN" | "DAMAGE"; note?: string; orderId?: Id<"orders">; user?: AppUser | null },
) {
  const { user, ...rest } = m;
  await ctx.db.insert("inventoryMovements", { ...rest, userId: user?.id, userName: user?.name });
}

async function assertUnique(ctx: MutationCtx, id: Id<"products"> | null, slug: string, sku: string) {
  const bySlug = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", slug)).first();
  if (bySlug && bySlug._id !== id) fail("Cette valeur existe déjà (slug).");
  const bySku = await ctx.db.query("products").withIndex("by_sku", (q) => q.eq("sku", sku)).first();
  if (bySku && bySku._id !== id) fail("Cette valeur existe déjà (sku).");
}

/** Creates or updates a product. Returns the image keys that were removed (to delete from Cloudinary). */
export const save = mutation({
  args: { id: v.union(v.string(), v.null()), data: productInput },
  handler: async (ctx, { id, data }) => {
    const user = await requireStaff(ctx);
    const pid = id ? ctx.db.normalizeId("products", id) : null;
    if (id && !pid) fail("Produit introuvable.");
    await assertUnique(ctx, pid, data.slug, data.sku);

    const categoryId = data.categoryId ? ctx.db.normalizeId("categories", data.categoryId) ?? undefined : undefined;
    const brandId = data.brandId ? ctx.db.normalizeId("brands", data.brandId) ?? undefined : undefined;
    const fields = {
      name: data.name,
      nameAr: opt(data.nameAr?.trim()),
      faq: data.faq?.length ? data.faq : undefined,
      slug: data.slug,
      sku: data.sku,
      shortDescription: opt(data.shortDescription),
      description: opt(data.description),
      price: data.price,
      compareAtPrice: opt(data.compareAtPrice),
      costPrice: opt(data.costPrice),
      stock: data.stock,
      lowStockThreshold: data.lowStockThreshold,
      status: data.status,
      isFeatured: data.isFeatured,
      warrantyMonths: opt(data.warrantyMonths),
      categoryId,
      brandId,
      specs: data.specs,
      images: data.images.map((i) => ({ ...i, alt: opt(i.alt) })),
      metaTitle: opt(data.metaTitle),
      metaDescription: opt(data.metaDescription),
      updatedAt: Date.now(),
    };
    const searchText = await buildSearchText(ctx, fields);

    if (!pid) {
      const newId = await ctx.db.insert("products", { ...fields, searchText, salesCount: 0 });
      if (data.stock > 0) await logMovement(ctx, { productId: newId, delta: data.stock, stockAfter: data.stock, reason: "RESTOCK", note: "Stock initial", user });
      return { id: newId as string, slug: fields.slug, removedKeys: [] as string[] };
    }

    const existing = await ctx.db.get(pid);
    if (!existing) fail("Produit introuvable.");
    const keep = new Set(fields.images.map((i) => i.key));
    const removedKeys = existing.images.map((i) => i.key).filter((k) => !keep.has(k));
    await ctx.db.patch(pid, { ...fields, searchText });
    await recordSlugRedirect(ctx, "/produit", existing.slug, fields.slug);
    const delta = data.stock - existing.stock;
    if (delta !== 0) await logMovement(ctx, { productId: pid, delta, stockAfter: data.stock, reason: "ADJUSTMENT", note: "Modification depuis la fiche produit", user });
    return { id: pid as string, slug: fields.slug, removedKeys };
  },
});

/** Deletes a product, or archives it when it was already sold (keeps order history intact). */
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const pid = ctx.db.normalizeId("products", id);
    const p = pid ? await ctx.db.get(pid) : null;
    if (!p) fail("Produit introuvable.");
    const sold = (await ctx.db.query("orders").collect()).some((o) => o.items.some((i) => i.productId === p._id));
    if (sold) {
      await ctx.db.patch(p._id, { status: "ARCHIVED", updatedAt: Date.now() });
      return { removedKeys: [] as string[] };
    }
    for (const m of await ctx.db.query("inventoryMovements").withIndex("by_product", (q) => q.eq("productId", p._id)).collect()) await ctx.db.delete(m._id);
    await ctx.db.delete(p._id);
    return { removedKeys: p.images.map((i) => i.key) };
  },
});

export const setStatus = mutation({
  args: { ids: v.array(v.string()), status: productStatus },
  handler: async (ctx, { ids, status }) => {
    await requireStaff(ctx);
    for (const id of ids) {
      const pid = ctx.db.normalizeId("products", id);
      if (pid) await ctx.db.patch(pid, { status, updatedAt: Date.now() });
    }
  },
});

export const duplicate = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const pid = ctx.db.normalizeId("products", id);
    const p = pid ? await ctx.db.get(pid) : null;
    if (!p) fail("Produit introuvable.");
    const suffix = Date.now().toString(36).slice(-4);
    // Images are not copied: the copy would share (and later delete) the same Cloudinary files.
    const { _id, _creationTime, sourceId, sourceSyncedAt, ...rest } = p;
    void _id; void _creationTime; void sourceId; void sourceSyncedAt;
    const copy = {
      ...rest,
      name: `${p.name} (copie)`,
      slug: `${p.slug}-copie-${suffix}`,
      sku: `${p.sku}-C${suffix}`.toUpperCase(),
      status: "DRAFT" as const,
      stock: 0,
      isFeatured: false,
      salesCount: 0,
      images: [],
      // SEO metadata must stay unique per page: the copy starts with automatic fallbacks.
      metaTitle: undefined,
      metaDescription: undefined,
      seo: undefined,
      updatedAt: Date.now(),
    };
    return (await ctx.db.insert("products", { ...copy, searchText: await buildSearchText(ctx, copy) })) as string;
  },
});

export const adjustStock = mutation({
  args: { productId: v.string(), delta: v.number(), reason: movementReason, note: v.optional(v.string()) },
  handler: async (ctx, { productId, delta, reason, note }) => {
    const user = await requireStaff(ctx);
    const pid = ctx.db.normalizeId("products", productId);
    const p = pid ? await ctx.db.get(pid) : null;
    if (!p) fail("Produit introuvable.");
    if (!Number.isInteger(delta) || delta === 0) fail("La quantité ne peut pas être 0");
    if (p.stock + delta < 0) fail("Stock insuffisant pour ce retrait.");
    const stock = p.stock + delta;
    await ctx.db.patch(p._id, { stock, updatedAt: Date.now() });
    await logMovement(ctx, { productId: p._id, delta, stockAfter: stock, reason, note: opt(note), user });
    return stock;
  },
});
