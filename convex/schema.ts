import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Mega Electro data model. Prices are integers in centimes (MAD × 100).
// Users, sessions and accounts live in the Better Auth component (convex/betterAuth).

export const productStatus = v.union(v.literal("DRAFT"), v.literal("ACTIVE"), v.literal("ARCHIVED"));
export const orderStatus = v.union(
  v.literal("PENDING"),
  v.literal("CONFIRMED"),
  v.literal("PROCESSING"),
  v.literal("SHIPPED"),
  v.literal("DELIVERED"),
  v.literal("CANCELLED"),
  v.literal("RETURNED"),
);
export const movementReason = v.union(
  v.literal("RESTOCK"),
  v.literal("SALE"),
  v.literal("ORDER_CANCELLED"),
  v.literal("ADJUSTMENT"),
  v.literal("RETURN"),
  v.literal("DAMAGE"),
);

export const productImage = v.object({
  /** Cloudinary public_id */
  key: v.string(),
  alt: v.optional(v.string()),
  /** Arabic ALT text (storefront /ar). Empty = French ALT. */
  altAr: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  size: v.optional(v.number()),
  mimeType: v.optional(v.string()),
});

/** Advanced SEO fields shared by categories and products. Everything is optional: empty = automatic fallback. */
export const seoMeta = v.object({
  /** Visible <h1>; falls back to the name. */
  h1: v.optional(v.string()),
  /** Absolute URL or site path. Empty = self-referencing canonical. */
  canonicalUrl: v.optional(v.string()),
  /** Comma-separated French keywords (targeting notes + <meta name="keywords">). */
  keywords: v.optional(v.string()),
  /** Categories only: long SEO text shown under the product grid (page 1). */
  longDescription: v.optional(v.string()),
  titleAr: v.optional(v.string()),
  metaDescriptionAr: v.optional(v.string()),
  descriptionAr: v.optional(v.string()),
  /** Products only: Arabic short description (shown under the price on /ar). */
  shortDescriptionAr: v.optional(v.string()),
  keywordsAr: v.optional(v.string()),
  ogTitle: v.optional(v.string()),
  ogDescription: v.optional(v.string()),
  /** Cloudinary public_id of a dedicated social image. */
  ogImageKey: v.optional(v.string()),
  /** Categories only: ALT text of the category image. */
  imageAlt: v.optional(v.string()),
  noindex: v.optional(v.boolean()),
  nofollow: v.optional(v.boolean()),
});

/** Site-wide SEO settings (single document). Missing values fall back to DEFAULT_SEO (convex/lib/seo.ts). */
export const seoSettingsFields = {
  // Global
  siteName: v.optional(v.string()),
  defaultTitle: v.optional(v.string()),
  defaultDescription: v.optional(v.string()),
  defaultKeywords: v.optional(v.string()),
  canonicalBaseUrl: v.optional(v.string()),
  robotsIndex: v.optional(v.boolean()),
  robotsFollow: v.optional(v.boolean()),
  // Open Graph / social
  ogTitle: v.optional(v.string()),
  ogDescription: v.optional(v.string()),
  ogImageKey: v.optional(v.string()),
  socialImageKey: v.optional(v.string()),
  // Organization
  orgType: v.optional(v.string()),
  orgLegalName: v.optional(v.string()),
  orgDescription: v.optional(v.string()),
  orgLogoKey: v.optional(v.string()),
  orgSameAs: v.optional(v.string()),
  priceRange: v.optional(v.string()),
  // Homepage
  homeTitle: v.optional(v.string()),
  homeDescription: v.optional(v.string()),
  homeKeywords: v.optional(v.string()),
  homeH1: v.optional(v.string()),
  homeSeoHeading: v.optional(v.string()),
  homeSeoText: v.optional(v.string()),
  homeOgTitle: v.optional(v.string()),
  homeOgDescription: v.optional(v.string()),
  homeOgImageKey: v.optional(v.string()),
  // Arabic versions (/ar pages). Empty = built-in Arabic text.
  defaultTitleAr: v.optional(v.string()),
  defaultDescriptionAr: v.optional(v.string()),
  defaultKeywordsAr: v.optional(v.string()),
  ogTitleAr: v.optional(v.string()),
  ogDescriptionAr: v.optional(v.string()),
  homeTitleAr: v.optional(v.string()),
  homeDescriptionAr: v.optional(v.string()),
  homeKeywordsAr: v.optional(v.string()),
  homeH1Ar: v.optional(v.string()),
  homeSeoHeadingAr: v.optional(v.string()),
  homeSeoTextAr: v.optional(v.string()),
  homeOgTitleAr: v.optional(v.string()),
  homeOgDescriptionAr: v.optional(v.string()),
  // Technical
  robotsExtraDisallow: v.optional(v.string()),
  robotsExtraAllow: v.optional(v.string()),
  sitemapIncludeBrands: v.optional(v.boolean()),
  sitemapIncludeStaticPages: v.optional(v.boolean()),
  sitemapIncludeImages: v.optional(v.boolean()),
  googleVerification: v.optional(v.string()),
  bingVerification: v.optional(v.string()),
  // Structured data
  sdOrganization: v.optional(v.boolean()),
  sdWebsite: v.optional(v.boolean()),
  sdBreadcrumbs: v.optional(v.boolean()),
  sdProduct: v.optional(v.boolean()),
  sdItemList: v.optional(v.boolean()),
  sdShipping: v.optional(v.boolean()),
  shippingHandlingMin: v.optional(v.number()),
  shippingHandlingMax: v.optional(v.number()),
  shippingTransitMin: v.optional(v.number()),
  shippingTransitMax: v.optional(v.number()),
  sdReturnPolicy: v.optional(v.boolean()),
  returnDays: v.optional(v.number()),
  /** "" | FreeReturn | ReturnFeesCustomerResponsibility | ReturnShippingFees */
  returnFees: v.optional(v.string()),
  /** "" | ReturnByMail | ReturnInStore | ReturnAtKiosk */
  returnMethod: v.optional(v.string()),
};

/** A question/answer pair, French with optional Arabic. Shown only when written by the store. */
export const faqEntry = v.object({
  question: v.string(),
  answer: v.string(),
  questionAr: v.optional(v.string()),
  answerAr: v.optional(v.string()),
});

export const orderItem = v.object({
  productId: v.optional(v.id("products")),
  name: v.string(),
  sku: v.string(),
  imageKey: v.optional(v.string()),
  unitPrice: v.number(),
  quantity: v.number(),
  lineTotal: v.number(),
});

/** Homepage banner (Admin → Vitrine). Hero banners replace the default hero; promo banners show as tiles. */
export const storefrontBanner = v.object({
  id: v.string(),
  placement: v.union(v.literal("hero"), v.literal("promo")),
  title: v.string(),
  titleAr: v.optional(v.string()),
  subtitle: v.optional(v.string()),
  subtitleAr: v.optional(v.string()),
  ctaLabel: v.optional(v.string()),
  ctaLabelAr: v.optional(v.string()),
  /** Site path ("/promotions") or absolute URL. */
  href: v.string(),
  /** Cloudinary public_id. */
  imageKey: v.optional(v.string()),
  isActive: v.boolean(),
  /** Campaign window (ms since epoch). Empty = always. */
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
});

/** Hand-picked product collection (seasonal, campaign). Products are referenced by SKU. */
export const storefrontCollection = v.object({
  id: v.string(),
  title: v.string(),
  titleAr: v.optional(v.string()),
  description: v.optional(v.string()),
  descriptionAr: v.optional(v.string()),
  skus: v.array(v.string()),
  isActive: v.boolean(),
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
});

export const storefrontFields = {
  banners: v.array(storefrontBanner),
  collections: v.array(storefrontCollection),
  /** Homepage sections in display order. Unknown keys are ignored; missing ones use the default order. */
  sections: v.array(v.object({ key: v.string(), visible: v.boolean() })),
  /** Optional brand colour overrides (#rrggbb). */
  theme: v.optional(v.object({ accent: v.optional(v.string()), navy: v.optional(v.string()) })),
};

export default defineSchema({
  settings: defineTable({
    storeName: v.string(),
    tagline: v.string(),
    phone: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    address: v.string(),
    shippingFee: v.number(),
    freeShippingThreshold: v.number(),
    announcement: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    /** Cash on delivery offered at all (default true). */
    codEnabled: v.optional(v.boolean()),
    /** Accept orders for cities without a delivery zone, at the default fee (default true). */
    acceptUnlistedCities: v.optional(v.boolean()),
    updatedAt: v.number(),
  }),

  /** Delivery fee, delay and cash-on-delivery availability per city (Admin → Livraison). */
  deliveryZones: defineTable({
    city: v.string(),
    cityAr: v.optional(v.string()),
    fee: v.number(),
    freeThreshold: v.optional(v.number()),
    etaMinDays: v.number(),
    etaMaxDays: v.number(),
    codAvailable: v.boolean(),
    isActive: v.boolean(),
    position: v.number(),
    updatedAt: v.number(),
  }),

  categories: defineTable({
    name: v.string(),
    /** Arabic display name (storefront /ar). Empty = French name. */
    nameAr: v.optional(v.string()),
    slug: v.string(),
    description: v.optional(v.string()),
    imageKey: v.optional(v.string()),
    /** lucide icon name used on the storefront */
    icon: v.optional(v.string()),
    position: v.number(),
    isActive: v.boolean(),
    parentId: v.optional(v.id("categories")),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    seo: v.optional(seoMeta),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"]),

  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logoKey: v.optional(v.string()),
    isActive: v.boolean(),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    name: v.string(),
    /** Arabic display name (storefront /ar). Empty = French name. */
    nameAr: v.optional(v.string()),
    slug: v.string(),
    sku: v.string(),
    shortDescription: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    costPrice: v.optional(v.number()),
    stock: v.number(),
    lowStockThreshold: v.number(),
    status: productStatus,
    isFeatured: v.boolean(),
    warrantyMonths: v.optional(v.number()),
    specs: v.array(v.object({ label: v.string(), value: v.string() })),
    categoryId: v.optional(v.id("categories")),
    brandId: v.optional(v.id("brands")),
    images: v.array(productImage),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    seo: v.optional(seoMeta),
    /** Product-specific questions (Admin → product). */
    faq: v.optional(v.array(faqEntry)),
    salesCount: v.number(),
    /** Electro Darna product id this product was cloned from (stock synced from it). */
    sourceId: v.optional(v.string()),
    sourceSyncedAt: v.optional(v.number()),
    /** Lower-cased name + sku + brand + category, for search. */
    searchText: v.string(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sku", ["sku"])
    .index("by_status", ["status"])
    .index("by_category", ["categoryId"])
    .index("by_brand", ["brandId"])
    .index("by_source", ["sourceId"]),

  orders: defineTable({
    number: v.string(),
    status: orderStatus,
    paymentMethod: v.literal("CASH_ON_DELIVERY"),
    paymentStatus: v.union(v.literal("UNPAID"), v.literal("PAID"), v.literal("REFUNDED")),
    userId: v.optional(v.string()),
    fullName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    city: v.string(),
    address: v.string(),
    customerNote: v.optional(v.string()),
    internalNote: v.optional(v.string()),
    subtotal: v.number(),
    shippingFee: v.number(),
    total: v.number(),
    items: v.array(orderItem),
    /** Secret kept in the buyer's cookie so the confirmation page can show details. */
    accessToken: v.string(),
    updatedAt: v.number(),
  })
    .index("by_number", ["number"])
    .index("by_status", ["status"])
    .index("by_user", ["userId"])
    .index("by_phone", ["phone"]),

  /** Store-wide (no categoryId) or category-wide FAQ entries, shown on product pages. */
  faqs: defineTable({
    ...faqEntry.fields,
    categoryId: v.optional(v.id("categories")),
    position: v.number(),
    isActive: v.boolean(),
    updatedAt: v.number(),
  }).index("by_category", ["categoryId"]),

  seoSettings: defineTable({ ...seoSettingsFields, updatedAt: v.number() }),

  /** Field-level log of bulk SEO updates (convex/seoBulk.ts): one row per changed field, for history and rollback. */
  seoChangeLog: defineTable({
    batchId: v.string(),
    source: v.string(),
    kind: v.union(v.literal("product"), v.literal("category"), v.literal("settings")),
    entityId: v.string(),
    slug: v.string(),
    field: v.string(),
    before: v.any(),
    after: v.any(),
    appliedAt: v.number(),
    rolledBackAt: v.optional(v.number()),
  })
    .index("by_batch", ["batchId"])
    .index("by_entity", ["entityId"]),

  /** Homepage merchandising (single document): banners, collections, section order, theme colours. */
  storefront: defineTable({ ...storefrontFields, updatedAt: v.number() }),

  /** 301/302 redirects applied by src/proxy.ts. `from` is a site path ("/produit/old-slug"). */
  redirects: defineTable({
    from: v.string(),
    to: v.string(),
    statusCode: v.number(),
    note: v.optional(v.string()),
    /** Created automatically after a slug change. */
    auto: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_from", ["from"]),

  orderEvents: defineTable({
    orderId: v.id("orders"),
    status: v.optional(orderStatus),
    message: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  }).index("by_order", ["orderId"]),

  inventoryMovements: defineTable({
    productId: v.id("products"),
    delta: v.number(),
    stockAfter: v.number(),
    reason: movementReason,
    note: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  }).index("by_product", ["productId"]),
});
