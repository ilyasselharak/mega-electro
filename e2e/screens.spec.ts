import { test } from "@playwright/test";

// Full-page screenshots of the key storefront pages, per stage: STAGE=1 npx playwright test screens
const STAGE = process.env.STAGE ?? "0-before";
const PAGES: [string, string][] = [
  ["home", "/"],
  ["category", "/categorie/refrigerateurs"],
  ["product", "/produit/chauffe-eau-gaz-siera-6-litres-blanc"],
  ["cart", "/panier"],
  ["checkout", "/commande"],
];
const LANGS = (process.env.LANGS ?? "fr").split(",");

for (const lang of LANGS) {
  for (const [name, path] of PAGES) {
    test(`screenshot ${lang} ${name}`, async ({ page }, info) => {
      if (name === "cart" || name === "checkout") {
        await page.goto((lang === "ar" ? "/ar" : "") + PAGES[2][1]);
        await page.getByRole("button", { name: /ajouter au panier|أضف إلى السلة/i }).first().click();
      }
      await page.goto((lang === "ar" ? `/ar${path === "/" ? "" : path}` : path), { waitUntil: "networkidle" });
      await page.screenshot({ path: `screenshots/${STAGE}/${lang}-${name}-${info.project.name}.png`, fullPage: true });
    });
  }
}
