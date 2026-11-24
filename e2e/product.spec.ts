import { expect, test } from "@playwright/test";

const SLUG = "refrigerateur-combine-no-frost-340-l-inox-samsung";

for (const lang of ["fr", "ar"] as const) {
  const path = `${lang === "ar" ? "/ar" : ""}/produit/${SLUG}`;
  const L = lang === "ar"
    ? { buyNow: "اطلب الآن", wa: "اطلب عبر واتساب", specs: "المواصفات التقنية", checkout: /\/ar\/commande$/ }
    : { buyNow: "Commander maintenant", wa: "Commander sur WhatsApp", specs: "Caractéristiques techniques", checkout: /\/commande$/ };

  test(`product page essentials (${lang})`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Réfrigérateur combiné");
    await expect(page.getByText(lang === "ar" ? /6\s990 درهم/ : /6\s990 DH/).first()).toBeVisible();
    await expect(page.getByRole("button", { name: L.specs })).toBeVisible();
    const wa = page.getByRole("link", { name: L.wa }).first();
    const href = decodeURIComponent((await wa.getAttribute("href")) ?? "");
    expect(href).toContain("https://wa.me/");
    expect(href).toContain(`/produit/${SLUG}`);
    if (lang === "ar") expect(href).toContain(`/ar/produit/${SLUG}`);
    // Structured data: one Product, with the URL of this language
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const products = ld.flatMap((s) => [JSON.parse(s)].flat()).filter((d) => d["@type"] === "Product");
    expect(products).toHaveLength(1);
    expect(products[0].offers.url).toMatch(lang === "ar" ? /\/ar\/produit\// : /[^r]\/produit\//);
    expect(products[0].offers.priceCurrency).toBe("MAD");
    expect(products[0].aggregateRating).toBeUndefined();
  });

  test(`buy now goes to the localized checkout (${lang})`, async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop buy box");
    await page.goto(path);
    await page.getByRole("button", { name: L.buyNow }).click();
    await expect(page).toHaveURL(L.checkout);
  });
}

test("mobile shows the sticky purchase bar instead of the floating WhatsApp bubble", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto(`/produit/${SLUG}`);
  const bar = page.locator(".has-sticky-cta");
  await expect(bar).toBeVisible();
  await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toBeHidden();
  await bar.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("products without photos say so instead of showing a broken image", async ({ page }) => {
  await page.goto(`/produit/${SLUG}`);
  await expect(page.getByText("Photo bientôt disponible")).toBeVisible();
});
