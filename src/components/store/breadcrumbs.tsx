import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { Link } from "@/i18n/client";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getSeoSettings } from "@/server/queries/seo";

/** Paths are unlocalized ("/categorie/x"); links and JSON-LD get the current locale's URL. */
export async function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const [seo, locale] = await Promise.all([getSeoSettings(), getLocale()]);
  const t = await getDictionary(locale);
  const all = [{ name: t.common.home, path: "/" }, ...items];
  return (
    <>
      {seo.sdBreadcrumbs ? <JsonLd data={breadcrumbJsonLd(all.map((it) => ({ ...it, path: localizePath(locale, it.path) })), seo)} /> : null}
      <nav aria-label={locale === "ar" ? "مسار التنقل" : "Fil d'Ariane"} className="overflow-x-auto scrollbar-none">
        <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRight className="size-3.5 opacity-60 rtl:-scale-x-100" aria-hidden /> : null}
              {i === all.length - 1 ? (
                <span aria-current="page" className="max-w-[60vw] truncate font-medium text-foreground">{it.name}</span>
              ) : (
                <Link href={it.path} className="hover:text-foreground">{it.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
