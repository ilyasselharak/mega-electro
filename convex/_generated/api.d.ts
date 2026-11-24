/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as catalog from "../catalog.js";
import type * as crons from "../crons.js";
import type * as delivery from "../delivery.js";
import type * as electrodarna from "../electrodarna.js";
import type * as faq from "../faq.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_cloudinary from "../lib/cloudinary.js";
import type * as lib_delivery from "../lib/delivery.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_products from "../lib/products.js";
import type * as lib_seo from "../lib/seo.js";
import type * as lib_seoRules from "../lib/seoRules.js";
import type * as lib_settings from "../lib/settings.js";
import type * as lib_slug from "../lib/slug.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as seo from "../seo.js";
import type * as settings from "../settings.js";
import type * as taxonomy from "../taxonomy.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  catalog: typeof catalog;
  crons: typeof crons;
  delivery: typeof delivery;
  electrodarna: typeof electrodarna;
  faq: typeof faq;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/cloudinary": typeof lib_cloudinary;
  "lib/delivery": typeof lib_delivery;
  "lib/errors": typeof lib_errors;
  "lib/products": typeof lib_products;
  "lib/seo": typeof lib_seo;
  "lib/seoRules": typeof lib_seoRules;
  "lib/settings": typeof lib_settings;
  "lib/slug": typeof lib_slug;
  orders: typeof orders;
  products: typeof products;
  seed: typeof seed;
  seo: typeof seo;
  settings: typeof settings;
  taxonomy: typeof taxonomy;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
