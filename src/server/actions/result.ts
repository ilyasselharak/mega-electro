import "server-only";
import { z } from "zod";
import { ConvexError } from "convex/values";
import { AuthorizationError } from "@/lib/session";
import { logger } from "@/lib/logger";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export class UserFacingError extends Error {}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** Converts any thrown error into a safe, user-facing ActionResult. */
export function toActionError(err: unknown, context: string): ActionResult<never> {
  if (err instanceof z.ZodError) {
    return { ok: false, error: "Veuillez corriger les champs indiqués.", fieldErrors: z.flattenError(err).fieldErrors };
  }
  if (err instanceof AuthorizationError) return { ok: false, error: err.message };
  if (err instanceof UserFacingError) return { ok: false, error: err.message };
  // Messages thrown with ConvexError (convex/lib/errors.ts) are meant for the user.
  if (err instanceof ConvexError) return { ok: false, error: typeof err.data === "string" ? err.data : "Requête refusée." };
  logger.error(`Action failed: ${context}`, { err });
  return { ok: false, error: "Une erreur inattendue est survenue. Réessayez." };
}
