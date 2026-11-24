import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { fail } from "./errors";
import type { DataModel } from "../_generated/dataModel";
import { authComponent } from "../betterAuth/auth";

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";
export type AppUser = { id: string; name: string; email: string; role: Role; phone: string | null };

export async function currentUser(ctx: GenericCtx<DataModel>): Promise<AppUser | null> {
  const u = await authComponent.safeGetAuthUser(ctx);
  if (!u) return null;
  return { id: u._id, name: u.name, email: u.email, role: (u.role as Role) ?? "CUSTOMER", phone: u.phone ?? null };
}

export async function requireStaff(ctx: GenericCtx<DataModel>) {
  const u = await currentUser(ctx);
  if (!u || (u.role !== "STAFF" && u.role !== "ADMIN")) fail("Accès refusé");
  return u;
}

export async function requireAdmin(ctx: GenericCtx<DataModel>) {
  const u = await currentUser(ctx);
  if (!u || u.role !== "ADMIN") fail("Accès refusé");
  return u;
}
