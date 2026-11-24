import { expect, test } from "@playwright/test";

test("information pages exist in both languages with matching hreflang", async ({ page }) => {
  await page.goto("/livraison-retours");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Livraison & retours");
  await page.goto("/ar/livraison-retours");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("التوصيل والإرجاع");
  await expect(page.locator('link[rel="alternate"][hreflang="fr-MA"]')).toHaveAttribute("href", /\/livraison-retours$/);
});

test("order tracking reports unknown orders in the page language", async ({ page }) => {
  await page.goto("/ar/suivi-commande");
  await page.getByLabel("رقم الطلب").fill("DZ000000-ZZZZ");
  await page.getByLabel("رقم الهاتف").fill("0612345678");
  await page.getByRole("button", { name: "بحث" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});

test("sign-in form is localized and validates", async ({ page }) => {
  await page.goto("/ar/connexion");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("تسجيل الدخول");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText("بريد إلكتروني غير صالح")).toBeVisible();
});
