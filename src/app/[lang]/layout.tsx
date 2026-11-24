import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Noto_Kufi_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import { I18nProvider } from "@/i18n/client";
import { dirOf, LANG_TAG, LOCALES } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { keywordList, siteBase } from "@/lib/seo";
import { getSeoSettings } from "@/server/queries/seo";
import "../globals.css";

// Bricolage Grotesque: headlines and prices (technical, characterful). Instrument Sans: body.
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap", weight: ["500", "600", "700", "800"] });
const body = Instrument_Sans({ variable: "--font-body", subsets: ["latin"], display: "swap" });
// Arabic face: declared everywhere but only downloaded on Arabic pages (not preloaded on French ones).
const arabic = Noto_Kufi_Arabic({ variable: "--font-arabic", subsets: ["arabic"], display: "swap", weight: ["400", "500", "600", "700"], preload: false });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Site-wide defaults, editable in Admin → SEO → Paramètres globaux. Pages override them.
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const keywords = keywordList(seo.defaultKeywords);
  return {
    metadataBase: new URL(siteBase(seo)),
    title: { default: seo.defaultTitle, template: `%s | ${seo.siteName}` },
    description: seo.defaultDescription,
    ...(keywords.length ? { keywords } : {}),
    applicationName: seo.siteName,
    formatDetection: { telephone: false },
    openGraph: { siteName: seo.siteName, locale: "fr_MA", type: "website" },
    robots: { index: seo.robotsIndex, follow: seo.robotsFollow },
    verification: {
      ...(seo.googleVerification ? { google: seo.googleVerification } : {}),
      ...(seo.bingVerification ? { other: { "msvalidate.01": seo.bingVerification } } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1a3a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  return (
    <html lang={LANG_TAG[locale]} dir={dirOf(locale)} className={`${display.variable} ${body.variable} ${arabic.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <I18nProvider locale={locale} t={t}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
