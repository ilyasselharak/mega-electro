"use server";

import { cookies, headers } from "next/headers";
import { api } from "@convex/_generated/api";
import { deliveryFor } from "@convex/lib/delivery";
import { fetchAuthMutation, publicQuery } from "@/lib/convex";
import { checkoutSchema, trackOrderSchema, type CheckoutInput } from "@/lib/validators/orders";
import { rateLimit } from "@/lib/rate-limit";
import { LAST_ORDER_COOKIE } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { invalidate, TAGS } from "@/server/cache";
import { ok, toActionError, UserFacingError, type ActionResult } from "./result";

async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function createOrder(input: CheckoutInput): Promise<ActionResult<{ number: string }>> {
  try {
    const ip = await clientIp();
    const limit = rateLimit(`checkout:${ip}`, 6, 10 * 60 * 1000);
    if (!limit.ok) throw new UserFacingError("Trop de tentatives. Réessayez dans quelques minutes.");

    const data = checkoutSchema.parse(input);
    if (data.website) throw new UserFacingError("Requête invalide.");

    // One Convex transaction: re-prices, checks and decrements stock, creates the order.
    const order = await fetchAuthMutation(api.orders.create, {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      city: data.city,
      address: data.address,
      note: data.note || undefined,
      items: data.items,
    });

    (await cookies()).set(LAST_ORDER_COOKIE, `${order.number}.${order.accessToken}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    invalidate(TAGS.catalog); // stock & best-seller ordering changed
    logger.info("Order created", { number: order.number, ip });
    return ok({ number: order.number });
  } catch (err) {
    return toActionError(err, "createOrder");
  }
}

export async function trackOrder(input: { number: string; phone: string }) {
  try {
    const ip = await clientIp();
    if (!rateLimit(`track:${ip}`, 15, 10 * 60 * 1000).ok) {
      throw new UserFacingError("Trop de tentatives. Réessayez plus tard.");
    }
    const data = trackOrderSchema.parse(input);
    const order = await publicQuery(api.orders.track, { number: data.number, phone: data.phone });
    if (!order) throw new UserFacingError("Aucune commande trouvée avec ces informations.");
    return ok(order);
  } catch (err) {
    return toActionError(err, "trackOrder");
  }
}

export type CartQuote = {
  lines: { productId: string; name: string; slug: string; price: number; stock: number; imageKey: string | null; quantity: number; lineTotal: number }[];
  removedIds: string[];
  subtotal: number;
  /** null until a city is chosen (or when the city is not delivered). */
  shippingFee: number | null;
  total: number;
  freeShippingThreshold: number;
  delivery: { cityChosen: boolean; deliverable: boolean; cod: boolean; eta: { min: number; max: number } | null };
};

/**
 * Re-prices the client cart from the database (prices/stock may have changed) and applies the
 * same delivery rule as the order transaction (convex/lib/delivery.ts) for the chosen city.
 */
export async function quoteCart(items: { productId: string; quantity: number }[], city = ""): Promise<CartQuote> {
  const safe = items.slice(0, 50).filter((i) => typeof i.productId === "string" && Number.isInteger(i.quantity) && i.quantity > 0);
  const [{ getProductsForCart }, { getDeliveryConfig }] = await Promise.all([import("@/server/queries/catalog"), import("@/server/queries/delivery")]);
  const cfg = await getDeliveryConfig();
  const products = await getProductsForCart(safe.map((i) => i.productId));
  const lines = safe
    .map((i) => {
      const p = products.find((x) => x.id === i.productId);
      if (!p) return null;
      const quantity = Math.min(i.quantity, 20, Math.max(p.stock, 0));
      return { productId: p.id, name: p.name, slug: p.slug, price: p.price, stock: p.stock, imageKey: p.images[0]?.key ?? null, quantity, lineTotal: p.price * quantity };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const cityChosen = city.trim().length >= 2;
  const d = deliveryFor(cfg, city.slice(0, 80), subtotal);
  const shippingFee = cityChosen && d.deliverable ? d.fee : null;
  return {
    lines,
    removedIds: safe.filter((i) => !products.some((p) => p.id === i.productId)).map((i) => i.productId),
    subtotal,
    shippingFee,
    total: subtotal + (shippingFee ?? 0),
    freeShippingThreshold: d.zone?.freeThreshold ?? cfg.freeShippingThreshold,
    delivery: { cityChosen, deliverable: d.deliverable, cod: d.cod, eta: d.eta },
  };
}
