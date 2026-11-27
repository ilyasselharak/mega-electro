import { expect, test } from "@playwright/test";
import { findProduct } from "./catalog";

for (const lang of ["fr", "ar"] as const) {
  const L = lang === "ar"
    ? { buyNow: "اطلب الآن", wa: "اطلب عبر واتساب", specs: "المواصفات التقنية", checkout: /\/ar\/commande$/ }
    : { buyNow: "Commander maintenant", wa: "Commander sur WhatsApp", specs: "Caractéristiques techniques", checkout: /\/commande$/ };

  test(`product page essentials (${lang})`, async ({ page }) => {
    const { slug, name } = await findProduct(page);
    const SLUG = slug;
    await page.goto(`${lang === "ar" ? "/ar" : ""}/produit/${slug}`);
    if (lang === "fr") await expect(page.getByRole("heading", { level: 1 })).toContainText(name.slice(0, 20));
    const ldPrice = await page.locator('script[type="application/ld+json"]').allTextContents();
    const offer = ldPrice.flatMap((t) => [JSON.parse(t)].flat()).find((d) => d["@type"] === "Product").offers;
    const shown = new Intl.NumberFormat("fr-FR").format(Number(offer.price)).replace(/\s/g, "\\s");
    await expect(page.getByText(new RegExp(`${shown} ${lang === "ar" ? "درهم" : "DH"}`)).first()).toBeVisible();
    // Specs are optional catalog data: when present they get their own titled section.
    const specs = page.getByRole("heading", { name: L.specs });
    if (await specs.count()) await expect(specs).toBeVisible();
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
    const { slug } = await findProduct(page);
    await page.goto(`${lang === "ar" ? "/ar" : ""}/produit/${slug}`);
    await page.getByRole("button", { name: L.buyNow }).click();
    await expect(page).toHaveURL(L.checkout);
  });
}

test("mobile shows the sticky purchase bar instead of the floating WhatsApp bubble", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  const { path } = await findProduct(page);
  await page.goto(path);
  const bar = page.locator(".has-sticky-cta");
  await expect(bar).toBeVisible();
  await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toBeHidden();
  await bar.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("product pages hide the bottom navigation behind the sticky purchase bar", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  const { path } = await findProduct(page);
  await page.goto(path);
  await expect(page.getByRole("navigation", { name: "Menu principal" }).last()).toBeHidden();
});
