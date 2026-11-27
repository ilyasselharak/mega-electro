import { chromium, devices } from "@playwright/test";
// Usage: node scripts/lcp.mjs <url> — LCP element under Lighthouse-like mobile throttling.
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 7"] });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.addInitScript(() => {
  window.__lcps = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcps.push({ t: Math.round(e.startTime), el: e.element?.outerHTML.slice(0, 160), url: e.url?.slice(0, 120), size: e.size }); }).observe({ type: "largest-contentful-paint", buffered: true });
});
await page.goto(process.argv[2], { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(() => window.__lcps), null, 1));
const imgs = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.initiatorType === "img" || /image|cloudinary/.test(r.name)).slice(0, 6).map((r) => ({ n: r.name.slice(0, 140), start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round(r.transferSize / 1024) })));
console.log(imgs);
await browser.close();
