import type { Metadata } from "next";
import { imageUrl } from "@/lib/images";
import { DEFAULT_SEO, type SeoMetaValues, type SeoSettingsValues } from "@convex/lib/seoRules";
import { LANG_TAG, localizePath, OG_LOCALE, type Locale } from "@/i18n/config";

export type SeoSettings = SeoSettingsValues;
export type SeoMeta = SeoMetaValues;

export const DEFAULT_DESCRIPTION = DEFAULT_SEO.defaultDescription;
export const FALLBACK_OG_PATH = "/og";

/** Public origin used in canonicals, sitemaps and JSON-LD (Admin → SEO override, else NEXT_PUBLIC_SITE_URL). */
const LIVE_URL = "https://www.mega-electro.ma";

export function siteBase(seo?: Pick<SeoSettings, "canonicalBaseUrl"> | null) {
  const raw = (seo?.canonicalBaseUrl?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");
  // A production build must never announce localhost to search engines.
  return process.env.NODE_ENV === "production" && /^https?:\/\/(localhost|127\.0\.0\.1)/.test(raw) ? LIVE_URL : raw;
}

/** Absolute URL for a site path (absolute URLs are returned unchanged). */
export function urlFor(path: string, seo?: Pick<SeoSettings, "canonicalBaseUrl"> | null) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteBase(seo)}${path.startsWith("/") ? path : `/${path}`}`;
}

export function keywordList(...sources: (string | null | undefined)[]) {
  const out: string[] = [];
  for (const src of sources) for (const k of (src ?? "").split(/[,،\n]/)) if (k.trim() && !out.includes(k.trim())) out.push(k.trim());
  return out;
}

type BuildArgs = {
  title: string;
  description?: string | null;
  path: string;
  /** Absolute image URL. */
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  type?: "website" | "article";
  keywords?: string[];
  /** Canonical override: site path or absolute URL. */
  canonical?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  /** Title rendered as-is, without the " | Site" template. */
  absoluteTitle?: boolean;
  seo?: SeoSettings | null;
  /** Page language: canonical is the URL in that language, with hreflang alternates for both. */
  locale?: Locale;
};

/** Consistent metadata with canonical URL, robots and Open Graph for every page. */
export function buildMetadata({ title, description, path, image, imageAlt, noIndex, noFollow, type = "website", keywords, canonical, ogTitle, ogDescription, absoluteTitle, seo, locale = "fr" }: BuildArgs): Metadata {
  const s = seo ?? DEFAULT_SEO;
  const desc = description?.trim() || s.defaultDescription || DEFAULT_DESCRIPTION;
  const custom = canonical?.trim();
  const url = urlFor(custom ? (custom.startsWith("/") ? localizePath(locale, custom) : custom) : localizePath(locale, path), seo);
  // hreflang pairs only for self-canonical, indexable pages.
  const languages =
    !custom && !noIndex
      ? { [LANG_TAG.fr]: urlFor(path, seo), [LANG_TAG.ar]: urlFor(localizePath("ar", path), seo), "x-default": urlFor(path, seo) }
      : undefined;
  const ogImage = image ?? (s.ogImageKey ? imageUrl(s.ogImageKey, 1200) : urlFor(FALLBACK_OG_PATH, seo));
  const socialImage = image ?? (s.socialImageKey ? imageUrl(s.socialImageKey, 1200) : ogImage);
  const index = !noIndex && s.robotsIndex;
  const follow = !noFollow && s.robotsFollow;
  const shareTitle = ogTitle?.trim() || title;
  const shareDesc = ogDescription?.trim() || desc;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      title: shareTitle,
      description: shareDesc,
      url,
      siteName: s.siteName,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === "fr" ? "ar" : "fr"]],
      type,
      // The generated fallback is 1200×630; uploaded images are served 1200 px wide.
      images: [{ url: ogImage, alt: imageAlt || shareTitle, ...(image || s.ogImageKey ? { width: 1200 } : { width: 1200, height: 630 }) }],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: shareDesc, images: [socialImage] },
    robots: {
      index,
      follow,
      googleBot: { index, follow, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
  };
}

/** "?page=N" suffix for paginated listings (each page is self-canonical and indexable). */
export function pagedPath(path: string, page: number | undefined) {
  return page && page > 1 ? `${path}?page=${page}` : path;
}

export function pagedTitle(title: string, page: number | undefined, label = "Page {n}") {
  return page && page > 1 ? `${title} – ${label.replace("{n}", String(page))}` : title;
}

// ── JSON-LD ──────────────────────────────────────────────────────────────────

type JsonLd = Record<string, unknown>;

/** Moroccan numbers in international format (0643115212 → +212643115212); anything else is returned as typed. */
export function internationalPhone(phone: string) {
  const d = phone.replace(/[^\d+]/g, "");
  if (/^0[5-7]\d{8}$/.test(d)) return `+212${d.slice(1)}`;
  if (/^(00)?212\d{9}$/.test(d)) return `+${d.replace(/^00/, "")}`;
  return phone.trim();
}

/** "Casablanca, Maroc" → locality only; "12 rue X, Casablanca, Maroc" → street + locality. */
function postalAddress(address: string): JsonLd {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1 && /^(maroc|morocco|المغرب)$/i.test(parts[parts.length - 1])) parts.pop();
  const locality = parts.length ? parts[parts.length - 1] : "";
  const street = parts.slice(0, -1).join(", ");
  return { "@type": "PostalAddress", ...(street ? { streetAddress: street } : {}), ...(locality ? { addressLocality: locality } : {}), addressCountry: "MA" };
}

/** Return policy from Admin → SEO → Données structurées (shared by Organization and every Offer). */
function returnPolicyJsonLd(seo: SeoSettings): JsonLd | undefined {
  if (!seo.sdReturnPolicy || seo.returnDays <= 0) return undefined;
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "MA",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: seo.returnDays,
    ...(seo.returnMethod ? { returnMethod: `https://schema.org/${seo.returnMethod}` } : {}),
    ...(seo.returnFees ? { returnFees: `https://schema.org/${seo.returnFees}` } : {}),
  };
}

/** Raster logo (Google prefers PNG/JPG over SVG): Admin → SEO logo, else the generated /logo.png. */
export const FALLBACK_LOGO_PATH = "/logo.png";

export function organizationJsonLd(
  st: { storeName: string; phone: string; email: string; address: string; facebookUrl?: string | null; instagramUrl?: string | null; tiktokUrl?: string | null },
  seo: SeoSettings,
): JsonLd {
  const sameAs = [st.facebookUrl, st.instagramUrl, st.tiktokUrl, ...seo.orgSameAs.split(/\s+/)].filter((u): u is string => Boolean(u && /^https?:\/\//.test(u)));
  // Store is a LocalBusiness (physical shop); OnlineStore and Organization take no opening/price properties.
  const isShop = seo.orgType === "Store";
  const telephone = st.phone ? internationalPhone(st.phone) : "";
  const returnPolicy = returnPolicyJsonLd(seo);
  return {
    "@context": "https://schema.org",
    "@type": seo.orgType || "OnlineStore",
    "@id": urlFor("/#organization", seo),
    name: seo.siteName || st.storeName,
    alternateName: "ميغا إلكترو",
    ...(seo.orgLegalName ? { legalName: seo.orgLegalName } : {}),
    ...(seo.orgDescription ? { description: seo.orgDescription } : {}),
    url: urlFor("/", seo),
    logo: { "@type": "ImageObject", url: seo.orgLogoKey ? imageUrl(seo.orgLogoKey, 512) : urlFor(FALLBACK_LOGO_PATH, seo), width: 512, height: 512 },
    image: seo.ogImageKey ? imageUrl(seo.ogImageKey, 1200) : urlFor(FALLBACK_OG_PATH, seo),
    ...(telephone ? { telephone } : {}),
    ...(st.email ? { email: st.email } : {}),
    ...(st.address ? { address: postalAddress(st.address) } : {}),
    ...(telephone || st.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            ...(telephone ? { telephone } : {}),
            ...(st.email ? { email: st.email } : {}),
            areaServed: "MA",
            availableLanguage: ["French", "Arabic"],
          },
        }
      : {}),
    areaServed: { "@type": "Country", name: "Morocco" },
    ...(isShop ? { ...(seo.priceRange ? { priceRange: seo.priceRange } : {}), currenciesAccepted: "MAD", paymentAccepted: "Cash" } : {}),
    ...(returnPolicy ? { hasMerchantReturnPolicy: returnPolicy } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(seo: SeoSettings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": urlFor("/#website", seo),
    name: seo.siteName,
    alternateName: "ميغا إلكترو",
    url: urlFor("/", seo),
    inLanguage: ["fr-MA", "ar-MA"],
    publisher: { "@id": urlFor("/#organization", seo) },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${urlFor("/recherche", seo)}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], seo?: SeoSettings | null): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: urlFor(it.path, seo) })),
  };
}

/**
 * Product + Offer. Only real data: shipping cost comes from the store settings, delivery/return
 * terms from Admin → SEO → Données structurées (each block can be turned off). No ratings/reviews
 * are emitted because the store has no review system.
 */
export function productJsonLd(
  p: {
    name: string;
    url: string;
    sku: string;
    description?: string | null;
    price: number;
    stock: number;
    images: string[];
    brand?: string | null;
    category?: string | null;
    warrantyMonths?: number | null;
    shippingFee: number;
    freeShippingThreshold: number;
  },
  seo: SeoSettings,
): JsonLd {
  const shippingDetails = seo.sdShipping
    ? {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: (p.price >= p.freeShippingThreshold ? 0 : p.shippingFee / 100).toFixed(2), currency: "MAD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "MA" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: seo.shippingHandlingMin, maxValue: seo.shippingHandlingMax, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: seo.shippingTransitMin, maxValue: seo.shippingTransitMax, unitCode: "DAY" },
        },
      }
    : undefined;
  const returnPolicy = returnPolicyJsonLd(seo);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${p.url}#product`,
    name: p.name,
    url: p.url,
    sku: p.sku,
    ...(p.description ? { description: p.description } : {}),
    ...(p.images.length ? { image: p.images } : {}),
    ...(p.category ? { category: p.category } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    offers: {
      "@type": "Offer",
      url: p.url,
      priceCurrency: "MAD",
      price: (p.price / 100).toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": urlFor("/#organization", seo) },
      ...(shippingDetails ? { shippingDetails } : {}),
      ...(returnPolicy ? { hasMerchantReturnPolicy: returnPolicy } : {}),
      ...(p.warrantyMonths
        ? { warranty: { "@type": "WarrantyPromise", durationOfWarranty: { "@type": "QuantitativeValue", value: p.warrantyMonths, unitCode: "MON" } } }
        : {}),
    },
  };
}

/** Items carry their public path (already localized), e.g. "/ar/produit/x". */
export function itemListJsonLd(items: { path: string; name: string }[], seo?: SeoSettings | null): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: urlFor(p.path, seo), name: p.name })),
  };
}
