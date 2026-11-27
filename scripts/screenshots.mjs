import { chromium, devices } from "@playwright/test";
const [base, outDir, ...paths] = process.argv.slice(2);
const browser = await chromium.launch();
const only = process.env.VP;
const vps = { mobile: { ...devices["Pixel 7"] }, desktop: { viewport: { width: 1440, height: 900 } } };
for (const [vpName, vp] of Object.entries(vps).filter(([n]) => !only || n === only)) {
  const ctx = await browser.newContext({ ...vp, locale: "fr-MA" });
  const page = await ctx.newPage();
  for (const p of paths) {
    const name = (p === "/" ? "home" : p.replace(/^\//, "").replace(/[\/?=&]/g, "_")) + `-${vpName}.png`;
    try {
      await page.goto(base + p, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(800);
      if (process.env.SEGMENTS) {
        // Viewport-sized slices (readable on phones) instead of one very tall image.
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        const vh = page.viewportSize().height;
        for (let i = 0, y = 0; y < h && i < Number(process.env.SEGMENTS); i++, y += vh) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(300);
          await page.screenshot({ path: `${outDir}/${name.replace(".png", `-${i + 1}.png`)}` });
        }
      } else {
        await page.screenshot({ path: `${outDir}/${name}`, fullPage: true });
      }
      console.log("ok", name);
    } catch (e) { console.log("fail", name, e.message.split("\n")[0]); }
  }
  await ctx.close();
}
await browser.close();
