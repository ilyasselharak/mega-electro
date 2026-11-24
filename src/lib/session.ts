import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/lib/convex";

export type AppRole = "CUSTOMER" | "STAFF" | "ADMIN";
export type SessionUser = { id: string; name: string; email: string; role: AppRole; phone: string | null };

/** Memoised per request so layouts and pages share one lookup. Reads the role from Convex every time. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  try {
    return await fetchAuthQuery(api.users.me, {});
  } catch {
    return null;
  }
});

function roleOf(user: { role?: string | null } | null | undefined): AppRole {
  return (user?.role as AppRole) ?? "CUSTOMER";
}

export function isStaff(user: { role?: string | null } | null | undefined) {
  const r = roleOf(user);
  return r === "STAFF" || r === "ADMIN";
}

export function isAdmin(user: { role?: string | null } | null | undefined) {
  return roleOf(user) === "ADMIN";
}

/** For pages/layouts: redirects when the visitor is not signed in. */
export async function requireUser(next = "/compte") {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  return user;
}

/** For admin pages/layouts. */
export async function requireStaffPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/admin");
  if (!isStaff(user)) redirect("/");
  return user;
}

export class AuthorizationError extends Error {
  constructor(message = "Accès refusé") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/** For server actions & route handlers: throws instead of redirecting. (Convex re-checks the role.) */
export async function assertStaff() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) throw new AuthorizationError();
  return user;
}

export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) throw new AuthorizationError();
  return user;
}
