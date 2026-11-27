"use client";

import { useId, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, useI18n } from "@/i18n/client";
import { plural } from "@/i18n/fmt";
import type { ListingResult } from "@/server/queries/catalog";

const SORTS = ["pertinence", "meilleures-ventes", "nouveautes", "prix-asc", "prix-desc"] as const;
const FILTER_KEYS = ["marque", "min", "max", "stock", "promo"] as const;

function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    // Any filter/sort change goes back to page 1.
    if (!("page" in changes)) next.delete("page");
    startTransition(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }
  return { sp, update, pending };
}

function FilterPanel({ facets }: { facets: ListingResult["facets"] }) {
  const { t } = useI18n();
  const { sp, update } = useUrlState();
  const selectedBrands = (sp.get("marque") ?? "").split(",").filter(Boolean);
  const [min, setMin] = useState(sp.get("min") ?? "");
  const [max, setMax] = useState(sp.get("max") ?? "");
  const id = useId();

  function toggleBrand(slug: string, checked: boolean) {
    const set = new Set(selectedBrands);
    if (checked) set.add(slug);
    else set.delete(slug);
    update({ marque: [...set].join(",") || null });
  }

  return (
    <div className="divide-y">
      <div role="group" aria-labelledby={`${id}-1`} className="space-y-3.5 pb-6">
        <h3 id={`${id}-1`} className="mb-3.5 text-sm font-semibold">{t.listing.availability}</h3>
        <label className="flex min-h-8 items-center justify-between gap-3 text-sm">
          {t.listing.inStockOnly}
          <Switch checked={sp.get("stock") === "1"} onCheckedChange={(v) => update({ stock: v ? "1" : null })} />
        </label>
        <label className="flex min-h-8 items-center justify-between gap-3 text-sm">
          {t.listing.onSale}
          <Switch checked={sp.get("promo") === "1"} onCheckedChange={(v) => update({ promo: v ? "1" : null })} />
        </label>
      </div>

      <div role="group" aria-labelledby={`${id}-2`} className="py-6">
        <h3 id={`${id}-2`} className="mb-3 text-sm font-semibold">{t.listing.price}</h3>
        <form
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: min || null, max: max || null });
          }}
        >
          <Input inputMode="numeric" dir="ltr" placeholder={String(Math.floor(facets.minPrice / 100))} value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} aria-label={t.listing.min} className="h-10 min-w-0" />
          <span className="text-muted-foreground" aria-hidden>–</span>
          <Input inputMode="numeric" dir="ltr" placeholder={String(Math.ceil(facets.maxPrice / 100))} value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} aria-label={t.listing.max} className="h-10 min-w-0" />
          <Button type="submit" variant="outline" className="col-span-3 h-10">{t.listing.apply}</Button>
        </form>
      </div>

      {facets.brands.length ? (
        <div role="group" aria-labelledby={`${id}-3`} className="pt-6">
        <h3 id={`${id}-3`} className="mb-3 text-sm font-semibold">{t.listing.brands}</h3>
          <ul className="max-h-80 space-y-0.5 overflow-y-auto pe-1">
            {facets.brands.map((b) => (
              <li key={b.id}>
                <Label className="flex min-h-9 cursor-pointer items-center gap-2.5 font-normal">
                  <Checkbox checked={selectedBrands.includes(b.slug)} onCheckedChange={(v) => toggleBrand(b.slug, v === true)} />
                  <span className="flex-1 capitalize">{b.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{b.count}</span>
                </Label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ListingToolbar({ total, facets }: { total: number; facets: ListingResult["facets"] }) {
  const { t, locale } = useI18n();
  const { sp, update, pending } = useUrlState();
  const activeCount = FILTER_KEYS.filter((k) => sp.get(k)).length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="price flex items-center gap-2 text-sm font-medium text-muted-foreground" aria-live="polite">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {plural(locale, total, t.listing.resultCount)}
      </p>
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl px-4 lg:hidden">
              <SlidersHorizontal /> {t.listing.filters}
              {activeCount ? <span className="ms-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">{activeCount}</span> : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="flex max-h-[88dvh] flex-col gap-0 rounded-t-3xl p-0">
            <SheetHeader className="border-b px-5 py-4">
              <SheetTitle>{t.listing.filters}</SheetTitle>
              <SheetDescription className="sr-only">{t.listing.filterResults}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-5 py-5"><FilterPanel facets={facets} /></div>
            <SheetFooter className="flex-row gap-2 border-t p-4">
              {activeCount ? (
                <Button variant="ghost" className="h-12 rounded-xl" onClick={() => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}>{t.listing.clearAll}</Button>
              ) : null}
              <SheetClose asChild>
                <Button className="h-12 flex-1 rounded-xl text-base">{pending ? <Loader2 className="animate-spin" /> : null} {plural(locale, total, t.listing.showResults)}</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Select value={sp.get("tri") ?? "pertinence"} onValueChange={(v) => update({ tri: v === "pertinence" ? null : v })} dir={locale === "ar" ? "rtl" : "ltr"}>
          <SelectTrigger className="h-11 w-auto min-w-40 rounded-xl bg-card" aria-label={t.listing.sortBy}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {SORTS.map((v) => <SelectItem key={v} value={v}>{t.listing.sort[v]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function ListingSidebar({ facets }: { facets: ListingResult["facets"] }) {
  const { t } = useI18n();
  return (
    <aside className="hidden lg:block" aria-label={t.listing.filters}>
      <div className="sticky top-40 rounded-xl bg-card p-5 shadow-card ring-1 ring-border/70"><FilterPanel facets={facets} /></div>
    </aside>
  );
}

export function ActiveFilters({ brands }: { brands: { slug: string; name: string }[] }) {
  const { t } = useI18n();
  const { sp, update } = useUrlState();
  const chips: { label: string; clear: Record<string, string | null> }[] = [];
  const selected = (sp.get("marque") ?? "").split(",").filter(Boolean);
  for (const slug of selected) {
    chips.push({ label: brands.find((b) => b.slug === slug)?.name ?? slug, clear: { marque: selected.filter((s) => s !== slug).join(",") || null } });
  }
  if (sp.get("min") || sp.get("max")) chips.push({ label: `${sp.get("min") ?? "0"} – ${sp.get("max") ?? "∞"} ${t.common.currency}`, clear: { min: null, max: null } });
  if (sp.get("stock")) chips.push({ label: t.listing.inStockOnly, clear: { stock: null } });
  if (sp.get("promo")) chips.push({ label: t.listing.onSale, clear: { promo: null } });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button key={c.label} type="button" onClick={() => update(c.clear)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-medium hover:bg-muted" aria-label={`${c.label} — ${t.common.close}`}>
          {c.label} <X className="size-3" aria-hidden />
        </button>
      ))}
      <button type="button" onClick={() => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))} className="h-8 px-1 text-xs font-medium text-orange-strong hover:underline">
        {t.listing.clearAll}
      </button>
    </div>
  );
}

/** Empty results: offer a way back instead of a dead end. */
export function EmptyResults({ basePath }: { basePath: string }) {
  const { t } = useI18n();
  const { sp, update } = useUrlState();
  const filtered = FILTER_KEYS.some((k) => sp.get(k));
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <p className="font-semibold">{t.listing.empty}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{t.listing.emptyHint}</p>
      {filtered ? (
        <Button variant="outline" className="mt-2 rounded-full" onClick={() => update(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}>{t.listing.resetFilters}</Button>
      ) : basePath !== "/recherche" ? (
        <Button asChild variant="outline" className="mt-2 rounded-full"><Link href="/recherche">{t.listing.browseAll}</Link></Button>
      ) : null}
    </div>
  );
}
