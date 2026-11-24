import { test } from "@playwright/test";
// Ad-hoc screenshots for visual review: SHOT_URL, SHOT_NAME, SHOT_CLICK (optional button name).
test("shot", async ({ page }, info) => {
  await page.goto(process.env.SHOT_URL ?? "/", { waitUntil: "networkidle" });
  if (process.env.SHOT_CLICK) await page.getByRole("button", { name: new RegExp(process.env.SHOT_CLICK) }).first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/adhoc/${process.env.SHOT_NAME ?? "shot"}-${info.project.name}.png`, fullPage: !process.env.SHOT_CLICK });
});
