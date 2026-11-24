# Mega Electro — Ecommerce platform

Moroccan home-appliance store: customer storefront (French, MAD, cash on delivery) + full administration dashboard.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS 4 · shadcn/ui · Convex (database, server functions, crons) · Better Auth (inside Convex) · Cloudinary · React Hook Form + Zod · TanStack Query · Zustand.

---

## Quick start (local)

```bash
cp .env.example .env.local    # fill the Cloudinary values
npm install
npx convex dev                # links/creates the Convex deployment, writes CONVEX_* to .env.local, keeps functions in sync
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL http://localhost:3000
npx convex env set CLOUDINARY_CLOUD_NAME …   # + CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
npm run seed -- '{"adminEmail":"admin@mega-electro.ma","adminPassword":"…","demo":true}'
npm run dev                   # http://localhost:3000 (keep `npx convex dev` running in another terminal)
```

Sign in at `/connexion` with the seeded admin, then open `/admin`. **Use a strong admin password.** Seed with `"demo":false` in production to skip demo products. Demo images are uploaded to Cloudinary only when it is configured.

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build, serve the Next.js app |
| `npm run dev:convex` | `convex dev`: push functions and schema on every save |
| `npm run typecheck` / `lint` | Route types + `tsc` (app and `convex/`), ESLint |
| `npm run seed` | Idempotent seed (`convex run seed:run`) |

---

## Features

### Storefront
- Home (hero, categories, featured, deals, best sellers, new arrivals, brands), category and brand pages with subcategories, search with live suggestions, promotions.
- URL-driven filters (brands, price range, in stock, on sale), sorting, and crawlable pagination.
- Product page: swipeable gallery, stock urgency, specs table, "Buy now", WhatsApp order, sticky mobile CTA, related products.
- Persistent cart drawer with a free-shipping progress bar; the server re-prices the cart (stock and price changes are synced back to the client).
- Distraction-free checkout with **cash on delivery**, Moroccan phone validation, a city list and a honeypot field.
- Order confirmation (details visible only to the buyer), order tracking by number + phone, customer account with order history.

### Administration (`/admin`, roles `STAFF` and `ADMIN`)
- **Dashboard:** 30-day revenue, order count and average basket, orders awaiting confirmation, stock alerts, 14-day revenue chart, top products.
- **Orders:** status tabs and search; detail page with an enforced status workflow (`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`, plus cancel/return that **restocks automatically**), timeline, internal notes, call/WhatsApp buttons, editable customer info.
- **Products:** list with filters; create/edit form with images (drag & drop, reorder, replace, delete, alt text), specs editor, pricing with margin, SEO fields with a Google preview, duplicate, delete (archived instead if the product was ever sold).
- **Categories** (2 levels, icons, image, SEO) and **Brands** (logo, SEO).
- **Inventory:** stock adjustments with reasons and a full movement log (sales, cancellations, restocks, corrections).
- **Customers:** accounts, role management (admin only), top guest customers by phone.
- **Settings** (admin only): store info, announcement bar, shipping fee, free-shipping threshold, phone/WhatsApp, social links.

---

## Architecture

```
convex/
  schema.ts                 Data model (prices in centimes — integers, never floats)
  betterAuth/               Better Auth component (users, sessions) + role helpers over the user table
  catalog.ts                Public storefront queries
  admin.ts                  Back-office queries (STAFF/ADMIN checked in every function)
  products.ts, taxonomy.ts, orders.ts, settings.ts, users.ts   Mutations
  electrodarna.ts, crons.ts Electro Darna catalog link: clone products, stock sync every 15 min
  lib/cloudinary.ts         Signed Cloudinary uploads/deletes (Web Crypto; also used by Next)
  seed.ts                   Seed (`npm run seed`)
src/proxy.ts                Optimistic auth redirect for /admin and /compte (Next 16 "proxy")
src/lib/
  convex.ts, session.ts     Convex calls as the signed-in user, role helpers (requireStaffPage / assertStaff / assertAdmin)
  images.ts                 Cloudinary image URLs (f_auto, resized on the fly)
  seo.ts                    Metadata builder, JSON-LD (Store, WebSite, Product, Breadcrumb, ItemList)
  validators/               Zod schemas shared by forms and server actions
src/server/
  queries/                  Read models calling Convex (storefront queries cached with tags)
  actions/                  Server Actions calling Convex mutations
src/app/(store)             Storefront          src/app/(checkout)  Checkout & confirmation
src/app/(auth)              Sign-in / sign-up   src/app/admin       Back office
src/app/api                 Auth, uploads, search suggestions
```

**Security**
- Roles are enforced inside every Convex admin function (Convex functions are public endpoints, so this is the real check), and again in admin pages and server actions. The proxy only does an optimistic redirect.
- The `role` field cannot be set at sign-up (`input: false`). A role change revokes the user's sessions.
- The role is read from Convex on every request, so demoted users lose access immediately.
- Checkout: all prices are recomputed on the server, and the whole order (stock check, decrement, order creation) is one Convex transaction, which prevents overselling. There is also IP rate limiting and a honeypot.
- Uploads are signed server-side for a fixed Cloudinary folder; saved image keys must belong to that folder. The confirmation page only shows order details to the buyer's browser (secret token in an httpOnly cookie) or the account owner.
- Security headers (HSTS, nosniff, frame options, referrer and permissions policy); `/admin` is `noindex`.
- The in-memory rate limiter fits a single instance. With several instances, use Cloudflare rate-limiting rules or Redis.

**Caching:** storefront queries use `unstable_cache` tagged `catalog` / `settings`; admin mutations expire the tags immediately. Product pages use ISR. Cache Components (`cacheComponents`) is intentionally **not** enabled because this caching model doesn't combine with it.

**Logging:** `src/lib/logger.ts` writes structured JSON in production, which your host's log drain can collect. Unexpected action errors are logged with context, and users only ever see safe messages.

---

## Cloudinary setup (images)

1. Create a Cloudinary account; in *Settings → API Keys* copy the cloud name, API key and API secret.
2. Next.js env: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Convex env (used to clone Electro Darna images and seed demo images): `npx convex env set CLOUDINARY_CLOUD_NAME …` (and the key and secret).

Upload flow: the browser asks `/api/admin/uploads` for a signature (staff only), then posts the file straight to Cloudinary into `mega-electro/<products|categories|brands>`. The stored key is the Cloudinary `public_id`; URLs use `f_auto,q_auto` resizing, which serves AVIF or WebP. Images removed from a product, category or brand are deleted from Cloudinary when it is saved.

## Electro Darna link

`/admin/electrodarna` lists Electro Darna's products and clones them (images copied to Cloudinary). The stock of cloned products is synced every 15 minutes by a Convex cron, or on demand with *Synchroniser le stock*. Convex env: `ELECTRODARNA_API_URL` (Electro Darna's `.convex.site` URL) and `ELECTRODARNA_API_KEY` (= `CATALOG_SHARE_KEY` in Electro Darna's Convex env).

---

## Deployment

Vercel (or any Node.js 20.9+ host that supports Next.js 16).

1. In the Convex dashboard, create a **production deploy key** and add it to Vercel as `CONVEX_DEPLOY_KEY`.
2. Set the Vercel build command to `npx convex deploy --cmd 'npm run build'`: it deploys the Convex functions and sets `NEXT_PUBLIC_CONVEX_URL` for the build. Also set `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL` and the Cloudinary variables in Vercel.
3. On the production Convex deployment set `BETTER_AUTH_SECRET` (new value), `SITE_URL` (public URL), the Cloudinary and Electro Darna variables (`npx convex env set NAME value --prod`).
4. Seed once: `npx convex run seed:run '{"adminEmail":"…","adminPassword":"…","demo":false}' --prod`.
5. **Cloudflare DNS/CDN (optional):** proxy `mega-electro.ma` through Cloudflare (orange cloud), use SSL mode *Full (strict)*, and leave HTML uncached at the edge unless you add cache rules. Static assets under `/_next/static` are immutable.
6. Submit `https://mega-electro.ma/sitemap.xml` in Google Search Console.

---

## SEO checklist

- Unique title and description per page, canonical URLs, Open Graph/Twitter cards, and a generated OG image.
- JSON-LD: `Store`, `WebSite` + `SearchAction`, `Product` (offer in MAD, availability, shipping, return policy, warranty), `BreadcrumbList`, `ItemList`.
- Dynamic `sitemap.xml` (with product images), `robots.txt`, and a web manifest.
- Filtered, sorted and search pages are `noindex` with a canonical pointing to the clean URL; cart, checkout, account and admin are excluded.
- Clean French URLs: `/categorie/…`, `/produit/…`, `/marque/…`, `/promotions`.
- Fast by default: server components, ISR, AVIF/WebP via Cloudinary, `next/font` with swap, and `priority` set on LCP images.

**Before launch:** fill the `[À COMPLÉTER]` placeholders in `src/lib/content/pages.ts` (legal entity, RC/ICE, CNDP declaration, return terms), and set the real phone, WhatsApp, email and address in **Admin → Paramètres**.
