import { ChevronDown, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { SearchBox } from "@/components/store/search-box";
import { CartButton, CartSheet } from "@/components/store/cart-sheet";
import { MobileMenu } from "@/components/store/mobile-menu";
import { AccountButton } from "@/components/store/account-button";
import { LanguageSwitch } from "@/components/store/language-switch";
import { Link } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatPrice } from "@/lib/money";
import { getNavCategories } from "@/server/queries/catalog";
import { getSettings } from "@/server/queries/settings";

export async function Header() {
  const [categories, settings, locale] = await Promise.all([getNavCategories(), getSettings(), getLocale()]);
  const t = await getDictionary(locale);
  // The announcement is written in French in Settings; Arabic shows the equivalent store promise.
  const announcement =
    locale === "fr"
      ? settings.announcement
      : `${fmt(t.home.heroNoteFree, { amount: formatPrice(settings.freeShippingThreshold, locale) })} — ${t.trust.codTitle}`;
  const nav = categories.map((c) => ({ ...c, label: localName(locale, c), children: c.children.map((s) => ({ ...s, label: localName(locale, s) })) }));

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <p className="truncate font-medium">{announcement}</p>
          <div className="flex shrink-0 items-center gap-5">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hidden items-center gap-1.5 opacity-90 hover:opacity-100 sm:flex" dir="ltr">
              <Phone className="size-3.5" aria-hidden /> {settings.phone}
            </a>
            <LanguageSwitch className="opacity-90 hover:opacity-100" />
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
        <div className="container-page flex h-16 items-center gap-3 lg:h-[76px] lg:gap-10">
          <MobileMenu categories={nav.map((c) => ({ id: c.id, slug: c.slug, icon: c.icon, label: c.label, children: c.children.map((s) => ({ id: s.id, slug: s.slug, label: s.label })) }))} phone={settings.phone} />
          <Logo className="shrink-0" />
          <SearchBox className="hidden max-w-2xl flex-1 md:block" />
          <div className="ms-auto flex items-center gap-1">
            <AccountButton />
            <CartButton />
          </div>
        </div>
        <div className="container-page pb-3 md:hidden">
          <SearchBox />
        </div>
        <nav aria-label={t.header.categories} className="hidden border-t lg:block">
          <ul className="container-page flex h-12 items-center gap-1">
            {nav.map((c) => (
              <li key={c.id} className="group relative">
                <Link href={`/categorie/${c.slug}`} className="flex h-12 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground">
                  {c.label}
                  {c.children.length ? <ChevronDown className="size-3.5 opacity-50 transition-transform group-hover:rotate-180" aria-hidden /> : null}
                </Link>
                {c.children.length ? (
                  <div className="invisible absolute start-0 top-full z-50 min-w-64 rounded-2xl border bg-popover p-2 opacity-0 shadow-[0_24px_48px_-20px_rgb(11_26_58/0.25)] transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {c.children.map((sub) => (
                      <Link key={sub.id} href={`/categorie/${sub.slug}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">
                        {sub.label}
                      </Link>
                    ))}
                    <Link href={`/categorie/${c.slug}`} className="mt-1 block rounded-lg border-t px-3 pb-2 pt-2.5 text-sm font-medium text-primary hover:bg-muted">
                      {fmt(t.header.viewCategory, { name: c.label })}
                    </Link>
                  </div>
                ) : null}
              </li>
            ))}
            <li className="ms-auto">
              <Link href="/promotions" className="flex h-12 items-center rounded-md px-3 text-sm font-semibold text-destructive hover:opacity-80">
                {t.header.promotions}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <CartSheet freeShippingThreshold={settings.freeShippingThreshold} whatsapp={settings.whatsapp} />
    </>
  );
}
