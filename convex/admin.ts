import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import { requireStaff, requireAdmin } from "./lib/auth";
import { readSettings } from "./lib/settings";
import { brandOut, categoryOut } from "./catalog";
import { orderStatus, productStatus } from "./schema";

// Back-office reads. Every function checks the caller is STAFF or ADMIN.

const PAGE_SIZE = 25;
const DAY = 86_400_000;
const VALID: Doc<"orders">["status"][] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const contains = (hay: string | undefined | null, needle: string) => (hay ?? "").toLowerCase().includes(needle);
const pageOf = <T>(list: T[], page: number) => ({
  items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  total: list.length,
  page,
  pageCount: Math.max(1, Math.ceil(list.length / PAGE_SIZE)),
});

export const pendingCount = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    return (await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", "PENDING")).collect()).length;
  },
});

export const dashboard = query({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    await requireStaff(ctx);
    const since30 = now - 30 * DAY;
    const start14 = new Date(now - 13 * DAY);
    start14.setUTCHours(0, 0, 0, 0);

    const recentAll = await ctx.db.query("orders").withIndex("by_creation_time", (q) => q.gte("_creationTime", Math.min(since30, start14.getTime()))).collect();
    const last30 = recentAll.filter((o) => o._creationTime >= since30);
    const valid30 = last30.filter((o) => VALID.includes(o.status));
    const revenue = valid30.reduce((s, o) => s + o.total, 0);

    const products = (await ctx.db.query("products").withIndex("by_status", (q) => q.eq("status", "ACTIVE")).collect());
    const top = new Map<string, { productId: string | null; name: string; quantity: number; revenue: number }>();
    for (const o of valid30) {
      for (const it of o.items) {
        const k = `${it.productId ?? ""}|${it.name}`;
        const row = top.get(k) ?? { productId: (it.productId as string | undefined) ?? null, name: it.name, quantity: 0, revenue: 0 };
        row.quantity += it.quantity;
        row.revenue += it.lineTotal;
        top.set(k, row);
      }
    }

    const series = Array.from({ length: 14 }, (_, i) => {
      const from = start14.getTime() + i * DAY;
      const day = recentAll.filter((o) => o._creationTime >= from && o._creationTime < from + DAY && o.status !== "CANCELLED" && o.status !== "RETURNED");
      return { date: new Date(from).toISOString(), revenue: day.reduce((s, o) => s + o.total, 0), orders: day.length };
    });

    const recentOrders = (await ctx.db.query("orders").order("desc").take(8)).map((o) => ({
      id: o._id as string,
      number: o.number,
      fullName: o.fullName,
      city: o.city,
      total: o.total,
      status: o.status,
      createdAt: o._creationTime,
    }));

    return {
      revenue30: revenue,
      orders30: last30.length,
      averageOrder: last30.length ? Math.round(revenue / last30.length) : 0,
      pending: (await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", "PENDING")).collect()).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      outOfStock: products.filter((p) => p.stock <= 0).length,
      customers: await ctx.runQuery(components.betterAuth.users.countByRole, { role: "CUSTOMER" }),
      recentOrders,
      series,
      topProducts: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  },
});

export const listOrders = query({
  args: { status: v.optional(orderStatus), q: v.optional(v.string()), page: v.optional(v.number()) },
  handler: async (ctx, { status, q, page = 1 }) => {
    await requireStaff(ctx);
    const all = await ctx.db.query("orders").order("desc").collect();
    const counts: Partial<Record<Doc<"orders">["status"], number>> = {};
    for (const o of all) counts[o.status] = (counts[o.status] ?? 0) + 1;
    const needle = q?.trim().toLowerCase();
    const phone = needle?.replace(/\s/g, "");
    const filtered = all.filter(
      (o) =>
        (!status || o.status === status) &&
        (!needle || contains(o.number, needle) || contains(o.fullName, needle) || o.phone.includes(phone!) || contains(o.city, needle)),
    );
    const p = pageOf(filtered, page);
    return {
      ...p,
      items: p.items.map((o) => ({
        id: o._id as string,
        number: o.number,
        fullName: o.fullName,
        phone: o.phone,
        city: o.city,
        total: o.total,
        status: o.status,
        createdAt: o._creationTime,
        _count: { items: o.items.length },
      })),
      counts,
    };
  },
});

export const getOrder = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const nid = ctx.db.normalizeId("orders", id);
    const o = nid ? await ctx.db.get(nid) : null;
    if (!o) return null;
    const events = await ctx.db.query("orderEvents").withIndex("by_order", (q) => q.eq("orderId", o._id)).order("desc").collect();
    const user = o.userId ? await ctx.runQuery(components.betterAuth.users.getById, { id: o.userId }) : null;
    return {
      id: o._id as string,
      number: o.number,
      status: o.status,
      paymentStatus: o.paymentStatus,
      fullName: o.fullName,
      phone: o.phone,
      email: o.email ?? null,
      city: o.city,
      address: o.address,
      customerNote: o.customerNote ?? null,
      internalNote: o.internalNote ?? null,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      total: o.total,
      userId: o.userId ?? null,
      createdAt: o._creationTime,
      items: await Promise.all(
        o.items.map(async (it, i) => {
          const product = it.productId ? await ctx.db.get(it.productId) : null;
          return {
            id: `${o._id}-${i}`,
            productId: (it.productId as string | undefined) ?? null,
            name: it.name,
            sku: it.sku,
            imageKey: it.imageKey ?? null,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            lineTotal: it.lineTotal,
            product: product ? { slug: product.slug, stock: product.stock } : null,
          };
        }),
      ),
      events: events.map((e) => ({
        id: e._id as string,
        status: e.status ?? null,
        message: e.message,
        createdAt: e._creationTime,
        user: e.userName ? { name: e.userName } : null,
      })),
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    };
  },
});

export const listProducts = query({
  args: { q: v.optional(v.string()), status: v.optional(productStatus), categoryId: v.optional(v.string()), stock: v.optional(v.union(v.literal("low"), v.literal("out"))), page: v.optional(v.number()) },
  handler: async (ctx, { q, status, categoryId, stock, page = 1 }) => {
    await requireStaff(ctx);
    const needle = q?.trim().toLowerCase();
    const all = (status ? await ctx.db.query("products").withIndex("by_status", (x) => x.eq("status", status)).collect() : await ctx.db.query("products").collect())
      .filter(
        (p) =>
          (!categoryId || p.categoryId === categoryId) &&
          (stock === "out" ? p.stock <= 0 : stock === "low" ? p.stock > 0 && p.stock <= 5 : true) &&
          (!needle || contains(p.name, needle) || contains(p.sku, needle)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const p = pageOf(all, page);
    const cats = new Map<string, Doc<"categories"> | null>();
    const brands = new Map<string, Doc<"brands"> | null>();
    return {
      ...p,
      items: await Promise.all(
        p.items.map(async (x) => {
          if (x.categoryId && !cats.has(x.categoryId)) cats.set(x.categoryId, await ctx.db.get(x.categoryId));
          if (x.brandId && !brands.has(x.brandId)) brands.set(x.brandId, await ctx.db.get(x.brandId));
          const cat = x.categoryId ? cats.get(x.categoryId) : null;
          const brand = x.brandId ? brands.get(x.brandId) : null;
          return {
            id: x._id as string,
            name: x.name,
            slug: x.slug,
            sku: x.sku,
            price: x.price,
            compareAtPrice: x.compareAtPrice ?? null,
            stock: x.stock,
            lowStockThreshold: x.lowStockThreshold,
            status: x.status,
            isFeatured: x.isFeatured,
            updatedAt: x.updatedAt,
            sourceId: x.sourceId ?? null,
            category: cat ? { name: cat.name } : null,
            brand: brand ? { name: brand.name } : null,
            images: x.images.slice(0, 1).map((i) => ({ key: i.key })),
          };
        }),
      ),
    };
  },
});

export const getProduct = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const nid = ctx.db.normalizeId("products", id);
    const p = nid ? await ctx.db.get(nid) : null;
    if (!p) return null;
    return {
      id: p._id as string,
      name: p.name,
      nameAr: p.nameAr ?? null,
      faq: p.faq ?? [],
      slug: p.slug,
      sku: p.sku,
      shortDescription: p.shortDescription ?? null,
      description: p.description ?? null,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      costPrice: p.costPrice ?? null,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status: p.status,
      isFeatured: p.isFeatured,
      warrantyMonths: p.warrantyMonths ?? null,
      categoryId: (p.categoryId as string | undefined) ?? null,
      brandId: (p.brandId as string | undefined) ?? null,
      specs: p.specs,
      metaTitle: p.metaTitle ?? null,
      metaDescription: p.metaDescription ?? null,
      salesCount: p.salesCount,
      sourceId: p.sourceId ?? null,
      updatedAt: p.updatedAt,
      images: p.images.map((i) => ({
        id: i.key,
        key: i.key,
        thumbKey: null,
        alt: i.alt ?? null,
        width: i.width ?? null,
        height: i.height ?? null,
        size: i.size ?? null,
        mimeType: i.mimeType ?? null,
      })),
    };
  },
});

export const taxonomyOptions = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const categories = await ctx.db.query("categories").collect();
    const brands = await ctx.db.query("brands").collect();
    const label = (c: Doc<"categories">) => {
      const parent = c.parentId ? categories.find((p) => p._id === c.parentId) : null;
      return parent ? `${parent.name} › ${c.name}` : c.name;
    };
    return {
      categories: categories
        .map((c) => ({ id: c._id as string, name: label(c), parentId: (c.parentId as string | undefined) ?? null }))
        .sort((a, b) => a.name.localeCompare(b.name, "fr")),
      brands: brands.map((b) => ({ id: b._id as string, name: b.name })).sort((a, b) => a.name.localeCompare(b.name, "fr")),
    };
  },
});

export const categories = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const products = await ctx.db.query("products").collect();
    return (await ctx.db.query("categories").collect())
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name, "fr"))
      .map((c) => ({ ...categoryOut(c), _count: { products: products.filter((p) => p.categoryId === c._id).length } }));
  },
});

export const brands = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const products = await ctx.db.query("products").collect();
    return (await ctx.db.query("brands").collect())
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      .map((b) => ({ ...brandOut(b), _count: { products: products.filter((p) => p.brandId === b._id).length } }));
  },
});

export const inventory = query({
  args: { q: v.optional(v.string()), filter: v.optional(v.union(v.literal("low"), v.literal("out"))), page: v.optional(v.number()) },
  handler: async (ctx, { q, filter, page = 1 }) => {
    await requireStaff(ctx);
    const needle = q?.trim().toLowerCase();
    const list = (await ctx.db.query("products").collect())
      .filter(
        (p) =>
          p.status !== "ARCHIVED" &&
          (filter === "out" ? p.stock <= 0 : filter === "low" ? p.stock > 0 && p.stock <= p.lowStockThreshold : true) &&
          (!needle || contains(p.name, needle) || contains(p.sku, needle)),
      )
      .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name, "fr"));
    const p = pageOf(list, page);
    const movements = await ctx.db.query("inventoryMovements").order("desc").take(30);
    return {
      ...p,
      items: p.items.map((x) => ({
        id: x._id as string,
        name: x.name,
        sku: x.sku,
        stock: x.stock,
        lowStockThreshold: x.lowStockThreshold,
        status: x.status,
        images: x.images.slice(0, 1).map((i) => ({ key: i.key })),
      })),
      movements: await Promise.all(
        movements.map(async (m) => {
          const product = await ctx.db.get(m.productId);
          return {
            id: m._id as string,
            delta: m.delta,
            stockAfter: m.stockAfter,
            reason: m.reason,
            note: m.note ?? null,
            createdAt: m._creationTime,
            product: { name: product?.name ?? "Produit supprimé", sku: product?.sku ?? "" },
            user: m.userName ? { name: m.userName } : null,
          };
        }),
      ),
    };
  },
});

export const customers = query({
  args: { q: v.optional(v.string()), page: v.optional(v.number()) },
  handler: async (ctx, { q, page = 1 }) => {
    await requireStaff(ctx);
    const users: { id: string; name: string; email: string; phone: string | null; role: string; createdAt: number }[] = await ctx.runQuery(components.betterAuth.users.list, { q });
    const orders = await ctx.db.query("orders").collect();
    const orderCount = new Map<string, number>();
    const guests = new Map<string, { phone: string; fullName: string; city: string; _count: number; _sum: { total: number } }>();
    for (const o of orders) {
      if (o.userId) {
        orderCount.set(o.userId, (orderCount.get(o.userId) ?? 0) + 1);
        continue;
      }
      const k = `${o.phone}|${o.fullName}|${o.city}`;
      const g = guests.get(k) ?? { phone: o.phone, fullName: o.fullName, city: o.city, _count: 0, _sum: { total: 0 } };
      g._count++;
      g._sum.total += o.total;
      guests.set(k, g);
    }
    const p = pageOf(users, page);
    return {
      ...p,
      items: p.items.map((u) => ({ ...u, _count: { orders: orderCount.get(u.id) ?? 0 } })),
      guests: [...guests.values()].sort((a, b) => b._sum.total - a._sum.total).slice(0, 20),
    };
  },
});

export const settings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return readSettings(ctx);
  },
});

export const linkedProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    return (await ctx.db.query("products").collect())
      .filter((p) => p.sourceId)
      .map((p) => ({ id: p._id as string, sourceId: p.sourceId!, stock: p.stock, price: p.price, sourceSyncedAt: p.sourceSyncedAt ?? null }));
  },
});
