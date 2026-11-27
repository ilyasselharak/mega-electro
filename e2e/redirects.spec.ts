import { expect, test } from "@playwright/test";

// Slug redirects (Admin → SEO → Redirections, or an automatic rename) must work for French AND Arabic URLs.
// Uses the real rule created when "Blender Professionnel VENEZIA" became "Petit électroménager".
const OLD = "/categorie/blender-professionnel-venezia";
const NEW = "/categorie/petit-electromenager";

test("old category URL redirects permanently in French", async ({ request }) => {
  const res = await request.get(OLD, { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(new URL(res.headers()["location"], "http://x").pathname).toBe(NEW);
});

test("old category URL redirects permanently in Arabic, to the Arabic page", async ({ request }) => {
  const res = await request.get(`/ar${OLD}`, { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(new URL(res.headers()["location"], "http://x").pathname).toBe(`/ar${NEW}`);
});

test("redirects keep the query string", async ({ request }) => {
  const res = await request.get(`${OLD}?page=2`, { maxRedirects: 0 });
  expect(new URL(res.headers()["location"], "http://x").search).toBe("?page=2");
});
