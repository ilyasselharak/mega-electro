import "server-only";
import { api } from "@convex/_generated/api";
import { fetchAuthAction, fetchAuthQuery } from "@/lib/convex";
import type { OrderStatus, ProductStatus } from "@/lib/types";

// Back-office reads, run as the signed-in user (Convex checks the STAFF/ADMIN role).

export const getDashboardStats = () => fetchAuthQuery(api.admin.dashboard, { now: Date.now() });

export const countPendingOrders = () => fetchAuthQuery(api.admin.pendingCount, {});

export const listAdminOrders = ({ status, q, page }: { status?: OrderStatus; q?: string; page?: number }) =>
  fetchAuthQuery(api.admin.listOrders, { status, q, page });

export const getAdminOrder = (id: string) => fetchAuthQuery(api.admin.getOrder, { id });

export const listAdminProducts = ({ q, status, categoryId, stock, page }: { q?: string; status?: ProductStatus; categoryId?: string; stock?: "low" | "out"; page?: number }) =>
  fetchAuthQuery(api.admin.listProducts, { q, status, categoryId, stock, page });

export const getAdminProduct = (id: string) => fetchAuthQuery(api.admin.getProduct, { id });

export const getTaxonomyOptions = () => fetchAuthQuery(api.admin.taxonomyOptions, {});

export const listAdminCategories = () => fetchAuthQuery(api.admin.categories, {});

export const listAdminBrands = () => fetchAuthQuery(api.admin.brands, {});

export const listInventory = ({ q, filter, page }: { q?: string; filter?: "low" | "out"; page?: number }) => fetchAuthQuery(api.admin.inventory, { q, filter, page });

export const listCustomers = ({ q, page }: { q?: string; page?: number }) => fetchAuthQuery(api.admin.customers, { q, page });

export const getAdminSettings = () => fetchAuthQuery(api.admin.settings, {});

export const getLinkedProducts = () => fetchAuthQuery(api.admin.linkedProducts, {});

export const getRemoteCatalog = () => fetchAuthAction(api.electrodarna.catalog, {});

export const getMyOrders = () => fetchAuthQuery(api.orders.mine, {});

export const listDeliveryZones = () => fetchAuthQuery(api.delivery.listZones, {});

export const listFaqs = () => fetchAuthQuery(api.faq.list, {});
