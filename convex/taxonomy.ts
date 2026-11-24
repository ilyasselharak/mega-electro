import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { requireStaff } from "./lib/auth";
import { fail } from "./lib/errors";
import { opt, refreshSearchText } from "./lib/products";
import { recordSlugRedirect } from "./lib/seo";

const nullableString = v.optional(v.union(v.string(), v.null()));

// Each mutation returns the image key that was replaced/removed, so the caller can delete it from Cloudinary.

export const saveCategory = mutation({
  args: {
    id: v.union(v.string(), v.null()),
    data: v.object({
      name: v.string(),
      nameAr: nullableString,
      slug: v.string(),
      description: nullableString,
      parentId: nullableString,
      icon: nullableString,
      position: v.number(),
      isActive: v.boolean(),
      imageKey: nullableString,
      metaTitle: nullableString,
      metaDescription: nullableString,
    }),
  },
  handler: async (ctx, { id, data }) => {
    await requireStaff(ctx);
    const cid = id ? ctx.db.normalizeId("categories", id) : null;
    if (id && !cid) fail("Catégorie introuvable.");
    const parentId = data.parentId ? ctx.db.normalizeId("categories", data.parentId) ?? undefined : undefined;
    if (cid && parentId === cid) fail("Une catégorie ne peut pas être son propre parent.");
    if (cid && parentId) {
      // Prevent cycles: walk up from the new parent
      let cursor: Id<"categories"> | undefined = parentId;
      for (let depth = 0; cursor && depth < 10; depth++) {
        if (cursor === cid) fail("Hiérarchie invalide (boucle).");
        cursor = (await ctx.db.get(cursor))?.parentId;
      }
    }
    const sameSlug = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", data.slug)).first();
    if (sameSlug && sameSlug._id !== cid) fail("Cette valeur existe déjà (slug).");

    const fields = {
      name: data.name,
      nameAr: opt(data.nameAr),
      slug: data.slug,
      description: opt(data.description),
      parentId,
      icon: opt(data.icon),
      position: data.position,
      isActive: data.isActive,
      imageKey: opt(data.imageKey),
      metaTitle: opt(data.metaTitle),
      metaDescription: opt(data.metaDescription),
      updatedAt: Date.now(),
    };
    if (!cid) return { id: (await ctx.db.insert("categories", fields)) as string, replacedKey: null };

    const previous = await ctx.db.get(cid);
    if (!previous) fail("Catégorie introuvable.");
    // Keep the advanced SEO fields edited in Admin → SEO.
    await ctx.db.replace(cid, { ...fields, seo: previous.seo });
    await recordSlugRedirect(ctx, "/categorie", previous.slug, fields.slug);
    if (previous.name !== fields.name) await refreshSearchText(ctx, await ctx.db.query("products").withIndex("by_category", (q) => q.eq("categoryId", cid)).collect());
    return { id: cid as string, replacedKey: previous.imageKey && previous.imageKey !== fields.imageKey ? previous.imageKey : null };
  },
});

export const deleteCategory = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const cid = ctx.db.normalizeId("categories", id);
    const cat = cid ? await ctx.db.get(cid) : null;
    if (!cat) fail("Catégorie introuvable.");
    const products = await ctx.db.query("products").withIndex("by_category", (q) => q.eq("categoryId", cat._id)).collect();
    if (products.length) fail(`Impossible : ${products.length} produit(s) utilisent cette catégorie.`);
    if (await ctx.db.query("categories").withIndex("by_parent", (q) => q.eq("parentId", cat._id)).first()) fail("Impossible : cette catégorie a des sous-catégories.");
    await ctx.db.delete(cat._id);
    return { replacedKey: cat.imageKey ?? null };
  },
});

export const saveBrand = mutation({
  args: {
    id: v.union(v.string(), v.null()),
    data: v.object({
      name: v.string(),
      slug: v.string(),
      description: nullableString,
      isActive: v.boolean(),
      logoKey: nullableString,
      metaTitle: nullableString,
      metaDescription: nullableString,
    }),
  },
  handler: async (ctx, { id, data }) => {
    await requireStaff(ctx);
    const bid = id ? ctx.db.normalizeId("brands", id) : null;
    if (id && !bid) fail("Marque introuvable.");
    const sameSlug = await ctx.db.query("brands").withIndex("by_slug", (q) => q.eq("slug", data.slug)).first();
    if (sameSlug && sameSlug._id !== bid) fail("Cette valeur existe déjà (slug).");
    const fields = {
      name: data.name,
      slug: data.slug,
      description: opt(data.description),
      isActive: data.isActive,
      logoKey: opt(data.logoKey),
      metaTitle: opt(data.metaTitle),
      metaDescription: opt(data.metaDescription),
      updatedAt: Date.now(),
    };
    if (!bid) return { id: (await ctx.db.insert("brands", fields)) as string, replacedKey: null };

    const previous = await ctx.db.get(bid);
    if (!previous) fail("Marque introuvable.");
    await ctx.db.replace(bid, fields);
    await recordSlugRedirect(ctx, "/marque", previous.slug, fields.slug);
    if (previous.name !== fields.name) await refreshSearchText(ctx, await ctx.db.query("products").withIndex("by_brand", (q) => q.eq("brandId", bid)).collect());
    return { id: bid as string, replacedKey: previous.logoKey && previous.logoKey !== fields.logoKey ? previous.logoKey : null };
  },
});

export const deleteBrand = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const bid = ctx.db.normalizeId("brands", id);
    const brand = bid ? await ctx.db.get(bid) : null;
    if (!brand) fail("Marque introuvable.");
    const products = await ctx.db.query("products").withIndex("by_brand", (q) => q.eq("brandId", brand._id)).collect();
    if (products.length) fail(`Impossible : ${products.length} produit(s) utilisent cette marque.`);
    await ctx.db.delete(brand._id);
    return { replacedKey: brand.logoKey ?? null };
  },
});
