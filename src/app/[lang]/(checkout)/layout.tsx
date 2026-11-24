import { Lock, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitch } from "@/components/store/language-switch";
import { Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";
import { getSettings } from "@/server/queries/settings";

/** Distraction-free checkout layout (no menus) to maximise conversion. */
export default async function CheckoutLayout({ children }: LayoutProps<"/[lang]">) {
  const [settings, t] = await Promise.all([getSettings(), getDictionary()]);
  return (
    <>
      <header className="border-b bg-card">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hidden items-center gap-1.5 hover:text-foreground sm:flex" dir="ltr"><Phone className="size-4" aria-hidden />{settings.phone}</a>
            <span className="hidden items-center gap-1.5 sm:flex"><Lock className="size-4" aria-hidden /> {t.checkout.secureOrder}</span>
            <LanguageSwitch className="hover:text-foreground" />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <Link href="/conditions-generales" className="hover:underline">{t.footer.terms}</Link>
        <span aria-hidden> — </span>
        <Link href="/confidentialite" className="hover:underline">{t.footer.privacy}</Link>
      </footer>
    </>
  );
}
