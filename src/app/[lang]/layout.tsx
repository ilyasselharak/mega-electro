import type { Metadata, Viewport } from "next";
import { Cairo, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { VercelAnalytics } from "@/components/vercel-analytics";
import { I18nProvider } from "@/i18n/client";
import { dirOf, LANG_TAG, LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { keywordList, siteBase } from "@/lib/seo";
import { getSeoSettings } from "@/server/queries/seo";
import { getStorefront } from "@/server/queries/storefront";
import { isHex } from "@/lib/storefront";
import "../globals.css";

// Inter: French text, headings and prices (one family, weights carry the hierarchy).
const body = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
// Cairo: Arabic. Declared everywhere but only downloaded on Arabic pages (not preloaded on French ones).
const arabic = Cairo({ variable: "--font-arabic", subsets: ["arabic", "latin"], display: "swap", preload: false });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Site-wide defaults, editable in Admin → SEO → Paramètres globaux. Pages override them.
export async function generateMetadata(): Promise<Metadata> {
  const [seo, locale] = await Promise.all([getSeoSettings(), getLocale()]);
  const ar = locale === "ar";
  // Arabic pages use the Arabic defaults (Admin → SEO → Global), falling back to French.
  const keywords = keywordList(ar ? seo.defaultKeywordsAr || seo.defaultKeywords : seo.defaultKeywords);
  return {
    metadataBase: new URL(siteBase(seo)),
    title: { default: (ar && seo.defaultTitleAr) || seo.defaultTitle, template: `%s | ${seo.siteName}` },
    description: (ar && seo.defaultDescriptionAr) || seo.defaultDescription,
    ...(keywords.length ? { keywords } : {}),
    applicationName: seo.siteName,
    formatDetection: { telephone: false },
    openGraph: { siteName: seo.siteName, locale: ar ? "ar_MA" : "fr_MA", type: "website" },
    robots: { index: seo.robotsIndex, follow: seo.robotsFollow },
    verification: {
      ...(seo.googleVerification ? { google: seo.googleVerification } : {}),
      ...(seo.bingVerification ? { other: { "msvalidate.01": seo.bingVerification } } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const [t, storefront] = await Promise.all([getDictionary(locale), getStorefront()]);
  // Brand colour overrides from Admin → Vitrine (validated #rrggbb only, so nothing else can be injected).
  const theme = [isHex(storefront.theme?.accent) ? `--orange:${storefront.theme.accent};` : "", isHex(storefront.theme?.navy) ? `--navy:${storefront.theme.navy};` : ""].join("");
  return (
    <html lang={LANG_TAG[locale]} dir={dirOf(locale)} className={`${body.variable} ${arabic.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground flex flex-col">
        {theme ? <style>{`:root{${theme}}`}</style> : null}
        <I18nProvider locale={locale} t={t}>
          <Providers>{children}</Providers>
        </I18nProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
