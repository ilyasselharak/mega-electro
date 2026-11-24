import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { currentUser, requireStaff } from "./lib/auth";
import { fail } from "./lib/errors";
import { opt } from "./lib/products";
import { deliveryFor } from "./lib/delivery";
import { readDeliveryConfig } from "./delivery";
import { logMovement } from "./products";
import { orderStatus } from "./schema";

type Status = Doc<"orders">["status"];

const LABELS: Record<Status, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};
const TRANSITIONS: Record<Status, Status[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};
const RELEASED: Status[] = ["CANCELLED", "RETURNED"];
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function orderNumber() {
  const d = new Date();
  const date = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `DZ${date}-${suffix}`;
}

/** Public checkout. Runs as one transaction: prices and stock are read and written atomically. */
export const create = mutation({
  args: {
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    city: v.string(),
    address: v.string(),
    note: v.optional(v.string()),
    items: v.array(v.object({ productId: v.string(), quantity: v.number() })),
  },
  handler: async (ctx, a) => {
    if (!a.items.length || a.items.length > 50) fail("Votre panier est vide");
    const user = await currentUser(ctx);

    // Merge duplicate lines
    const qty = new Map<Id<"products">, number>();
    for (const it of a.items) {
      const id = ctx.db.normalizeId("products", it.productId);
      if (!id || !Number.isInteger(it.quantity) || it.quantity < 1) fail("Certains produits de votre panier ne sont plus disponibles. Actualisez votre panier.");
      qty.set(id, Math.min(20, (qty.get(id) ?? 0) + it.quantity));
    }

    const lines: Doc<"orders">["items"] = [];
    const products: Doc<"products">[] = [];
    for (const [id, quantity] of qty) {
      const p = await ctx.db.get(id);
      if (!p || p.status !== "ACTIVE") fail("Certains produits de votre panier ne sont plus disponibles. Actualisez votre panier.");
      if (p.stock < quantity) fail(`Stock insuffisant pour « ${p.name} ».`);
      products.push(p);
      lines.push({ productId: p._id, name: p.name, sku: p.sku, imageKey: p.images[0]?.key, unitPrice: p.price, quantity, lineTotal: p.price * quantity });
    }
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    // Same rule as the checkout preview: fee, delay and cash on delivery come from the city's zone.
    const delivery = deliveryFor(await readDeliveryConfig(ctx), a.city, subtotal);
    if (!delivery.deliverable) fail("Nous ne livrons pas encore cette ville. Contactez-nous sur WhatsApp.");
    if (!delivery.cod) fail("Le paiement à la livraison n'est pas disponible pour cette ville. Contactez-nous sur WhatsApp.");
    const shippingFee = delivery.fee;

    let number = orderNumber();
    for (let i = 0; i < 5 && (await ctx.db.query("orders").withIndex("by_number", (q) => q.eq("number", number)).first()); i++) number = orderNumber();
    const accessToken = crypto.randomUUID();

    const orderId = await ctx.db.insert("orders", {
      number,
      status: "PENDING",
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "UNPAID",
      userId: user?.id,
      fullName: a.fullName,
      phone: a.phone,
      email: opt(a.email),
      city: a.city,
      address: a.address,
      customerNote: opt(a.note),
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      items: lines,
      accessToken,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("orderEvents", { orderId, status: "PENDING", message: "Commande passée sur le site" });

    for (const p of products) {
      const q = qty.get(p._id)!;
      const stock = p.stock - q;
      await ctx.db.patch(p._id, { stock, salesCount: p.salesCount + q });
      await logMovement(ctx, { productId: p._id, delta: -q, stockAfter: stock, reason: "SALE", orderId, note: `Commande ${number}` });
    }
    return { number, accessToken };
  },
});

/** Public tracking: needs both the order number and the phone used. */
export const track = query({
  args: { number: v.string(), phone: v.string() },
  handler: async (ctx, { number, phone }) => {
    const o = await ctx.db.query("orders").withIndex("by_number", (q) => q.eq("number", number.toUpperCase())).first();
    if (!o || o.phone !== phone) return null;
    const events = await ctx.db.query("orderEvents").withIndex("by_order", (q) => q.eq("orderId", o._id)).collect();
    return {
      number: o.number,
      status: o.status,
      total: o.total,
      city: o.city,
      createdAt: o._creationTime,
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      events: events.filter((e) => e.status).map((e) => ({ status: e.status!, createdAt: e._creationTime })),
    };
  },
});

/** Confirmation page: details (PII) only for the buyer's browser (token) or the account owner. */
export const confirmation = query({
  args: { number: v.string(), token: v.optional(v.string()) },
  handler: async (ctx, { number, token }) => {
    const o = await ctx.db.query("orders").withIndex("by_number", (q) => q.eq("number", number)).first();
    if (!o) return null;
    const user = await currentUser(ctx);
    const canSee = (token !== undefined && token === o.accessToken) || (!!user && user.id === o.userId);
    if (!canSee) return { number: o.number, canSee: false as const };
    return {
      number: o.number,
      canSee: true as const,
      shippingFee: o.shippingFee,
      total: o.total,
      fullName: o.fullName,
      phone: o.phone,
      address: o.address,
      city: o.city,
      items: o.items.map((it, i) => ({ id: String(i), name: it.name, quantity: it.quantity, lineTotal: it.lineTotal, imageKey: it.imageKey ?? null })),
    };
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await currentUser(ctx);
    if (!user) return [];
    const orders = await ctx.db.query("orders").withIndex("by_user", (q) => q.eq("userId", user.id)).order("desc").take(50);
    return orders.map((o) => ({
      id: o._id as string,
      number: o.number,
      status: o.status,
      total: o.total,
      createdAt: o._creationTime,
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })),
    }));
  },
});

export const updateStatus = mutation({
  args: { orderId: v.string(), status: orderStatus, message: v.optional(v.string()) },
  handler: async (ctx, { orderId, status, message }) => {
    const user = await requireStaff(ctx);
    const oid = ctx.db.normalizeId("orders", orderId);
    const order = oid ? await ctx.db.get(oid) : null;
    if (!order) fail("Commande introuvable.");
    if (!TRANSITIONS[order.status].includes(status)) fail(`Transition impossible : ${LABELS[order.status]} → ${LABELS[status]}.`);

    // Release reserved stock when an order is cancelled or returned
    if (RELEASED.includes(status) && !RELEASED.includes(order.status)) {
      for (const item of order.items) {
        if (!item.productId) continue;
        const p = await ctx.db.get(item.productId);
        if (!p) continue;
        const stock = p.stock + item.quantity;
        await ctx.db.patch(p._id, { stock, salesCount: Math.max(0, p.salesCount - item.quantity) });
        await logMovement(ctx, {
          productId: p._id,
          delta: item.quantity,
          stockAfter: stock,
          reason: status === "CANCELLED" ? "ORDER_CANCELLED" : "RETURN",
          orderId: order._id,
          note: `Commande ${order.number}`,
          user,
        });
      }
    }

    await ctx.db.patch(order._id, {
      status,
      updatedAt: Date.now(),
      ...(status === "DELIVERED" ? { paymentStatus: "PAID" as const } : {}),
      ...(status === "RETURNED" ? { paymentStatus: "REFUNDED" as const } : {}),
    });
    await ctx.db.insert("orderEvents", { orderId: order._id, status, message: message?.trim() || `Statut : ${LABELS[status]}`, userId: user.id, userName: user.name });
  },
});

export const addNote = mutation({
  args: { orderId: v.string(), message: v.string() },
  handler: async (ctx, { orderId, message }) => {
    const user = await requireStaff(ctx);
    const oid = ctx.db.normalizeId("orders", orderId);
    if (!oid || !(await ctx.db.get(oid))) fail("Commande introuvable.");
    const text = message.trim();
    if (!text || text.length > 1000) fail("Note invalide.");
    await ctx.db.insert("orderEvents", { orderId: oid, message: text, userId: user.id, userName: user.name });
  },
});

export const updateCustomer = mutation({
  args: { orderId: v.string(), fullName: v.string(), phone: v.string(), city: v.string(), address: v.string(), internalNote: v.optional(v.string()) },
  handler: async (ctx, a) => {
    const user = await requireStaff(ctx);
    const oid = ctx.db.normalizeId("orders", a.orderId);
    if (!oid || !(await ctx.db.get(oid))) fail("Commande introuvable.");
    await ctx.db.patch(oid, {
      fullName: a.fullName,
      phone: a.phone,
      city: a.city,
      address: a.address,
      internalNote: opt(a.internalNote),
      updatedAt: Date.now(),
    });
    await ctx.db.insert("orderEvents", { orderId: oid, message: "Informations client modifiées", userId: user.id, userName: user.name });
  },
});
