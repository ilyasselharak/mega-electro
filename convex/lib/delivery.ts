// Delivery & payment rules, shared by the checkout preview (Next) and the order transaction (Convex).
// Pure: no Convex imports.

export type DeliveryZone = {
  city: string;
  cityAr?: string | null;
  /** Centimes. */
  fee: number;
  /** Centimes; empty = the store-wide free-shipping threshold. */
  freeThreshold?: number | null;
  etaMinDays: number;
  etaMaxDays: number;
  codAvailable: boolean;
};

export type DeliveryConfig = {
  zones: DeliveryZone[];
  /** Fee for cities without a zone (store settings), centimes. */
  defaultFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  acceptUnlistedCities: boolean;
};

export type DeliveryResult =
  | { deliverable: true; fee: number; cod: boolean; eta: { min: number; max: number } | null; zone: DeliveryZone | null }
  | { deliverable: false; fee: null; cod: false; eta: null; zone: null };

/** "Fès", "fes ", "FES" → "fes"; "Ksar El Kébir" → "ksar el kebir". */
export function normalizeCity(city: string) {
  return city.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[-_']/g, " ").replace(/\s+/g, " ").trim();
}

export function findZone(zones: DeliveryZone[], city: string) {
  const n = normalizeCity(city);
  return zones.find((z) => normalizeCity(z.city) === n || (z.cityAr && z.cityAr.trim() === city.trim())) ?? null;
}

export function deliveryFor(cfg: DeliveryConfig, city: string, subtotal: number): DeliveryResult {
  const zone = city.trim() ? findZone(cfg.zones, city) : null;
  if (!zone && !cfg.acceptUnlistedCities && cfg.zones.length > 0) return { deliverable: false, fee: null, cod: false, eta: null, zone: null };
  const threshold = zone?.freeThreshold ?? cfg.freeShippingThreshold;
  const base = zone ? zone.fee : cfg.defaultFee;
  const fee = subtotal === 0 || (threshold > 0 && subtotal >= threshold) ? 0 : base;
  return {
    deliverable: true,
    fee,
    cod: cfg.codEnabled && (zone ? zone.codAvailable : true),
    eta: zone ? { min: zone.etaMinDays, max: zone.etaMaxDays } : null,
    zone,
  };
}

/** Lowest delivery fee across zones (or the default fee), for "delivery from X" on product pages. */
export function minimumFee(cfg: DeliveryConfig) {
  const fees = [cfg.defaultFee, ...cfg.zones.map((z) => z.fee)];
  return Math.min(...fees);
}
