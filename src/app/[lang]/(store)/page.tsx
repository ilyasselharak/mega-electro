import { BadgePercent, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/shared/category-icon";
import { LogoMark } from "@/components/shared/logo";
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
    <section className={tone === "card" ? "bg-card py-10 sm:py-12" : "py-10 sm:py-12"}>
      <div className="container-page">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-[28px]">{title}</h2>
          {href && linkLabel ? (
            <Link href={href} className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline">{linkLabel}</Link>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Signature arch frame: the hero product, or the brand arch when no product has a photo yet. */
async function HeroArch({ product }: { product?: ProductCardData }) {
  const locale = await getLocale();
  return (
    <div className="relative mx-auto w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700">
      <div className="arch absolute inset-0 translate-x-3 translate-y-3 border-2 border-brass/60 rtl:-translate-x-3" aria-hidden />
      {product ? (
        <Link href={`/produit/${product.slug}`} className="group arch relative block aspect-[4/5] overflow-hidden bg-white shadow-2xl shadow-black/25">
          <StoreImage imageKey={product.images[0]?.key} alt={product.images[0]?.alt ?? localName(locale, product)} fill priority sizes="(min-width: 1024px) 420px, 80vw" className="object-contain px-10 pb-28 pt-16 transition-transform duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-x-5 bottom-5 rounded-xl bg-background/95 p-4 text-foreground shadow-lg">
            <span className="line-clamp-1 text-sm font-medium">{localName(locale, product)}</span>
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="md" />
          </span>
        </Link>
      ) : (
        <div className="arch relative flex aspect-[4/5] items-center justify-center bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
          <LogoMark className="size-40 opacity-90" />
        </div>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [collections, categories, brands, settings, seo, locale] = await Promise.all([getHomeCollections(), getNavCategories(), getActiveBrands(), getSettings(), getSeoSettings(), getLocale()]);
  const t = await getDictionary(locale);
  const pool = [...collections.featured, ...collections.deals, ...collections.newest, ...collections.bestSellers];
  const heroProduct = pool.find((p) => p.images.length && p.stock > 0);
  const free = settings.freeShippingThreshold > 0 ? fmt(t.home.heroNoteFree, { amount: formatPrice(settings.freeShippingThreshold, locale) }) : null;
  const seoParagraphs = locale === "fr" && seo.homeSeoText ? seo.homeSeoText.split(/\n{2,}/) : [t.home.seoText1, t.home.seoText2];
  const cities = locale === "ar" ? ["الدار البيضاء", "الرباط", "مراكش", "طنجة", "فاس", "أكادير"] : ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"];

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-zellige opacity-50" aria-hidden />
        <div className="container-page relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div className="max-w-xl space-y-6">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-brass"><MapPin className="size-4" aria-hidden /> {t.home.heroBadge}</p>
            <h1 className="text-[2.5rem] font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
              {locale === "fr" && seo.homeH1 ? seo.homeH1 : `${t.home.heroTitleA} ${t.home.heroTitleB}`}
            </h1>
            <p className="text-base leading-7 opacity-85 sm:text-lg">{t.home.heroText}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-brass px-6 text-base text-brass-foreground hover:bg-brass/90">
                <Link href="/recherche">{t.home.heroCta}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary-foreground/30 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/promotions"><BadgePercent /> {t.home.heroPromo}</Link>
              </Button>
            </div>
            <p className="text-sm opacity-75">{[free, t.home.heroNoteCod].filter(Boolean).join(" — ")}</p>
          </div>
          <div className="max-lg:hidden"><HeroArch product={heroProduct} /></div>
        </div>
      </section>

      <div className="border-b bg-card">
        <div className="container-page py-6"><TrustBar freeShippingThreshold={settings.freeShippingThreshold} /></div>
      </div>

      {categories.length ? (
        <Section title={t.home.categoriesTitle}>
          <ul className="-mx-4 grid auto-cols-[8.5rem] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:auto-cols-fr lg:px-0">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categorie/${c.slug}`} className="group flex h-full flex-col items-center gap-3 text-center">
                  <span className="arch relative flex aspect-[4/5] w-full items-end justify-center overflow-hidden border bg-card text-primary transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                    {c.imageKey ? (
                      <StoreImage imageKey={c.imageKey} alt={c.imageAlt || localName(locale, c)} fill sizes="160px" className="object-contain p-4 pt-8" />
                    ) : (
                      <CategoryIcon name={c.icon} className="mb-[30%] size-10" />
                    )}
                  </span>
                  <span className="space-y-0.5">
                    <span className="block text-sm font-semibold leading-tight">{localName(locale, c)}</span>
                    <span className="block text-xs text-muted-foreground">{plural(locale, c._count.products, t.home.categoryCount)}</span>
                  </span>
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
          <div className="rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">{t.home.deliveryTitle}</h2>
            <p className="mt-3 max-w-xl leading-7 opacity-85">{t.home.deliveryText}</p>
            <p className="mt-5 text-sm opacity-80">{t.home.deliveryCities}</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {cities.map((c) => <li key={c} className="rounded-full bg-primary-foreground/10 px-3 py-1 text-sm">{c}</li>)}
            </ul>
            <p className="mt-2 text-sm opacity-80">{t.home.deliveryMore}</p>
            <Link href="/livraison-retours" className="mt-6 inline-block text-sm font-semibold text-brass underline-offset-4 hover:underline">{t.home.deliveryLink}</Link>
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
