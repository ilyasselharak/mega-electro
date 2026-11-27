import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { BottomNav } from "@/components/store/bottom-nav";
import { JsonLd } from "@/components/shared/json-ld";
import { getDictionary } from "@/i18n/server";
import { getSettings } from "@/server/queries/settings";
import { getSeoSettings } from "@/server/queries/seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function StoreLayout({ children }: LayoutProps<"/[lang]">) {
  const [settings, seo, t] = await Promise.all([getSettings(), getSeoSettings(), getDictionary()]);
  const graph = [...(seo.sdOrganization ? [organizationJsonLd(settings, seo)] : []), ...(seo.sdWebsite ? [websiteJsonLd(seo)] : [])];
  return (
    <>
      {graph.length ? <JsonLd data={graph} /> : null}
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2">
        {t.common.skipToContent}
      </a>
      <Header />
      <main id="contenu" className="flex-1">{children}</main>
      <Footer />
      {/* Spacer so the footer is never hidden behind the mobile bottom navigation. */}
      <div className="pb-bottom-nav lg:hidden [body:has(.has-sticky-cta)_&]:hidden" aria-hidden />
      <BottomNav />
      <WhatsAppButton number={settings.whatsapp} message={t.home.whatsappGreeting} label={t.footer.whatsapp} />
    </>
  );
}
