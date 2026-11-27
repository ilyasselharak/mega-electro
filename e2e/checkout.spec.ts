import { expect, test, type Page } from "@playwright/test";
import { ALLOW_ORDERS, findProduct } from "./catalog";

// The cheapest in-stock product (below the 1 000 DH free-shipping threshold) so the delivery fee shows;
// the most expensive one to cross the threshold.
async function addAndCheckout(page: Page, lang: "fr" | "ar", sort: "prix-asc" | "prix-desc" = "prix-asc") {
  const { path } = await findProduct(page, sort);
  const p = lang === "ar" ? "/ar" : "";
  await page.goto(p + path);
  await page.getByRole("button", { name: lang === "ar" ? "أضف إلى السلة" : "Ajouter au panier" }).first().click();
  await page.goto(`${p}/commande`);
}

test("empty submit shows localized validation errors (fr)", async ({ page }) => {
  await addAndCheckout(page, "fr");
  await page.getByRole("button", { name: "Confirmer la commande" }).first().click();
  const alerts = page.getByRole("alert");
  await expect(alerts.filter({ hasText: "Indiquez votre nom complet" })).toBeVisible();
  await expect(alerts.filter({ hasText: /Numéro de téléphone marocain invalide/ })).toBeVisible();
  await expect(alerts.filter({ hasText: /^Choisissez votre ville$/ })).toBeVisible();
});

test("empty submit shows localized validation errors (ar)", async ({ page }) => {
  await addAndCheckout(page, "ar");
  await page.getByRole("button", { name: "تأكيد الطلب" }).first().click();
  const alerts = page.getByRole("alert");
  await expect(alerts.filter({ hasText: "أدخل اسمك الكامل" })).toBeVisible();
  await expect(alerts.filter({ hasText: /^اختر مدينتك$/ })).toBeVisible();
});

test("choosing a city shows the real delivery fee, free above the threshold", async ({ page }) => {
  await addAndCheckout(page, "fr");
  await expect(page.getByText("Choisissez votre ville pour voir les frais et le délai.")).toBeVisible();
  await page.getByLabel("Ville *").fill("Casablanca");
  await expect(page.getByText(/Livraison : 30\sDH/)).toBeVisible();
  // Add the most expensive product: subtotal > 1 000 DH → free delivery
  await page.goto((await findProduct(page, "prix-desc")).path);
  await page.getByRole("button", { name: "Ajouter au panier" }).first().click();
  await page.goto("/commande");
  await page.getByLabel("Ville *").fill("Casablanca");
  await expect(page.getByText("Livraison gratuite", { exact: true })).toBeVisible();
});

for (const lang of ["fr", "ar"] as const) {
  test(`a complete order reaches the localized confirmation (${lang})`, async ({ page, isMobile }) => {
    test.skip(isMobile, "one real order per language (dev database)");
    test.skip(!ALLOW_ORDERS, "writes a real order: run with E2E_ALLOW_ORDERS=1 against a test deployment only");
    await addAndCheckout(page, lang);
    const L = lang === "ar"
      ? { name: "الاسم الكامل *", phone: "رقم الهاتف *", city: "المدينة *", address: "العنوان الكامل *", submit: "تأكيد الطلب", done: "شكراً، تم تسجيل طلبك!" }
      : { name: "Nom complet *", phone: "Téléphone *", city: "Ville *", address: "Adresse complète *", submit: "Confirmer la commande", done: "Merci, votre commande est enregistrée !" };
    await page.getByLabel(L.name).fill("Test Playwright");
    await page.getByLabel(L.phone).fill("0612345678");
    await page.getByLabel(L.city).fill("Rabat");
    await page.getByLabel(L.address).fill("Quartier Agdal, rue de test n° 1 (commande de test automatisé)");
    await expect(page.getByText(lang === "ar" ? /التوصيل: 30/ : /Livraison : 30/)).toBeVisible();
    await page.getByRole("button", { name: L.submit }).first().click();
    await expect(page).toHaveURL(new RegExp(`${lang === "ar" ? "/ar" : ""}/commande/confirmation/DZ\\d{6}-[A-Z0-9]{4}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(L.done);
    // Delivery fee charged by the server = the fee shown at checkout
    await expect(page.getByText(lang === "ar" ? /30\s?درهم/ : /30\sDH/).first()).toBeVisible();
  });
}

test("mobile keeps the total and confirm button in a sticky bar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await addAndCheckout(page, "fr");
  const bar = page.locator("form#checkout-form > div.fixed");
  await expect(bar).toBeVisible();
  await expect(bar.getByRole("button", { name: "Confirmer la commande" })).toBeVisible();
});
