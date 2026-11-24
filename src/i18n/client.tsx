"use client";

import { createContext, useContext } from "react";
import NextLink from "next/link";
import type { Dictionary } from "./dictionaries/fr";
import { localizePath, type Locale } from "./config";

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

export function I18nProvider({ locale, t, children }: { locale: Locale; t: Dictionary; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside I18nProvider");
  return ctx;
}

/** next/link that prefixes the current locale ("/produit/x" → "/ar/produit/x" in Arabic). */
export function Link({ href, ...props }: Omit<React.ComponentProps<typeof NextLink>, "href"> & { href: string }) {
  const { locale } = useI18n();
  return <NextLink href={localizePath(locale, href)} {...props} />;
}

/** Localizes a path for router.push/replace: lp("/commande") → "/ar/commande" in Arabic. */
export function useLocalePath() {
  const { locale } = useI18n();
  return (path: string) => localizePath(locale, path);
}
