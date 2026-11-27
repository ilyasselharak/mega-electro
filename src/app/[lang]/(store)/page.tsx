import { ArrowLeft, ArrowRight, BadgePercent, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { StoreImage } from "@/components/shared/store-image";
import { ProductRail } from "@/components/store/product-card";
import { TrustBar } from "@/components/store/footer";
import { Price } from "@/components/store/price";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { Link } from "@/i18n/client";
import { localName, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { fmt, plural } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { getActiveBrands, getHomeCollections, getNavCategories, type ProductCardData } from "@/server/queries/catalog";
import { getBrandRanking, getCategoryCovers, getStorefront, type Storefront } from "@/server/queries/storefront";
import { getSettings } from "@/server/queries/settings";
import { getSeoSettings } from "@/server/queries/seo";
import { formatPrice } from "@/lib/money";
import { keywordList } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { imageUrl } from "@/lib/images";
import { isLive, resolveSections, type HomeSectionKey } from "@/lib/storefront";
import { cn } from "@/lib/utils";

export const revalidate = 600;

export async function generateMetadata() {
  const [seo, locale] = await Promise.all([getSeoSettings(), getLocale()]);
  const t = await getDictionary(locale);
  const ogKey = seo.homeOgImageKey || seo.ogImageKey;
  // The French homepage SEO is edited in Admin → SEO; Arabic uses the dictionary.
  return localizedMetadata({
    title: locale === "ar" ? `${t.brand.name} — ${t.home.heroBadge}` : seo.homeTitle || seo.defaultTitle,
    absoluteTitle: true,
    description: locale === "ar" ? t.home.metaDescription : seo.homeDescription || seo.defaultDescription,
    path: "/",
    keywords: locale === "ar" ? undefined : keywordList(seo.homeKeywords, seo.defaultKeywords),
    image: ogKey ? imageUrl(ogKey, 1200) : undefined,
    ogTitle: locale === "ar" ? null : seo.homeOgTitle || seo.ogTitle,
    ogDescription: locale === "ar" ? null : seo.homeOgDescription || seo.ogDescription,
    seo,
  });
}

/** Internal path or absolute URL from an admin banner. */
function BannerLink({ href, className, children, label }: { href: string; className?: string; children: React.ReactNode; label?: string }) {
  if (/^https?:/.test(href)) {
    return <a href={href} className={className} aria-label={label}>{children}</a>;
  }
  return <Link href={href.startsWith("/") ? href : `/${href}`} className={className} aria-label={label}>{children}</Link>;
}

function Section({ title, href, linkLabel, children, locale, id }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode; locale: Locale; id?: string }) {
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  return (
    <section className="py-8 sm:py-12" aria-labelledby={id}>
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <h2 id={id} className="text-[1.375rem] font-extrabold leading-tight tracking-[-0.025em] sm:text-[1.75rem]">{title}</h2>
          {href && linkLabel ? (
            <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground underline-offset-4 hover:underline">
              {linkLabel}
              <Arrow className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

type HeroProps = { products: ProductCardData[]; banner: Storefront["banners"][number] | null; t: Dictionary; locale: Locale; h1: string; notes: string };

/**
 * Hero. An admin hero banner (with photo) takes over when one is live; otherwise the store's
 * promise on navy, beside real products from the catalog standing on white stages.
 */
function Hero({ products, banner, t, locale, h1, notes }: HeroProps) {
  const ar = locale === "ar";
  if (banner?.imageKey) {
    const title = (ar && banner.titleAr) || banner.title;
    const subtitle = (ar && banner.subtitleAr) || banner.subtitle;
    const cta = (ar && banner.ctaLabelAr) || banner.ctaLabel || t.home.heroShop;
    return (
      <section className="bg-ink text-ink-foreground">
        <div className="container-page grid items-center gap-6 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 lg:py-14">
          <div className="space-y-5">
            <h1 className="text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[3.5rem]">{h1}</h1>
            <p className="text-xl font-semibold">{title}</p>
            {subtitle ? <p className="max-w-lg text-base leading-7 text-ink-foreground/75">{subtitle}</p> : null}
            <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base font-bold">
              <BannerLink href={banner.href}>{cta}</BannerLink>
            </Button>
          </div>
          <BannerLink href={banner.href} className="relative block aspect-[16/10] overflow-hidden rounded-2xl bg-white" label={title}>
            <StoreImage imageKey={banner.imageKey} alt={title} fill priority sizes="(min-width: 1024px) 680px, 100vw" className="object-cover" />
          </BannerLink>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ink text-ink-foreground">
      <div className="container-page grid items-center gap-6 py-7 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-16">
        <div className="space-y-5 sm:space-y-6">
          <h1 className="max-w-xl text-[2.125rem] font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-[3.25rem] lg:text-[3.75rem]">{h1}</h1>
          <p className="max-w-lg text-[15px] leading-7 text-ink-foreground/75 sm:text-[17px]">{t.home.heroLead}</p>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <Button asChild size="lg" className="h-12 rounded-xl px-5 text-[15px] font-bold sm:px-6 sm:text-base">
              <Link href="/recherche">{t.home.heroShop}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-ink-foreground/25 bg-transparent px-4 text-[15px] text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground sm:px-5 sm:text-base">
              <Link href="/promotions"><BadgePercent aria-hidden /> {t.home.heroPromo}</Link>
            </Button>
          </div>
          {notes ? <p className="text-sm text-ink-foreground/60">{notes}</p> : null}
        </div>
        {products.length ? (
          <ul className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-[1.35fr_1fr] lg:grid-rows-2">
            {products.slice(0, 3).map((p, i) => (
              <li key={p.id} className={cn(i === 0 && "lg:row-span-2")}>
                <Link href={`/produit/${p.slug}`} className="group flex h-full flex-col rounded-xl bg-white p-2.5 text-foreground sm:p-3 lg:rounded-2xl lg:p-4">
                  <span className={cn("relative block aspect-square", i === 0 ? "lg:aspect-auto lg:flex-1" : "lg:aspect-[4/3] lg:flex-1")}>
                    <StoreImage
                      imageKey={p.images[0]?.key}
                      alt={p.images[0]?.alt ?? localName(locale, p)}
                      fill
                      priority
                      sizes={i === 0 ? "(min-width: 1024px) 400px, 30vw" : "(min-width: 1024px) 260px, 30vw"}
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className="mt-2 line-clamp-1 text-[13px] font-medium max-sm:hidden">{localName(locale, p)}</span>
                  <Price price={p.price} compareAtPrice={p.compareAtPrice} size={i === 0 ? "md" : "sm"} className="mt-1.5 sm:mt-0.5 max-sm:[&_s]:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [collections, categories, covers, brands, ranking, storefront, settings, seo, locale] = await Promise.all([
    getHomeCollections(),
    getNavCategories(),
    getCategoryCovers(),
    getActiveBrands(),
    getBrandRanking(),
    getStorefront(),
    getSettings(),
    getSeoSettings(),
    getLocale(),
  ]);
  const t = await getDictionary(locale);
  const ar = locale === "ar";
  const banners = storefront.banners.filter((b) => isLive(b));
  const heroBanner = banners.find((b) => b.placement === "hero" && b.imageKey) ?? null;
  const promos = banners.filter((b) => b.placement === "promo");
  const liveCollections = storefront.collections.filter((c) => isLive(c) && c.products.length);

  const pool = [...collections.featured, ...collections.deals, ...collections.newest, ...collections.bestSellers];
  // Three distinct in-stock products with photos for the hero stage.
  const heroProducts = [...new Map(pool.filter((p) => p.images.length && p.stock > 0).map((p) => [p.id, p])).values()].slice(0, 3);
  const notes = [settings.freeShippingThreshold > 0 ? fmt(t.home.heroNoteFree, { amount: formatPrice(settings.freeShippingThreshold, locale) }) : null, settings.codEnabled ? t.home.heroNoteCod : null]
    .filter(Boolean)
    .join(ar ? "، " : ", ");
  // The French H1 stays editable in Admin → SEO (homeH1); otherwise the brand line.
  const h1 = !ar && seo.homeH1 ? seo.homeH1 : t.home.heroTitle;
  const seoParagraphs = !ar && seo.homeSeoText ? seo.homeSeoText.split(/\n{2,}/) : [t.home.seoText1, t.home.seoText2];
  const logos = new Map(brands.map((b) => [b.slug, b.logoKey]));
  const topBrands = ranking.slice(0, 12);

  const render: Record<HomeSectionKey, () => React.ReactNode> = {
    hero: () => <Hero key="hero" products={heroProducts} banner={heroBanner} t={t} locale={locale} h1={h1} notes={notes} />,

    categories: () =>
      categories.length ? (
        <Section key="categories" id="home-categories" title={t.home.popularCategories} locale={locale}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]">
            {categories.map((c) => {
              const cover = covers[c.id];
              return (
                <li key={c.id}>
                  <Link href={`/categorie/${c.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-border/70 transition-shadow hover:shadow-lift">
                    <span className="relative flex aspect-square items-center justify-center bg-white">
                      {cover ? (
                        <StoreImage imageKey={cover.key} alt={cover.alt || localName(locale, c)} fill sizes="(min-width: 1024px) 180px, 32vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105 sm:p-4" />
                      ) : (
                        <CategoryIcon name={c.icon} className="size-9 text-muted-foreground" />
                      )}
                    </span>
                    <span className="border-t border-border/60 px-2.5 py-2 sm:px-3 sm:py-2.5">
                      <span className="line-clamp-2 block text-[13px] font-semibold leading-tight sm:text-sm">{localName(locale, c)}</span>
                      <span className="price mt-0.5 block text-[11px] text-muted-foreground sm:text-xs">{plural(locale, c._count.products, t.home.categoryCount)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null,

    promos: () =>
      promos.length ? (
        <section key="promos" className="container-page py-4 sm:py-6">
          <ul className={cn("grid gap-3 sm:gap-4", promos.length > 1 && "md:grid-cols-2", promos.length > 2 && "xl:grid-cols-3")}>
            {promos.slice(0, 3).map((b) => {
              const title = (ar && b.titleAr) || b.title;
              const subtitle = (ar && b.subtitleAr) || b.subtitle;
              const cta = (ar && b.ctaLabelAr) || b.ctaLabel;
              return (
                <li key={b.id}>
                  <BannerLink href={b.href} className="group grid h-full grid-cols-[minmax(0,1fr)_42%] overflow-hidden rounded-2xl bg-ink text-ink-foreground">
                    <span className="flex flex-col justify-center gap-2 p-5 sm:p-6">
                      <span className="text-lg font-extrabold leading-tight tracking-[-0.02em] sm:text-xl">{title}</span>
                      {subtitle ? <span className="text-sm leading-6 text-ink-foreground/70">{subtitle}</span> : null}
                      {cta ? <span className="mt-1 text-sm font-bold text-primary underline-offset-4 group-hover:underline">{cta}</span> : null}
                    </span>
                    <span className="relative min-h-36 bg-white">
                      {b.imageKey ? <StoreImage imageKey={b.imageKey} alt="" fill sizes="(min-width: 768px) 260px, 42vw" className="object-cover" /> : null}
                    </span>
                  </BannerLink>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null,

    bestSellers: () =>
      collections.bestSellers.length ? (
        <Section key="bestSellers" id="home-best" title={t.home.bestTitle} href="/recherche?tri=meilleures-ventes" linkLabel={t.common.seeAll} locale={locale}>
          <ProductRail products={collections.bestSellers} />
        </Section>
      ) : null,

    deals: () =>
      collections.deals.length ? (
        <Section key="deals" id="home-deals" title={t.home.dealsTitle} href="/promotions" linkLabel={t.common.seeAll} locale={locale}>
          <ProductRail products={collections.deals} />
        </Section>
      ) : null,

    newArrivals: () =>
      collections.newest.length ? (
        <Section key="newArrivals" id="home-new" title={t.home.newTitle} href="/recherche?tri=nouveautes" linkLabel={t.common.seeAll} locale={locale}>
          <ProductRail products={collections.newest} />
        </Section>
      ) : null,

    featured: () =>
      collections.featured.length ? (
        <Section key="featured" id="home-featured" title={t.home.featuredTitle} locale={locale}>
          <ProductRail products={collections.featured} />
        </Section>
      ) : null,

    collections: () =>
      liveCollections.length ? (
        <div key="collections">
          {liveCollections.map((c) => (
            <Section key={c.id} id={`col-${c.id}`} title={(ar && c.titleAr) || c.title || t.home.collectionsFallback} locale={locale}>
              {(ar ? c.descriptionAr : c.description) ? <p className="-mt-3 mb-5 max-w-2xl text-sm leading-6 text-muted-foreground">{ar ? c.descriptionAr : c.description}</p> : null}
              <ProductRail products={c.products} />
            </Section>
          ))}
        </div>
      ) : null,

    brands: () =>
      topBrands.length ? (
        <Section key="brands" id="home-brands" title={t.home.brandsTitle} locale={locale}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
            {topBrands.map((b) => {
              const logo = logos.get(b.slug);
              return (
                <li key={b.id}>
                  <Link href={`/marque/${b.slug}`} className="flex h-16 flex-col items-center justify-center rounded-xl bg-card px-3 shadow-card ring-1 ring-border/70 transition-shadow hover:shadow-lift sm:h-20">
                    {logo ? (
                      <span className="relative h-8 w-full"><StoreImage imageKey={logo} alt={b.name} fill sizes="120px" className="object-contain" /></span>
                    ) : (
                      <span className="truncate text-[15px] font-extrabold capitalize tracking-[-0.02em] text-foreground/80">{b.name}</span>
                    )}
                    <span className="price text-[11px] text-muted-foreground">{plural(locale, b.count, t.home.categoryCount)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {ranking.length > topBrands.length ? (
            <details className="group mt-4">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-lg px-1 text-sm font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                {fmt(t.home.brandsMore, { count: ranking.length })}
              </summary>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {ranking.map((b) => (
                  <li key={b.id}><Link href={`/marque/${b.slug}`} className="capitalize text-muted-foreground hover:text-foreground hover:underline">{b.name}</Link></li>
                ))}
              </ul>
            </details>
          ) : null}
        </Section>
      ) : null,

    service: () => (
      <section key="service" className="container-page py-8 sm:py-12">
        <div className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/70">
          <div className="border-b border-border/60 p-5 sm:p-7"><TrustBar freeShippingThreshold={settings.freeShippingThreshold} /></div>
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">{t.home.serviceTitle}</h2>
              <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">{t.home.serviceText}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button asChild size="lg" className="h-12 rounded-xl bg-success-strong px-5 text-base font-semibold text-white hover:bg-success-strong/90">
                <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(t.home.whatsappGreeting)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-5" /> {t.home.whatsappCta}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-5 text-base">
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`}><Phone aria-hidden /> {t.home.serviceCall}</a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 rounded-xl px-4 text-base">
                <Link href="/suivi-commande"><Package aria-hidden /> {t.home.serviceTrack}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    ),

    seo: () => (
      <section key="seo" className="container-page pb-6 pt-4">
        <div className="max-w-3xl">
          <h2 className="mb-3 text-lg font-bold">{!ar && seo.homeSeoHeading ? seo.homeSeoHeading : t.home.seoTitle}</h2>
          <div className="prose-store text-muted-foreground">
            {seoParagraphs.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
          </div>
          <nav aria-label={t.header.categories} className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {categories.map((c) => (
              <Link key={c.id} href={`/categorie/${c.slug}`} className="font-medium underline-offset-4 hover:underline">{localName(locale, c)}</Link>
            ))}
          </nav>
        </div>
      </section>
    ),
  };

  const sections = resolveSections(storefront.sections);
  // The hero carries the page's only <h1>: if an admin hides it, keep the heading for SEO and screen readers.
  const heroHidden = !sections.find((s) => s.key === "hero")?.visible;
  return (
    <>
      {heroHidden ? <h1 className="sr-only">{h1}</h1> : null}
      {sections.filter((s) => s.visible).map((s) => render[s.key]())}
    </>
  );
}
