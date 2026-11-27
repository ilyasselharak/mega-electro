import type { Page } from "@playwright/test";

// Test fixtures are discovered from the live catalog (in-stock products only) instead of hard-coded
// slugs, so the suite survives catalog imports and clean-ups.

/** Path of an in-stock product: cheapest ("prix-asc"), most expensive ("prix-desc") or the default order. */
export async function findProduct(page: Page, sort: "prix-asc" | "prix-desc" | "" = "prix-desc") {
  await page.goto(`/recherche?stock=1${sort ? `&tri=${sort}` : ""}`);
  const link = page.locator("article h3 a").first();
  const href = (await link.getAttribute("href")) ?? "";
  const name = ((await link.textContent()) ?? "").trim();
  return { path: href, slug: href.replace(/^.*\/produit\//, ""), name };
}

/** Writing a real order is opt-in: the suite runs against a shared Convex deployment. */
export const ALLOW_ORDERS = process.env.E2E_ALLOW_ORDERS === "1";
