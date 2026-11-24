import { ConvexError } from "convex/values";

/** Error whose message is safe to show to the user (survives production redaction). */
export function fail(message: string): never {
  throw new ConvexError(message);
}
