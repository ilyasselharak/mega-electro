import { expect, test } from "@playwright/test";

// Lab Core Web Vitals per page (production build). Thresholds = Google's "good" limits.
const PAGES = ["/", "/ar", "/categorie/refrigerateurs", "/produit/refrigerateur-combine-no-frost-340-l-inox-samsung"];

for (const path of PAGES) {
  test(`vitals ${path}`, async ({ page }, info) => {
    const client = await page.context().newCDPSession(page);
    if (info.project.name === "mobile") {
      // Slow 4G-like network + 4x CPU slowdown, like Lighthouse's mobile profile.
      await client.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    }
    await page.addInitScript(() => {
      const w = window as unknown as { __lcp: number; __cls: number };
      w.__lcp = 0;
      w.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) w.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const w = window as unknown as { __lcp: number; __cls: number };
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const js = res.filter((r) => r.initiatorType === "script").reduce((s, r) => s + r.transferSize, 0);
      return { lcp: Math.round(w.__lcp), cls: Number(w.__cls.toFixed(3)), jsKB: Math.round(js / 1024), requests: res.length };
    });
    console.log(`${info.project.name} ${path}`, JSON.stringify(m));
    expect(m.cls).toBeLessThan(0.1);
    expect(m.lcp).toBeLessThan(info.project.name === "mobile" ? 2500 : 1500);
  });
}
