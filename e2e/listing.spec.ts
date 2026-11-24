import { expect, test } from "@playwright/test";

const prices = async (page: import("@playwright/test").Page) =>
  (await page.locator("article").evaluateAll((cards) =>
    cards.map((c) => Number((c.querySelector(".font-heading")?.textContent ?? "").replace(/[^\d]/g, ""))),
  )).filter((n) => n > 0);

test("sorting by ascending price reorders products and updates the URL", async ({ page }) => {
  await page.goto("/recherche");
  await page.getByRole("combobox", { name: "Trier par" }).click();
  await page.getByRole("option", { name: "Prix croissant" }).click();
  await expect(page).toHaveURL(/tri=prix-asc/);
  await expect(page.locator("article").first()).toBeVisible();
  const list = await prices(page);
  expect(list.length).toBeGreaterThan(3);
  expect([...list].sort((a, b) => a - b)).toEqual(list);
});

test("in-stock filter removes out-of-stock products and shows a removable chip", async ({ page, isMobile }) => {
  await page.goto("/categorie/lavage");
  if (isMobile) {
    await page.getByRole("button", { name: /^Filtres/ }).click();
    await page.getByRole("dialog").getByRole("switch").first().click();
    await expect(page).toHaveURL(/stock=1/);
    await page.getByRole("dialog").getByRole("button", { name: /Voir \d+ produit/ }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  } else {
    await page.getByRole("complementary").getByRole("switch").first().click();
    await expect(page).toHaveURL(/stock=1/);
  }
  await expect(page.getByText("Rupture de stock")).toHaveCount(0);
  const chip = page.getByRole("button", { name: /En stock uniquement — Fermer/ });
  await expect(chip).toBeVisible();
  await chip.click();
  await expect(page).not.toHaveURL(/stock=1/);
});

test("filtered listings are noindex, the plain category is indexable with hreflang", async ({ page }) => {
  await page.goto("/categorie/refrigerateurs");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^index/);
  await expect(page.locator('link[rel="alternate"][hreflang="ar-MA"]')).toHaveAttribute("href", /\/ar\/categorie\/refrigerateurs$/);
  await page.goto("/categorie/refrigerateurs?promo=1");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("Arabic listing is localized and the filter sheet opens", async ({ page, isMobile }) => {
  await page.goto("/ar/recherche");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("جميع منتجاتنا");
  await expect(page.getByText(/\d+ منتج/).first()).toBeVisible();
  await page.getByRole("combobox", { name: "ترتيب حسب" }).click();
  await expect(page.getByRole("option", { name: "الأحدث" })).toBeVisible();
  await page.keyboard.press("Escape");
  if (isMobile) {
    await page.getByRole("button", { name: /التصفية/ }).click();
    await expect(page.getByRole("dialog").getByText("المتوفر فقط")).toBeVisible();
  }
});
