import { ArrowUpRight, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { StoreImage } from "@/components/shared/store-image";
import { ProductRail } from "@/components/store/product-card";
import { TrustBar } from "@/components/store/footer";
import { Price } from "@/components/store/price";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { Link } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt, plural } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { getActiveBrands, getHomeCollections, getNavCategories, type ProductCardData } from "@/server/queries/catalog";
import { getSettings } from "@/server/queries/settings";
import { getSeoSettings } from "@/server/queries/seo";
import { formatPrice } from "@/lib/money";
import { keywordList } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { imageUrl } from "@/lib/images";

export const revalidate = 600;

export async function generateMetadata() {
  const [seo, locale] = await Promise.all([getSeoSettings(), getLocale()]);
  const t = await getDictionary(locale);
  const ogKey = seo.homeOgImageKey || seo.ogImageKey;
  // The French homepage SEO is edited in Admin → SEO; Arabic uses the dictionary.
  return localizedMetadata({
    title: locale === "ar" ? `${t.brand.name} — ${t.home.heroBadge}` : seo.homeTitle || seo.defaultTitle,
    absoluteTitle: true,
    description: locale === "ar" ? t.home.seoText1 : seo.homeDescription || seo.defaultDescription,
    path: "/",
    keywords: locale === "ar" ? undefined : keywordList(seo.homeKeywords, seo.defaultKeywords),
    image: ogKey ? imageUrl(ogKey, 1200) : undefined,
    ogTitle: locale === "ar" ? null : seo.homeOgTitle || seo.ogTitle,
    ogDescription: locale === "ar" ? null : seo.homeOgDescription || seo.ogDescription,
    seo,
  });
}

function Section({ title, href, linkLabel, children, tone }: { title: string; href?: string; linkLabel?: string; children: React.ReactNode; tone?: "plain" | "card" }) {
  return (
    <section className={tone === "card" ? "border-y bg-card py-12 sm:py-16" : "py-12 sm:py-16"}>
      <div className="container-page">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] sm:text-[2.125rem]">{title}</h2>
          {href && linkLabel ? (
            <Link href={href} className="group inline-flex shrink-0 items-center gap-1 rounded-full border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
              {linkLabel}
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden />
            </Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** The showroom shelf: real products, lit on the dark hero panel, with the current running along the shelf edge. */
async function ShowroomShelf({ products }: { products: ProductCardData[] }) {
  const locale = await getLocale();
  if (!products.length) return null;
  return (
    <div className="relative">
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
        {products.map((p, i) => (
          <li key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
            <Link href={`/produit/${p.slug}`} className="group flex h-full flex-col rounded-2xl bg-card p-3 text-card-foreground shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)] transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brass">
              <span className="relative block aspect-square">
                <StoreImage imageKey={p.images[0]?.key} alt={p.images[0]?.alt ?? localName(locale, p)} fill priority={i < 3} sizes="(min-width: 1024px) 190px, 45vw" className="object-contain p-2" />
              </span>
              <span className="mt-2 line-clamp-2 min-h-10 text-[13px] font-medium leading-5">{localName(locale, p)}</span>
              <span className="mt-1"><Price price={p.price} compareAtPrice={p.compareAtPrice} size="sm" /></span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-5 h-px bg-ink-foreground/15" aria-hidden>
        <div className="current-line h-px bg-brass shadow-[0_0_12px_2px] shadow-brass/60" />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [collections, categories, brands, settings, seo, locale] = await Promise.all([getHomeCollections(), getNavCategories(), getActiveBrands(), getSettings(), getSeoSettings(), getLocale()]);
  const t = await getDictionary(locale);
  const pool = [...collections.featured, ...collections.deals, ...collections.newest, ...collections.bestSellers];
  // Six distinct in-stock products with photos for the shelf.
  const shelf = [...new Map(pool.filter((p) => p.images.length && p.stock > 0).map((p) => [p.id, p])).values()].slice(0, 6);
  const free = settings.freeShippingThreshold > 0 ? fmt(t.home.heroNoteFree, { amount: formatPrice(settings.freeShippingThreshold, locale) }) : null;
  const seoParagraphs = locale === "fr" && seo.homeSeoText ? seo.homeSeoText.split(/\n{2,}/) : [t.home.seoText1, t.home.seoText2];
  const cities = locale === "ar" ? ["الدار البيضاء", "الرباط", "مراكش", "طنجة", "فاس", "أكادير"] : ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="absolute inset-0 bg-showroom [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
        <div className="container-page relative pb-10 pt-12 sm:pt-16 lg:pb-14 lg:pt-20">
          <div className="grid items-end gap-8 lg:grid-cols-[1.25fr_1fr]">
            <h1 className="text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.5rem]">
              {locale === "fr" && seo.homeH1 ? seo.homeH1 : `${t.home.heroTitleA} ${t.home.heroTitleB}`}
            </h1>
            <div className="max-w-md space-y-6 lg:pb-2">
              <p className="text-base leading-7 text-ink-foreground/75 sm:text-lg">{t.home.heroText}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                  <Link href="/recherche">{t.home.heroCta}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-ink-foreground/25 bg-transparent px-6 text-base text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground">
                  <Link href="/promotions"><BadgePercent /> {t.home.heroPromo}</Link>
                </Button>
              </div>
              <p className="text-sm text-ink-foreground/60">{[free, t.home.heroNoteCod].filter(Boolean).join(locale === "ar" ? "، " : ", ")}</p>
            </div>
          </div>
          <div className="mt-12 lg:mt-16"><ShowroomShelf products={shelf} /></div>
        </div>
      </section>

      <div className="border-b bg-card">
        <div className="container-page py-7"><TrustBar freeShippingThreshold={settings.freeShippingThreshold} /></div>
      </div>

      {categories.length ? (
        <Section title={t.home.categoriesTitle}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorie/${c.slug}`} className="group flex h-full flex-col rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40">
                  <span className="relative flex aspect-[4/3] items-center justify-center text-primary">
                    {c.imageKey ? (
                      <StoreImage imageKey={c.imageKey} alt={c.imageAlt || localName(locale, c)} fill sizes="200px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <CategoryIcon name={c.icon} className="size-10" />
                    )}
                  </span>
                  <span className="mt-4 block text-[15px] font-semibold leading-tight">{localName(locale, c)}</span>
                  <span className="mt-1 block text-xs tabular-nums text-muted-foreground">{plural(locale, c._count.products, t.home.categoryCount)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {collections.deals.length ? (
        <Section title={t.home.dealsTitle} href="/promotions" linkLabel={t.common.seeAll} tone="card">
          <ProductRail products={collections.deals} />
        </Section>
      ) : null}
      {collections.featured.length ? (
        <Section title={t.home.featuredTitle} href="/recherche" linkLabel={t.common.seeAll}>
          <ProductRail products={collections.featured} />
        </Section>
      ) : null}
      {collections.bestSellers.length ? (
        <Section title={t.home.bestTitle} href="/recherche?tri=meilleures-ventes" linkLabel={t.common.seeAll} tone="card">
          <ProductRail products={collections.bestSellers} />
        </Section>
      ) : null}
      {collections.newest.length ? (
        <Section title={t.home.newTitle} href="/recherche?tri=nouveautes" linkLabel={t.common.seeAll}>
          <ProductRail products={collections.newest} />
        </Section>
      ) : null}

      <section className="container-page py-10 sm:py-12">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-ink-foreground sm:p-10">
            <div className="absolute inset-0 bg-showroom opacity-60" aria-hidden />
            <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">{t.home.deliveryTitle}</h2>
            <p className="mt-3 max-w-xl leading-7 text-ink-foreground/75">{t.home.deliveryText}</p>
            <p className="mt-5 text-sm opacity-80">{t.home.deliveryCities}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {cities.map((c) => <li key={c} className="rounded-full border border-ink-foreground/15 px-3 py-1 text-sm">{c}</li>)}
            </ul>
            <p className="mt-2 text-sm opacity-80">{t.home.deliveryMore}</p>
            <Link href="/livraison-retours" className="mt-6 inline-block text-sm font-semibold text-brass underline-offset-4 hover:underline">{t.home.deliveryLink}</Link>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-3xl border bg-card p-7 sm:p-10">
            <div>
              <h2 className="text-2xl font-bold">{t.home.whatsappTitle}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{t.home.whatsappText}</p>
            </div>
            <Button asChild size="lg" className="h-12 w-fit rounded-full bg-[#25D366] px-6 text-base text-[#063f2d] hover:bg-[#25D366]/90">
              <a href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(t.home.whatsappGreeting)}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-5" /> {t.home.whatsappCta}</a>
            </Button>
          </div>
        </div>
      </section>

      {brands.length ? (
        <Section title={t.home.brandsTitle}>
          <ul className="flex flex-wrap gap-3">
            {brands.map((b) => (
              <li key={b.id}>
                <Link href={`/marque/${b.slug}`} className="flex h-14 min-w-28 items-center justify-center rounded-xl border bg-card px-5 transition-colors hover:border-primary/40">
                  {b.logoKey ? (
                    <span className="relative h-7 w-20"><StoreImage imageKey={b.logoKey} alt={b.name} fill sizes="80px" className="object-contain" /></span>
                  ) : (
                    <span className="font-heading text-[15px] font-bold text-foreground/75">{b.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <section className="container-page pb-4 pt-6">
        <div className="max-w-3xl">
          <h2 className="mb-3 text-xl font-bold">{locale === "fr" && seo.homeSeoHeading ? seo.homeSeoHeading : t.home.seoTitle}</h2>
          <div className="prose-store text-muted-foreground">
            {seoParagraphs.map((para, i) => <p key={i} className="whitespace-pre-line">{para}</p>)}
          </div>
        </div>
      </section>
    </>
  );
}
