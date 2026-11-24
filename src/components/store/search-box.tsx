"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useI18n } from "@/i18n/client";
import { localizePath } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";

type Suggestion = { id: string; name: string; href: string; brand: string | null; price: string; image: string | null };

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function SearchBox({ className, autoFocus, onNavigate }: { className?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);
  const debounced = useDebounced(q.trim(), 200);

  const { data, isFetching } = useQuery({
    queryKey: ["search", locale, debounced],
    enabled: debounced.length >= 2,
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}&lang=${locale}`, { signal });
      return ((await res.json()) as { items: Suggestion[] }).items;
    },
  });
  const items = debounced.length >= 2 ? (data ?? []) : [];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(localizePath(locale, href));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(items[active].href);
    if (q.trim()) go(`/recherche?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div ref={wrapper} className={cn("relative", className)}>
      <form role="search" onSubmit={onSubmit} className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          name="q"
          value={q}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          placeholder={t.header.searchPlaceholder}
          aria-label={t.header.searchLabel}
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          className="h-11 w-full rounded-full border border-input bg-background ps-10 pe-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-3 focus:ring-ring/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {isFetching ? (
          <Loader2 className="absolute end-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : q ? (
          <button type="button" onClick={() => setQ("")} className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label={t.header.clearSearch}>
            <X className="size-4" />
          </button>
        ) : null}
      </form>
      {open && items.length > 0 ? (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-xl">
          {items.map((it, i) => (
            <li key={it.id} role="option" aria-selected={i === active}>
              <Link
                href={it.href}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={cn("flex items-center gap-3 rounded-xl p-2 hover:bg-muted", i === active && "bg-muted")}
              >
                <span className="size-11 shrink-0 overflow-hidden rounded-lg border bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.image ? <img src={it.image} alt="" className="size-full object-contain p-0.5" loading="lazy" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium">{it.name}</span>
                  {it.brand ? <span className="text-xs text-muted-foreground">{it.brand}</span> : null}
                </span>
                <span className="text-sm font-semibold tabular-nums">{it.price}</span>
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => go(`/recherche?q=${encodeURIComponent(q.trim())}`)} className="w-full rounded-xl p-2.5 text-center text-sm font-medium text-primary hover:bg-muted">
              {fmt(t.header.seeAllResults, { q: q.trim() })}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
