import { ChevronDown, Headset, Mail, MapPin, Phone, ShieldCheck, Truck, Wallet } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitch } from "@/components/store/language-switch";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { Link } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatPrice } from "@/lib/money";
import { getNavCategories } from "@/server/queries/catalog";
import { getSettings } from "@/server/queries/settings";

/** Store promises, built only from real settings (free-shipping threshold, cash on delivery). */
export async function TrustBar({ freeShippingThreshold, className }: { freeShippingThreshold: number; className?: string }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const items = [
    { icon: Truck, title: t.trust.deliveryTitle, text: freeShippingThreshold > 0 ? fmt(t.trust.deliveryFree, { amount: formatPrice(freeShippingThreshold, locale) }) : t.trust.deliveryPaid },
    { icon: Wallet, title: t.trust.codTitle, text: t.trust.codText },
    { icon: ShieldCheck, title: t.trust.warrantyTitle, text: t.trust.warrantyText },
    { icon: Headset, title: t.trust.supportTitle, text: t.trust.supportText },
  ];
  return (
    <ul className={`grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4 ${className ?? ""}`}>
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-orange-strong"><Icon className="size-5" strokeWidth={1.9} aria-hidden /></span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5">{title}</span>
            <span className="block text-xs leading-5 text-muted-foreground">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  // Collapsed <details> on mobile (short footer); plain open column from md up.
  return (
    <>
      <details className="group border-b border-white/10 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-white/60 [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="pb-5">{children}</div>
      </details>
      <div className="hidden md:block">
        <h2 className="mb-4 text-sm font-semibold text-white/60">{title}</h2>
        {children}
      </div>
    </>
  );
}

export async function Footer() {
  const [settings, categories, locale] = await Promise.all([getSettings(), getNavCategories(), getLocale()]);
  const t = await getDictionary(locale);
  const year = new Date().getFullYear();
  const link = "opacity-80 transition-opacity hover:opacity-100";
  return (
    <footer className="mt-10 bg-ink text-ink-foreground">
      <div className="container-page grid gap-x-10 py-10 md:grid-cols-2 md:gap-y-10 md:py-14 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div className="space-y-4 pb-6 md:pb-0">
          <Logo tone="inverse" />
          <p className="max-w-xs text-sm opacity-80">{locale === "fr" ? settings.tagline : t.trust.deliveryTitle}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {settings.facebookUrl ? <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className={link}>Facebook</a> : null}
            {settings.instagramUrl ? <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className={link}>Instagram</a> : null}
            {settings.tiktokUrl ? <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className={link}>TikTok</a> : null}
          </div>
        </div>
        <Column title={t.header.categories}>
          <ul className="space-y-2.5 text-sm">
            {categories.slice(0, 10).map((c) => (
              <li key={c.id}><Link href={`/categorie/${c.slug}`} className={link}>{localName(locale, c)}</Link></li>
            ))}
          </ul>
        </Column>
        <Column title={t.footer.help}>
          <ul className="space-y-2.5 text-sm">
            {[
              ["/suivi-commande", t.footer.trackOrder],
              ["/favoris", t.wishlist.title],
              ["/promotions", t.header.promotions],
              ["/livraison-retours", t.footer.shipping],
              ["/a-propos", t.footer.about],
              ["/contact", t.footer.contactPage],
              ["/conditions-generales", t.footer.terms],
              ["/confidentialite", t.footer.privacy],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className={link}>{label}</Link></li>
            ))}
          </ul>
        </Column>
        <Column title={t.footer.contact}>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden /><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className={link} dir="ltr">{settings.phone}</a></li>
            <li className="flex gap-2.5"><WhatsAppIcon className="mt-0.5 size-4 shrink-0 opacity-70" /><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className={link}>{t.footer.whatsapp}</a></li>
            <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden /><a href={`mailto:${settings.email}`} className={link}>{settings.email}</a></li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden /><span className="opacity-80">{settings.address}</span></li>
          </ul>
        </Column>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs opacity-75 sm:flex-row">
          <p>© {year} {settings.storeName}. {t.footer.rights}</p>
          <div className="flex items-center gap-5">
            <p>{t.footer.pricesNote}</p>
            <LanguageSwitch withIcon={false} className="underline-offset-4 hover:underline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
