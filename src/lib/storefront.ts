// Homepage sections, shared by the storefront and Admin → Vitrine.

export const HOME_SECTIONS = [
  { key: "hero", label: "Bannière principale" },
  { key: "categories", label: "Catégories populaires" },
  { key: "promos", label: "Bannières promotionnelles" },
  { key: "bestSellers", label: "Meilleures ventes (ventes réelles)" },
  { key: "deals", label: "Bonnes affaires (prix barrés)" },
  { key: "newArrivals", label: "Nouveautés" },
  { key: "featured", label: "Produits mis en avant" },
  { key: "collections", label: "Collections saisonnières" },
  { key: "brands", label: "Marques" },
  { key: "service", label: "Confiance et service client" },
  { key: "seo", label: "Texte de présentation (SEO)" },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["key"];
export type SectionSetting = { key: string; visible: boolean };

const KEYS = new Set<string>(HOME_SECTIONS.map((s) => s.key));

/** Saved order first (unknown keys dropped), then any section added since, visible by default. */
export function resolveSections(saved: SectionSetting[] | null | undefined): { key: HomeSectionKey; visible: boolean }[] {
  const seen = new Set<string>();
  const out: { key: HomeSectionKey; visible: boolean }[] = [];
  for (const s of saved ?? []) {
    if (KEYS.has(s.key) && !seen.has(s.key)) {
      seen.add(s.key);
      out.push({ key: s.key as HomeSectionKey, visible: s.visible });
    }
  }
  for (const s of HOME_SECTIONS) if (!seen.has(s.key)) out.push({ key: s.key, visible: true });
  return out;
}

/** True when a campaign window includes `now` (empty bounds = open). */
export function isLive(item: { startsAt?: number | null; endsAt?: number | null }, now = Date.now()) {
  return (item.startsAt == null || item.startsAt <= now) && (item.endsAt == null || item.endsAt > now);
}

const HEX = /^#[0-9a-f]{6}$/i;
export const isHex = (v: string | null | undefined): v is string => Boolean(v && HEX.test(v));

/** WCAG contrast ratio between two #rrggbb colours. */
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export function campaignStatus(item: { startsAt?: number | null; endsAt?: number | null }, now = Date.now()): "live" | "scheduled" | "ended" {
  if (isLive(item, now)) return "live";
  return item.startsAt != null && item.startsAt > now ? "scheduled" : "ended";
}
