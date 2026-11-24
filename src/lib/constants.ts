import type { OrderStatus } from "@/lib/types";

export const SITE_NAME = "Mega Electro";

/** Main Moroccan cities offered at checkout (free text is also accepted). */
export const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
  "Salé", "Témara", "Mohammédia", "El Jadida", "Safi", "Béni Mellal", "Nador", "Khouribga", "Settat",
  "Berrechid", "Khémisset", "Taza", "Larache", "Ksar El Kébir", "Guelmim", "Errachidia", "Ouarzazate",
  "Laâyoune", "Dakhla", "Essaouira", "Al Hoceïma", "Berkane", "Taourirt", "Inezgane", "Tiznit", "Ifrane",
  "Azrou", "Sidi Kacem", "Sidi Slimane", "Youssoufia", "Taroudant", "Chefchaouen", "Fquih Ben Salah",
].sort((a, b) => a.localeCompare(b, "fr"));

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURNED: "Retournée",
};

export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
  CONFIRMED: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-300",
  PROCESSING: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-300",
  SHIPPED: "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-300",
  DELIVERED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300",
  RETURNED: "bg-zinc-200 text-zinc-900 dark:bg-zinc-500/20 dark:text-zinc-300",
};

/** Allowed order status transitions in the back office. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

/** Statuses for which reserved stock has been released back to inventory. */
export const STOCK_RELEASED_STATUSES: OrderStatus[] = ["CANCELLED", "RETURNED"];

export const PRODUCTS_PER_PAGE = 24;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** Cookie letting the confirmation page show full details only to the buyer: "<number>.<token>". */
export const LAST_ORDER_COOKIE = "me_last_order";
