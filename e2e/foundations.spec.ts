import { expect, test } from "@playwright/test";

import { findProduct } from "./catalog";

test("French pages are LTR and Arabic pages RTL", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr-MA");
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar-MA");
});

test("language switch keeps the same page", async ({ page }) => {
  await page.goto("/categorie/refrigerateurs");
  await page.getByRole("link", { name: "Afficher le site en arabe" }).first().click();
  await expect(page).toHaveURL(/\/ar\/categorie\/refrigerateurs$/);
  await page.getByRole("link", { name: "Afficher le site en français" }).first().click();
  await expect(page).toHaveURL(/\/categorie\/refrigerateurs$/);
  await expect(page).not.toHaveURL(/\/ar\//);
});

test("/fr URLs redirect to the unprefixed French URL", async ({ page }) => {
  const PRODUCT = (await findProduct(page)).path;
  const res = await page.goto(`/fr${PRODUCT}`);
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(new RegExp(`${PRODUCT}$`));
});

for (const lang of ["fr", "ar"] as const) {
  test(`add to cart opens a working cart drawer (${lang})`, async ({ page }) => {
    const PRODUCT = (await findProduct(page)).path;
    await page.goto(lang === "ar" ? `/ar${PRODUCT}` : PRODUCT);
    await page.getByRole("button", { name: lang === "ar" ? "أضف إلى السلة" : "Ajouter au panier" }).first().click();
    // Adding opens the cart drawer directly
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByRole("heading")).toContainText(lang === "ar" ? "(1)" : "(1)");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(lang === "ar" ? "إتمام الطلب" : "Passer la commande")).toBeVisible();
    const wa = drawer.getByRole("link", { name: /WhatsApp/ });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
    // Checkout link keeps the language
    await expect(drawer.getByRole("link", { name: lang === "ar" ? "إتمام الطلب" : "Passer la commande" })).toHaveAttribute("href", lang === "ar" ? "/ar/commande" : "/commande");
  });

  test(`unknown URLs return a localized 404 (${lang})`, async ({ page }) => {
    const res = await page.goto(lang === "ar" ? "/ar/page-inexistante" : "/page-inexistante");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(lang === "ar" ? "الصفحة غير موجودة" : "Page introuvable");
  });
}

test("mobile menu opens from the reading side and links stay localized", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/ar");
  await page.getByRole("button", { name: "فتح القائمة" }).click();
  const menu = page.getByRole("dialog");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  const vw = page.viewportSize()!.width;
  expect(box!.x + box!.width).toBeGreaterThan(vw - 2); // anchored to the right edge in RTL
  await expect(menu.getByRole("link", { name: "التخفيضات" })).toHaveAttribute("href", "/ar/promotions");
});
