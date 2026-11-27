"use client";

import { Analytics } from "@vercel/analytics/next";
import { analyticsBeforeSend } from "@/lib/analytics-filter";

/** Vercel Web Analytics (cookieless page views), with the privacy filter in src/lib/analytics-filter.ts. */
export function VercelAnalytics() {
  return <Analytics beforeSend={analyticsBeforeSend} />;
}
