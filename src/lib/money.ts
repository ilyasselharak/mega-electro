const formatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format a price stored in centimes as Moroccan dirhams: 349900 → "3 499 DH" (fr) / "3 499 درهم" (ar).
 * Western digits in both languages, as on Moroccan price tags.
 */
export function formatPrice(centimes: number, locale: "fr" | "ar" = "fr"): string {
  return `${formatter.format(centimes / 100)} ${locale === "ar" ? "درهم" : "DH"}`;
}

/** Convert a user-entered dirham amount ("3499.50") to centimes. */
export function toCentimes(dirhams: number): number {
  return Math.round(dirhams * 100);
}

export function toDirhams(centimes: number): number {
  return centimes / 100;
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
