import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert, RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductBuyBox } from "@/components/store/product-buy-box";
import { ProductDescription } from "@/components/store/product-description";
import { ProductRail } from "@/components/store/product-card";
import { Price } from "@/components/store/price";
import { JsonLd } from "@/components/shared/json-ld";
import { Link } from "@/i18n/client";
import { localizePath, localName } from "@/i18n/config";
import { fmt, plural } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { getProductBySlug, getRelatedProducts } from "@/server/queries/catalog";
import { getSettings } from "@/server/queries/settings";
import { getSeoSettings } from "@/server/queries/seo";
import { keywordList, productJsonLd, urlFor } from "@/lib/seo";
import { localizedMetadata } from "@/lib/seo-server";
import { imageUrl } from "@/lib/images";
import { discountPercent, formatPrice } from "@/lib/money";
import { cn, truncate } from "@/lib/utils";

type Spec = { label: string; value: string };

// ISR: rendered on first visit, cached, and refreshed when the catalog tag is invalidated
export const revalidate = 600;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/produit/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [product, seo, locale] = await Promise.all([getProductBySlug(slug), getSeoSettings(), getLocale()]);
  if (!product) return {};
  const t = await getDictionary(locale);
  const meta = product.seo;
  const name = localName(locale, product);
  const ogKey = meta.ogImageKey ?? product.images[0]?.key;
  const fallbackDesc = truncate(fmt(t.product.metaDescription, { name: product.brand && !name.includes(product.brand.name) ? `${name} ${product.brand.name}` : name, price: formatPrice(product.price, locale) }), 160);
  // Arabic pages use the Arabic SEO fields from Admin → SEO, else Arabic fallbacks.
  return localizedMetadata({
    title: locale === "ar" ? meta.titleAr || fmt(t.product.metaTitle, { name }) : product.metaTitle ?? fmt(t.product.metaTitle, { name }),
    description: locale === "ar" ? meta.metaDescriptionAr || fallbackDesc : product.metaDescription ?? fallbackDesc,
    path: `/produit/${product.slug}`,
    canonical: meta.canonicalUrl,
    image: ogKey ? imageUrl(ogKey, 1200) : undefined,
    imageAlt: meta.ogImageKey ? undefined : (product.images[0]?.alt ?? name),
    keywords: keywordList(locale === "ar" ? meta.keywordsAr : meta.keywords),
    ogTitle: locale === "ar" ? null : meta.ogTitle,
    ogDescription: locale === "ar" ? null : meta.ogDescription,
    noIndex: meta.noindex,
    noFollow: meta.nofollow,
    seo,
  });
}

export default async function ProductPage({ params }: PageProps<"/[lang]/produit/[slug]">) {
  const { slug } = await params;
  const [product, locale] = await Promise.all([getProductBySlug(slug), getLocale()]);
  if (!product) notFound();

  const [related, settings, seo, t] = await Promise.all([getRelatedProducts(product.id, product.categoryId, product.brandId), getSettings(), getSeoSettings(), getDictionary(locale)]);
  const meta = product.seo;
  const ar = locale === "ar";
  const name = localName(locale, product);
  const specs = (Array.isArray(product.specs) ? product.specs : []) as Spec[];
  const off = discountPercent(product.price, product.compareAtPrice);
  const lowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const freeShipping = settings.freeShippingThreshold > 0 && product.price >= settings.freeShippingThreshold;
  const publicUrl = urlFor(localizePath(locale, `/produit/${product.slug}`), seo);
  const price = (c: number) => formatPrice(c, locale);
  // Arabic description when written; otherwise the French text, marked as such.
  const description = ar && meta.descriptionAr ? { text: meta.descriptionAr, lang: undefined } : product.description ? { text: product.description, lang: ar ? "fr" : undefined } : null;
  const faq = (product.faq ?? [])
    .map((f) => ({ q: ar ? f.questionAr || null : f.question, a: ar ? f.answerAr || null : f.answer }))
    .filter((f): f is { q: string; a: string } => Boolean(f.q && f.a));
  const warranty = product.warrantyMonths
    ? fmt(t.product.warranty, { duration: product.warrantyMonths % 12 === 0 ? plural(locale, product.warrantyMonths / 12, t.product.years) : plural(locale, product.warrantyMonths, t.product.months) })
    : t.product.warrantyMaker;

  const crumbs = [
    ...(product.category?.parent ? [{ name: localName(locale, product.category.parent), path: `/categorie/${product.category.parent.slug}` }] : []),
    ...(product.category ? [{ name: localName(locale, product.category), path: `/categorie/${product.category.slug}` }] : []),
    { name, path: `/produit/${product.slug}` },
  ];

  const facts = [
    { icon: Truck, label: freeShipping ? t.product.freeDelivery : t.trust.deliveryTitle, hint: freeShipping ? null : t.product.deliveryByCity },
    { icon: Wallet, label: t.product.cod, hint: t.trust.codText },
    { icon: ShieldCheck, label: warranty, hint: t.trust.warrantyTitle },
    ...(seo.returnDays > 0 ? [{ icon: RotateCcw, label: fmt(t.product.returns, { days: seo.returnDays }), hint: null }] : []),
  ];

  return (
    <div className="pb-24 lg:pb-0">
      {seo.sdProduct ? (
        <JsonLd
          data={productJsonLd(
            {
              name,
              url: meta.canonicalUrl ? urlFor(meta.canonicalUrl, seo) : publicUrl,
              sku: product.sku,
              description: (ar ? meta.descriptionAr : null) ?? product.shortDescription ?? product.description,
              price: product.price,
              stock: product.stock,
              images: product.images.map((i) => imageUrl(i.key, 1200)),
              brand: product.brand?.name,
              category: product.category ? localName(locale, product.category) : null,
              warrantyMonths: product.warrantyMonths,
              shippingFee: settings.shippingFee,
              freeShippingThreshold: settings.freeShippingThreshold,
            },
            seo,
          )}
        />
      ) : null}
      <div className="container-page space-y-6 py-5 sm:py-8">
        <Breadcrumbs items={crumbs} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <ProductGallery images={product.images.map((i) => ({ key: i.key, alt: i.alt }))} name={name} />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              {product.brand ? (
                <Link href={`/marque/${product.brand.slug}`} className="text-sm font-semibold text-primary hover:underline" title={fmt(t.product.viewBrand, { brand: product.brand.name })}>
                  {product.brand.name}
                </Link>
              ) : null}
              <h1 className="text-2xl font-bold leading-tight sm:text-[2rem]">{ar ? name : meta.h1 || name}</h1>
              <p className="text-xs text-muted-foreground">{t.product.ref} <span dir="ltr">{product.sku}</span></p>
            </div>

            <div className="space-y-1.5 border-y py-5">
              <div className="flex flex-wrap items-center gap-3">
                <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
                {off ? <span dir="ltr" className="rounded-md bg-destructive px-2 py-1 text-sm font-bold text-white">-{off}%</span> : null}
              </div>
              {off && product.compareAtPrice ? <p className="text-sm font-medium text-success">{fmt(t.product.youSave, { amount: price(product.compareAtPrice - product.price) })}</p> : null}
              <p className="text-xs text-muted-foreground">{t.product.priceTtc}</p>
            </div>

            <p className="flex items-center gap-2 text-sm font-medium">
              {product.stock <= 0 ? (
                <><CircleAlert className="size-4 text-destructive" aria-hidden /> <span className="text-destructive">{t.product.outOfStockLong}</span></>
              ) : lowStock ? (
                <><CircleAlert className="size-4 text-amber-600" aria-hidden /> <span className="text-amber-800 dark:text-amber-400">{fmt(t.product.lowStock, { count: product.stock })}</span></>
              ) : (
                <><CheckCircle2 className="size-4 text-success" aria-hidden /> <span className="text-success">{t.product.inStockReady}</span></>
              )}
            </p>

            {product.shortDescription && !ar ? <p className="text-[15px] leading-7 text-foreground/80">{product.shortDescription}</p> : null}

            <ProductBuyBox
              whatsapp={settings.whatsapp}
              url={publicUrl}
              product={{ productId: product.id, slug: product.slug, name, price: product.price, imageKey: product.images[0]?.key ?? null, maxQuantity: product.stock }}
            />

            <ul className="divide-y rounded-2xl border bg-card" aria-label={t.product.keyFacts}>
              {facts.map(({ icon: Icon, label, hint }) => (
                <li key={label} className="flex items-start gap-3 px-4 py-3.5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 text-sm">
                    <span className="block font-medium">{label}</span>
                    {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-6 pt-10 lg:gap-10", specs.length && "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]")}>
          <div className="space-y-6">
            {description ? (
              <section aria-labelledby="desc-title" className="rounded-3xl border bg-card p-6 sm:p-8">
                <h2 id="desc-title" className="mb-5 text-xl font-bold tracking-[-0.01em]">{t.product.description}</h2>
                {description.lang ? <p className="mb-3 text-xs text-muted-foreground">{t.product.frenchOnly}</p> : null}
                <div lang={description.lang} dir={description.lang ? "ltr" : undefined} className={cn(description.lang && "text-start")}>
                  <ProductDescription text={description.text} />
                </div>
              </section>
            ) : null}
            <Accordion type="multiple" defaultValue={faq.length ? ["faq"] : []} className="rounded-3xl border bg-card px-6 sm:px-8">
              {faq.length ? (
                <AccordionItem value="faq">
                  <AccordionTrigger className="text-base font-semibold">{t.product.faq}</AccordionTrigger>
                  <AccordionContent>
                    <dl className="space-y-4">
                      {faq.map((f) => (
                        <div key={f.q}>
                          <dt className="font-medium">{f.q}</dt>
                          <dd className="mt-1 whitespace-pre-line text-muted-foreground">{f.a}</dd>
                        </div>
                      ))}
                    </dl>
                  </AccordionContent>
                </AccordionItem>
              ) : null}
              <AccordionItem value="delivery" className="border-b-0">
                <AccordionTrigger className="text-base font-semibold">{t.product.deliveryPayment}</AccordionTrigger>
                <AccordionContent className="prose-store">
                  <p>{t.product.deliveryText}</p>
                  {settings.freeShippingThreshold > 0 ? <p>{fmt(t.product.deliveryFreeText, { amount: price(settings.freeShippingThreshold) })}</p> : null}
                  <p>{t.product.codText}</p>
                  <p><Link href="/livraison-retours" className="font-medium text-primary hover:underline">{t.footer.shipping}</Link></p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          {specs.length ? (
            <section aria-labelledby="specs-title" className="h-fit rounded-3xl border bg-card p-6 sm:p-8 lg:sticky lg:top-40">
              <h2 id="specs-title" className="mb-5 text-xl font-bold tracking-[-0.01em]">{t.product.specs}</h2>
              <dl className="divide-y text-sm" lang={ar ? "fr" : undefined} dir={ar ? "ltr" : undefined}>
                {specs.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-3 first:pt-0 last:pb-0">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>

      {related.length ? (
        <section className="container-page py-10">
          <h2 className="mb-7 text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">{t.product.related}</h2>
          <ProductRail products={related} />
        </section>
      ) : null}
    </div>
  );
}
