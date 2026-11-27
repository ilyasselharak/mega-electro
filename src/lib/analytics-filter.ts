import type { BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Privacy filter for Vercel Web Analytics (used by src/components/vercel-analytics.tsx).
 * - Back-office pages are not counted, so staff browsing doesn't skew the store's numbers.
 * - Order numbers in confirmation URLs are replaced by a placeholder.
 * - Query strings are dropped: search terms and filters can contain whatever a visitor typed.
 */
export function analyticsBeforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  const path = url.pathname.replace(/^\/(ar|fr)(?=\/|$)/, "") || "/";
  if (path.startsWith("/admin")) return null;
  url.pathname = url.pathname.replace(/(\/commande\/confirmation\/)[^/]+/, "$1[number]");
  url.search = "";
  return { ...event, url: url.toString() };
}
