import { expect, test } from "@playwright/test";
import { analyticsBeforeSend } from "../src/lib/analytics-filter";

// Pure-function test of the analytics privacy filter (no browser, no network).
const view = (url: string) => analyticsBeforeSend({ type: "pageview", url });

test("admin pages are not counted, in both languages", () => {
  expect(view("https://www.mega-electro.ma/admin")).toBeNull();
  expect(view("https://www.mega-electro.ma/admin/orders/abc")).toBeNull();
  expect(view("https://www.mega-electro.ma/ar/admin/seo")).toBeNull();
});

test("order numbers in confirmation URLs are masked", () => {
  expect(view("https://www.mega-electro.ma/commande/confirmation/DZ123456-ABCD")?.url).toBe("https://www.mega-electro.ma/commande/confirmation/[number]");
  expect(view("https://www.mega-electro.ma/ar/commande/confirmation/DZ123456-ABCD")?.url).toBe("https://www.mega-electro.ma/ar/commande/confirmation/[number]");
});

test("query strings are dropped, store paths are kept", () => {
  expect(view("https://www.mega-electro.ma/recherche?q=0612345678&tri=prix-asc")?.url).toBe("https://www.mega-electro.ma/recherche");
  expect(view("https://www.mega-electro.ma/produit/xiaomi-tv-a-50-2026")?.url).toBe("https://www.mega-electro.ma/produit/xiaomi-tv-a-50-2026");
  expect(view("https://www.mega-electro.ma/")?.url).toBe("https://www.mega-electro.ma/");
});

test("a store page that merely contains 'admin' later in the path is still counted", () => {
  expect(view("https://www.mega-electro.ma/produit/administrateur-chaise")).not.toBeNull();
});
