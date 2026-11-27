import { ChevronDown, LayoutGrid } from "lucide-react";
import { StoreImage } from "@/components/shared/store-image";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Link } from "@/i18n/client";
import { fmt, plural } from "@/i18n/fmt";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";

export type MegaCategory = {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
  count: number;
  cover: { key: string; alt: string | null } | null;
  children: { id: string; slug: string; label: string }[];
};

const panel =
  "invisible absolute inset-x-0 top-full z-50 border-t bg-popover opacity-0 shadow-[0_24px_48px_-24px_rgb(15_23_42/0.35)] transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100";

/**
 * Desktop mega menu, CSS only (hover and keyboard focus-within): no JavaScript shipped.
 * "All categories" opens a photo grid; each category opens its subcategories beside its photo.
 */
export function MegaMenu({ categories, t, locale }: { categories: MegaCategory[]; t: Dictionary; locale: Locale }) {
  return (
    <nav aria-label={t.header.categories} className="relative hidden border-t bg-card lg:block">
      <ul className="container-page flex h-12 items-center gap-0.5">
        <li className="group">
          <button type="button" className="me-2 flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-3.5 text-sm font-semibold text-background" aria-haspopup="true">
            <LayoutGrid className="size-4" aria-hidden /> {t.header.allCategories}
          </button>
          <div className={panel}>
            <ul className="container-page grid grid-cols-4 gap-3 py-6 xl:grid-cols-6">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/categorie/${c.slug}`} className="flex h-full flex-col rounded-xl border bg-card p-3 transition-colors hover:border-foreground/25">
                    <span className="relative flex aspect-[4/3] items-center justify-center rounded-lg bg-white">
                      {c.cover ? <StoreImage imageKey={c.cover.key} alt={c.cover.alt ?? c.label} fill sizes="180px" className="object-contain p-2" /> : <CategoryIcon name={c.icon} className="size-9 text-muted-foreground" />}
                    </span>
                    <span className="mt-2.5 text-sm font-semibold leading-tight">{c.label}</span>
                    <span className="price text-xs text-muted-foreground">{plural(locale, c.count, t.home.categoryCount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
        {categories.map((c) => (
          <li key={c.id} className="group">
            <Link href={`/categorie/${c.slug}`} className="flex h-12 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground xl:px-3">
              {c.label}
              {c.children.length ? <ChevronDown className="size-3.5 opacity-50" aria-hidden /> : null}
            </Link>
            {c.children.length ? (
              <div className={panel}>
                <div className="container-page grid grid-cols-[minmax(0,1fr)_280px] gap-10 py-7">
                  <div>
                    <p className="mb-3 text-base font-bold">{c.label}</p>
                    <ul className="grid grid-cols-3 gap-x-6 gap-y-1">
                      {c.children.map((sub) => (
                        <li key={sub.id}>
                          <Link href={`/categorie/${sub.slug}`} className="block rounded-md py-1.5 text-sm text-foreground/80 hover:text-foreground hover:underline">
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/categorie/${c.slug}`} className="mt-4 inline-block text-sm font-semibold text-orange-strong hover:underline">
                      {fmt(t.header.viewCategory, { name: c.label })}
                    </Link>
                  </div>
                  {c.cover ? (
                    <Link href={`/categorie/${c.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-xl border bg-white" tabIndex={-1} aria-hidden>
                      <StoreImage imageKey={c.cover.key} alt="" fill sizes="280px" className="object-contain p-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </li>
        ))}
        <li className="ms-auto">
          <Link href="/promotions" className="flex h-12 items-center whitespace-nowrap px-3 text-sm font-semibold text-orange-strong hover:underline">
            {t.header.promotions}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
