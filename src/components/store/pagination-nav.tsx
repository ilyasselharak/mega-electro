import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";
import { getDictionary } from "@/i18n/server";
import { cn } from "@/lib/utils";

/** Crawlable pagination with real <a href> links (page 1 has no ?page parameter). */
export async function PaginationNav({ page, pageCount, basePath, searchParams }: { page: number; pageCount: number; basePath: string; searchParams: Record<string, string | string[] | undefined> }) {
  if (pageCount <= 1) return null;
  const t = await getDictionary();
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === "string" && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    return `${basePath}${sp.size ? `?${sp}` : ""}`;
  };
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  const btn = "flex size-11 items-center justify-center rounded-full text-sm font-medium";
  return (
    <nav aria-label={t.listing.pagination} className="flex items-center justify-center gap-1.5 pt-4">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={cn(btn, "border bg-card hover:bg-muted")} aria-label={t.listing.prevPage}>
          <ChevronLeft className="size-4 rtl:-scale-x-100" />
        </Link>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-muted-foreground" aria-hidden>…</span> : null}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={fmt(t.listing.page, { n: p })}
            className={cn(btn, "tabular-nums", p === page ? "bg-primary text-primary-foreground" : "border bg-card hover:bg-muted")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" className={cn(btn, "border bg-card hover:bg-muted")} aria-label={t.listing.nextPage}>
          <ChevronRight className="size-4 rtl:-scale-x-100" />
        </Link>
      ) : null}
    </nav>
  );
}
