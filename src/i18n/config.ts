// Locale routing: French is the default and keeps unprefixed URLs (/produit/x);
// Arabic lives under /ar (/ar/produit/x). src/proxy.ts rewrites French URLs to /fr/... internally.

export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const isLocale = (v: string | undefined | null): v is Locale => v === "fr" || v === "ar";
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
/** BCP 47 tags for <html lang>, hreflang and Intl. */
export const LANG_TAG: Record<Locale, string> = { fr: "fr-MA", ar: "ar-MA" };
export const OG_LOCALE: Record<Locale, string> = { fr: "fr_MA", ar: "ar_MA" };

/** Public URL path for a locale: localizePath("ar", "/produit/x") → "/ar/produit/x". */
export function localizePath(locale: Locale, path: string) {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return p;
  return p === "/" ? `/${locale}` : p.startsWith("/?") ? `/${locale}${p.slice(1)}` : `/${locale}${p}`;
}

/** Strips the locale prefix of a public path: "/ar/produit/x" → { locale: "ar", path: "/produit/x" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(ar|fr)(?=\/|$)/);
  if (!m) return { locale: DEFAULT_LOCALE, path: pathname || "/" };
  return { locale: m[1] as Locale, path: pathname.slice(m[0].length) || "/" };
}

/** Arabic name when one is set, else the French name (product and category names come from the catalog). */
export function localName(locale: Locale, item: { name: string; nameAr?: string | null }) {
  return locale === "ar" && item.nameAr?.trim() ? item.nameAr : item.name;
}
