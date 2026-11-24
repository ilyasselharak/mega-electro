// Pure SEO rules shared by Convex functions and the Next.js admin (no Convex imports here).
// Defaults, completeness scoring, duplicate detection and metadata suggestions.

export const SEO_LIMITS = {
  titleMin: 30,
  /** Google cuts titles around 580px ≈ 60 characters (site name suffix included). */
  titleMax: 60,
  descMin: 70,
  descMax: 160,
} as const;

export type SeoSettingsValues = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  canonicalBaseUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageKey: string;
  socialImageKey: string;
  orgType: string;
  orgLegalName: string;
  orgDescription: string;
  orgLogoKey: string;
  orgSameAs: string;
  priceRange: string;
  homeTitle: string;
  homeDescription: string;
  homeKeywords: string;
  homeH1: string;
  homeSeoHeading: string;
  homeSeoText: string;
  homeOgTitle: string;
  homeOgDescription: string;
  homeOgImageKey: string;
  robotsExtraDisallow: string;
  robotsExtraAllow: string;
  sitemapIncludeBrands: boolean;
  sitemapIncludeStaticPages: boolean;
  sitemapIncludeImages: boolean;
  googleVerification: string;
  bingVerification: string;
  sdOrganization: boolean;
  sdWebsite: boolean;
  sdBreadcrumbs: boolean;
  sdProduct: boolean;
  sdItemList: boolean;
  sdShipping: boolean;
  shippingHandlingMin: number;
  shippingHandlingMax: number;
  shippingTransitMin: number;
  shippingTransitMax: number;
  sdReturnPolicy: boolean;
  returnDays: number;
  returnFees: string;
  returnMethod: string;
};

/**
 * Defaults reproduce what the site already published before the SEO module existed.
 * Shipping/return values match the "Livraison & retours" page (24–72 h, 7 days). Return fees and
 * method are left empty because the published policy does not state them yet.
 */
export const DEFAULT_SEO: SeoSettingsValues = {
  siteName: "Mega Electro",
  defaultTitle: "Mega Electro — Électroménager au Maroc, livraison partout",
  defaultDescription:
    "Mega Electro, votre boutique d'électroménager au Maroc : réfrigérateurs, machines à laver, cuisinières, climatiseurs et petit électroménager des meilleures marques. Livraison partout au Maroc et paiement à la livraison.",
  defaultKeywords: "",
  canonicalBaseUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: "",
  ogDescription: "",
  ogImageKey: "",
  socialImageKey: "",
  orgType: "Store",
  orgLegalName: "",
  orgDescription: "",
  orgLogoKey: "",
  orgSameAs: "",
  priceRange: "$$",
  homeTitle: "",
  homeDescription: "",
  homeKeywords: "",
  homeH1: "",
  homeSeoHeading: "",
  homeSeoText: "",
  homeOgTitle: "",
  homeOgDescription: "",
  homeOgImageKey: "",
  robotsExtraDisallow: "",
  robotsExtraAllow: "",
  sitemapIncludeBrands: true,
  sitemapIncludeStaticPages: true,
  sitemapIncludeImages: true,
  googleVerification: "",
  bingVerification: "",
  sdOrganization: true,
  sdWebsite: true,
  sdBreadcrumbs: true,
  sdProduct: true,
  sdItemList: true,
  sdShipping: true,
  shippingHandlingMin: 0,
  shippingHandlingMax: 1,
  shippingTransitMin: 1,
  shippingTransitMax: 3,
  sdReturnPolicy: true,
  returnDays: 7,
  returnFees: "",
  returnMethod: "",
};

/** Private / transactional areas and faceted-filter URLs: always disallowed in robots.txt. */
export const BASE_ROBOTS_DISALLOW = ["/admin", "/api/", "/commande", "/panier", "/compte", "/connexion", "/inscription", "/*?*tri=", "/*?*marque=", "/*?*min=", "/*?*max="];

/** Paths that must never be blocked in robots.txt (product/category/brand pages, home, assets). */
export const PROTECTED_ROBOTS_PATHS = ["/", "/produit", "/categorie", "/marque", "/promotions", "/_next"];

export function isProtectedRobotsPath(path: string) {
  const p = path.trim().replace(/\*+$/, "");
  if (!p || p === "/") return true;
  return PROTECTED_ROBOTS_PATHS.some((prot) => prot !== "/" && (p === prot || p === `${prot}/` || prot.startsWith(p)));
}

export const RESERVED_REDIRECT_PREFIXES = ["/admin", "/api", "/_next", "/connexion", "/inscription", "/commande", "/compte"];

// ── Audit ────────────────────────────────────────────────────────────────────

export type SeoMetaValues = {
  h1?: string;
  canonicalUrl?: string;
  keywords?: string;
  longDescription?: string;
  titleAr?: string;
  metaDescriptionAr?: string;
  descriptionAr?: string;
  keywordsAr?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageKey?: string;
  imageAlt?: string;
  noindex?: boolean;
  nofollow?: boolean;
};

export type AuditInput = {
  kind: "category" | "product";
  id: string;
  name: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  /** Category: description shown under the H1. Product: short description. */
  shortText: string | null;
  /** Category: seo.longDescription. Product: long description. */
  longText: string | null;
  hasImage: boolean;
  imagesMissingAlt: number;
  seo: SeoMetaValues;
};

export type CheckId =
  | "title"
  | "titleLength"
  | "description"
  | "descriptionLength"
  | "shortText"
  | "longText"
  | "keywords"
  | "imageAlt"
  | "arabicTitle"
  | "arabicDescription"
  | "duplicateTitle"
  | "duplicateDescription";

export type Check = { id: CheckId; label: string; ok: boolean; required: boolean };
export type SeoStatus = "optimized" | "incomplete" | "missing";

export type AuditResult = {
  checks: Check[];
  score: number;
  status: SeoStatus;
  titleLength: number;
  descriptionLength: number;
  effectiveTitle: string;
  effectiveDescription: string;
  duplicateTitle: boolean;
  duplicateDescription: boolean;
  noindex: boolean;
};

const clean = (s: string | null | undefined) => (s ?? "").trim();

/** Title as rendered in <title> (pages add " | Site name" through the layout template). */
export function renderedTitle(title: string, siteName: string) {
  return title.includes(siteName) ? title : `${title} | ${siteName}`;
}

export function fallbackTitle(i: Pick<AuditInput, "kind" | "name">) {
  return i.kind === "category" ? `${i.name} au meilleur prix au Maroc` : `${i.name} — Prix Maroc`;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Audits every entity and flags duplicates (computed on the effective, rendered values). */
export function auditAll(items: AuditInput[], siteName: string): Map<string, AuditResult> {
  const titleCount = new Map<string, number>();
  const descCount = new Map<string, number>();
  for (const i of items) {
    if (i.seo.noindex) continue;
    const t = clean(i.metaTitle);
    const d = clean(i.metaDescription);
    if (t) titleCount.set(norm(t), (titleCount.get(norm(t)) ?? 0) + 1);
    if (d) descCount.set(norm(d), (descCount.get(norm(d)) ?? 0) + 1);
  }
  const out = new Map<string, AuditResult>();
  for (const i of items) {
    const t = clean(i.metaTitle);
    const d = clean(i.metaDescription);
    const dupT = Boolean(t) && !i.seo.noindex && (titleCount.get(norm(t)) ?? 0) > 1;
    const dupD = Boolean(d) && !i.seo.noindex && (descCount.get(norm(d)) ?? 0) > 1;
    out.set(`${i.kind}:${i.id}`, auditOne(i, siteName, dupT, dupD));
  }
  return out;
}

export function auditOne(i: AuditInput, siteName: string, duplicateTitle = false, duplicateDescription = false): AuditResult {
  const title = clean(i.metaTitle);
  const desc = clean(i.metaDescription);
  const effectiveTitle = renderedTitle(title || fallbackTitle(i), siteName);
  const titleLength = title ? renderedTitle(title, siteName).length : 0;
  const descriptionLength = desc.length;
  const s = i.seo;
  const checks: Check[] = [
    { id: "title", label: "Titre SEO personnalisé", ok: Boolean(title), required: true },
    { id: "titleLength", label: `Longueur du titre (${SEO_LIMITS.titleMin}–${SEO_LIMITS.titleMax})`, ok: titleLength >= SEO_LIMITS.titleMin && titleLength <= SEO_LIMITS.titleMax, required: true },
    { id: "description", label: "Méta-description", ok: Boolean(desc), required: true },
    { id: "descriptionLength", label: `Longueur de la méta-description (${SEO_LIMITS.descMin}–${SEO_LIMITS.descMax})`, ok: descriptionLength >= SEO_LIMITS.descMin && descriptionLength <= SEO_LIMITS.descMax, required: true },
    { id: "shortText", label: i.kind === "category" ? "Description courte (en haut de page)" : "Résumé produit", ok: clean(i.shortText).length >= 40, required: true },
    { id: "longText", label: i.kind === "category" ? "Texte SEO long (bas de page)" : "Description détaillée", ok: clean(i.longText).length >= (i.kind === "category" ? 300 : 150), required: true },
    { id: "keywords", label: "Mots-clés cibles", ok: Boolean(clean(s.keywords)), required: false },
    {
      id: "imageAlt",
      label: i.kind === "category" ? "Texte ALT de l'image" : "Texte ALT de toutes les images",
      ok: i.kind === "category" ? !i.hasImage || Boolean(clean(s.imageAlt)) : i.hasImage && i.imagesMissingAlt === 0,
      required: true,
    },
    { id: "arabicTitle", label: "Titre arabe", ok: Boolean(clean(s.titleAr)), required: false },
    { id: "arabicDescription", label: "Description arabe", ok: Boolean(clean(s.descriptionAr) || clean(s.metaDescriptionAr)), required: false },
    { id: "duplicateTitle", label: "Titre unique", ok: !duplicateTitle, required: true },
    { id: "duplicateDescription", label: "Méta-description unique", ok: !duplicateDescription, required: true },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const status: SeoStatus = !title && !desc ? "missing" : checks.every((c) => c.ok || !c.required) ? "optimized" : "incomplete";
  return {
    checks,
    score,
    status,
    titleLength,
    descriptionLength,
    effectiveTitle,
    effectiveDescription: desc,
    duplicateTitle,
    duplicateDescription,
    noindex: Boolean(s.noindex),
  };
}

// ── Suggestions ──────────────────────────────────────────────────────────────
// Suggestions are only proposals: the admin reviews them, and the server only ever writes
// them into EMPTY fields. Product suggestions use only data already stored on the product.

/** "6 990 DH": same grouping on every runtime (Intl fr-MA output differs between Node and browsers). */
const fmtPrice = (centimes: number) => `${String(Math.round(centimes / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DH`;

function fit(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,;:–—-]+$/, "")}…`;
}

/**
 * Natural Arabic / Darija search phrases for common appliance families. Only used when the
 * category or product name contains the French term, never as a word-by-word translation.
 */
const ARABIC_TERMS: { match: RegExp; ar: string; darija?: string }[] = [
  { match: /cong[ée]lateur/i, ar: "مجمدات", darija: "فريزر" },
  { match: /r[ée]frig[ée]rateur|frigo/i, ar: "ثلاجات", darija: "فريجيدير" },
  { match: /lave[- ]vaisselle/i, ar: "غسالات الأواني", darija: "لافيسيل" },
  { match: /machine[s]? à laver|lave[- ]linge|lavage/i, ar: "آلات الغسيل", darija: "ماشينة الصابون" },
  { match: /cuisini[èe]re|cuisson/i, ar: "طباخات", darija: "كوزينيير" },
  { match: /four/i, ar: "أفران", darija: "فور" },
  { match: /micro[- ]?ondes?/i, ar: "أفران الميكروويف", darija: "ميكروند" },
  { match: /climati/i, ar: "مكيفات الهواء", darija: "كليماتيزور" },
  { match: /t[ée]l[ée]|tv|t[ée]l[ée]viseur/i, ar: "أجهزة التلفاز", darija: "تلفازة" },
  { match: /aspirateur/i, ar: "مكانس كهربائية", darija: "أسبيراتور" },
  { match: /fer à repasser/i, ar: "مكواة البخار", darija: "حديدة ديال التصيار" },
  { match: /chauffe[- ]eau/i, ar: "سخانات الماء", darija: "شوفو" },
  { match: /hotte/i, ar: "شفاطات المطبخ" },
  { match: /petit [ée]lectrom[ée]nager/i, ar: "الأجهزة المنزلية الصغيرة" },
];

export function arabicTermFor(name: string) {
  return ARABIC_TERMS.find((t) => t.match.test(name)) ?? null;
}

/** Titles are cut at a word boundary, without an ellipsis. */
function fitTitle(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max).replace(/[\s,;:–—-]+$/, "");
}

export type SuggestionPatch = {
  metaTitle?: string;
  metaDescription?: string;
  shortText?: string;
  seo: SeoMetaValues;
};

export function suggestForCategory(
  c: { name: string; parentName?: string | null; childNames: string[]; brandNames: string[]; productCount: number; hasImage: boolean },
  ctx: { siteName: string; freeShippingThreshold: number },
): SuggestionPatch {
  const n = c.name;
  const lower = n.toLowerCase();
  const brands = c.brandNames.slice(0, 3);
  const scope = c.parentName ? `${c.parentName.toLowerCase()} ${lower}` : lower;
  const titleCore = c.parentName ? `${n} — ${c.parentName} au meilleur prix au Maroc` : `${n} au meilleur prix au Maroc`;
  const metaTitle = renderedTitle(titleCore, ctx.siteName).length <= SEO_LIMITS.titleMax ? titleCore : fitTitle(`${n} au meilleur prix au Maroc`, SEO_LIMITS.titleMax - ctx.siteName.length - 3);
  const metaDescription = fit(
    `Achetez vos ${scope} au meilleur prix au Maroc${brands.length ? ` : ${brands.join(", ")}` : ""}. Livraison partout au Maroc, gratuite dès ${fmtPrice(ctx.freeShippingThreshold)}, paiement à la livraison.`,
    SEO_LIMITS.descMax,
  );
  const children = c.childNames.length ? ` Retrouvez aussi nos sous-catégories : ${c.childNames.join(", ")}.` : "";
  const shortText = `Découvrez notre sélection de ${scope}${brands.length ? ` des marques ${brands.join(", ")}` : ""}, neufs et garantis, livrés partout au Maroc avec paiement à la livraison.${children}`;
  const longDescription = [
    `Vous cherchez des ${scope} au Maroc ? ${ctx.siteName} propose ${c.productCount > 1 ? `${c.productCount} références` : "une sélection"} de ${lower}${brands.length ? ` des marques ${brands.join(", ")}` : ""}, toutes neuves et couvertes par la garantie constructeur.`,
    `Comparez les modèles selon vos besoins (capacité, dimensions, consommation d'énergie, fonctionnalités) grâce aux caractéristiques techniques détaillées sur chaque fiche produit.`,
    `Nous livrons à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et dans toutes les villes du Maroc. La livraison est offerte dès ${fmtPrice(ctx.freeShippingThreshold)} d'achat et vous payez en espèces à la réception, après vérification de votre colis.`,
  ].join("\n\n");
  const ar = arabicTermFor(n);
  const keywords = [`${lower} maroc`, `prix ${lower} maroc`, `${lower} pas cher`, ...brands.slice(0, 2).map((b) => `${lower} ${b.toLowerCase()}`)].join(", ");
  return {
    metaTitle,
    metaDescription,
    shortText,
    seo: {
      h1: c.parentName ? `${n} — ${c.parentName}` : n,
      keywords,
      longDescription,
      imageAlt: c.hasImage ? `${n} — ${ctx.siteName}` : undefined,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      ...(ar
        ? {
            titleAr: `${ar.ar} بأفضل ثمن في المغرب`,
            metaDescriptionAr: `اشتري ${ar.ar} بأفضل ثمن في المغرب من ${ctx.siteName}. التوصيل لجميع المدن والدفع عند الاستلام.`,
            descriptionAr: `تشكيلة من ${ar.ar}${brands.length ? ` من ماركات ${brands.join("، ")}` : ""}، جديدة ومضمونة. التوصيل لجميع مدن المغرب والدفع عند الاستلام.`,
            keywordsAr: [`${ar.ar} المغرب`, `ثمن ${ar.ar} في المغرب`, ar.darija ? `${ar.darija} المغرب` : null, ar.darija ? `ثمن ${ar.darija}` : null].filter(Boolean).join("، "),
          }
        : {}),
    },
  };
}

export function suggestForProduct(
  p: { name: string; brandName?: string | null; categoryName?: string | null; price: number; shortDescription?: string | null; images: { key: string; alt?: string | null }[] },
  ctx: { siteName: string; freeShippingThreshold: number },
): SuggestionPatch & { imageAlts: { key: string; alt: string }[] } {
  // Product names imported from suppliers usually already contain the brand.
  const name = p.brandName && !p.name.toLowerCase().includes(p.brandName.toLowerCase()) ? `${p.brandName} ${p.name}` : p.name;
  const budget = SEO_LIMITS.titleMax - ctx.siteName.length - 3;
  const metaTitle = `${name} — Prix Maroc`.length <= budget ? `${name} — Prix Maroc` : fitTitle(name, budget);
  const free = p.price >= ctx.freeShippingThreshold;
  const metaDescription = fit(
    `${name} à ${fmtPrice(p.price)} au Maroc. ${free ? "Livraison gratuite" : "Livraison partout au Maroc"}, paiement à la livraison${p.categoryName ? ` — ${p.categoryName} chez ${ctx.siteName}` : ""}.`,
    SEO_LIMITS.descMax,
  );
  const ar = arabicTermFor(`${p.categoryName ?? ""} ${p.name}`);
  const lowerCat = p.categoryName?.toLowerCase();
  const keywords = [name.toLowerCase(), `${name.toLowerCase()} prix maroc`, lowerCat && p.brandName ? `${lowerCat} ${p.brandName.toLowerCase()}` : null].filter(Boolean).join(", ");
  return {
    metaTitle,
    metaDescription,
    seo: {
      keywords,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      ...(ar
        ? {
            titleAr: `${p.name}${p.brandName && !p.name.includes(p.brandName) ? ` ${p.brandName}` : ""} — الثمن في المغرب`,
            metaDescriptionAr: `${name} بثمن ${fmtPrice(p.price).replace("DH", "درهم")} في المغرب. التوصيل لجميع المدن والدفع عند الاستلام.`,
            keywordsAr: [`${ar.ar} ${p.brandName ?? ""}`.trim(), ar.darija ? `ثمن ${ar.darija} ${p.brandName ?? ""}`.trim() : null].filter(Boolean).join("، "),
          }
        : {}),
    },
    imageAlts: p.images.map((img, i) => ({ key: img.key, alt: i === 0 ? name : `${name} — vue ${i + 1}` })),
  };
}

/** Keeps only the suggestion fields whose current value is empty (never overwrites). */
export function onlyEmpty<T extends Record<string, unknown>>(current: Partial<Record<keyof T, unknown>>, proposal: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(proposal)) {
    if (v === undefined || v === null || v === "") continue;
    const cur = current[k as keyof T];
    if (cur === undefined || cur === null || (typeof cur === "string" && cur.trim() === "")) out[k as keyof T] = v as T[keyof T];
  }
  return out;
}
