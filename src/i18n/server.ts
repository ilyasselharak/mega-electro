import "server-only";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale, type Locale } from "./config";
import { fr } from "./dictionaries/fr";
import { ar } from "./dictionaries/ar";

const DICTS = { fr, ar } as const;

/** Current locale from the [lang] root segment (any Server Component, no prop drilling). */
export async function getLocale(): Promise<Locale> {
  const l = await lang();
  if (!isLocale(l)) notFound();
  return l;
}

export async function getDictionary(locale?: Locale) {
  return DICTS[locale ?? (await getLocale())];
}
