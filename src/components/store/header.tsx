import { Package, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SearchBox } from "@/components/store/search-box";
import { CartButton, CartSheet } from "@/components/store/cart-sheet";
import { MobileMenu } from "@/components/store/mobile-menu";
import { AccountButton } from "@/components/store/account-button";
import { LanguageSwitch } from "@/components/store/language-switch";
import { WishlistLink } from "@/components/store/header-actions";
import { MegaMenu } from "@/components/store/mega-menu";
import { Link } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatPrice } from "@/lib/money";
import { getNavCategories } from "@/server/queries/catalog";
import { getSettings } from "@/server/queries/settings";
import { getCategoryCovers } from "@/server/queries/storefront";

export async function Header() {
  const [categories, covers, settings, locale] = await Promise.all([getNavCategories(), getCategoryCovers(), getSettings(), getLocale()]);
  const t = await getDictionary(locale);
  // The announcement is written in French in Settings; Arabic shows the equivalent store promise, built from real settings.
  const promise = [settings.freeShippingThreshold > 0 ? fmt(t.home.heroNoteFree, { amount: formatPrice(settings.freeShippingThreshold, locale) }) : null, settings.codEnabled ? t.trust.codTitle : null]
    .filter(Boolean)
    .join(" — ");
  const announcement = locale === "fr" ? settings.announcement || promise : promise;
  const nav = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    icon: c.icon,
    label: localName(locale, c),
    count: c._count.products,
    cover: covers[c.id] ?? null,
    children: c.children.map((s) => ({ id: s.id, slug: s.slug, label: localName(locale, s) })),
  }));

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <p className="truncate font-medium">{announcement}</p>
          <div className="flex shrink-0 items-center gap-5">
            <Link href="/suivi-commande" className="hidden items-center gap-1.5 opacity-85 hover:opacity-100 md:flex">
              <Package className="size-3.5" aria-hidden /> {t.header.trackOrder}
            </Link>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hidden items-center gap-1.5 opacity-85 hover:opacity-100 sm:flex" dir="ltr">
              <Phone className="size-3.5" aria-hidden /> {settings.phone}
            </a>
            <LanguageSwitch className="opacity-85 hover:opacity-100" />
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-card shadow-[0_1px_0_var(--border)]">
        <div className="container-page flex h-16 items-center gap-2 lg:h-20 lg:gap-8">
          <MobileMenu categories={nav} phone={settings.phone} />
          <Logo className="shrink-0" />
          <SearchBox id="site-search" className="hidden max-w-3xl flex-1 md:block" />
          <div className="ms-auto flex items-center gap-0.5">
            <AccountButton />
            <WishlistLink />
            <CartButton />
          </div>
        </div>
        <div className="container-page pb-3 md:hidden">
          <SearchBox id="site-search-mobile" />
        </div>
        <MegaMenu categories={nav} t={t} locale={locale} />
      </header>
      <CartSheet freeShippingThreshold={settings.freeShippingThreshold} whatsapp={settings.whatsapp} />
    </>
  );
}
