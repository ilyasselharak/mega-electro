import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPagination({ page, pageCount, total, basePath, params }: { page: number; pageCount: number; total: number; basePath: string; params: Record<string, string | undefined> }) {
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    return `${basePath}${sp.size ? `?${sp}` : ""}`;
  };
  return (
    <div className="flex items-center justify-between gap-4 pt-4 text-sm text-muted-foreground">
      <span>{total} résultat{total > 1 ? "s" : ""}</span>
      {pageCount > 1 ? (
        <div className="flex items-center gap-2">
          <Button asChild={page > 1} variant="outline" size="icon" disabled={page <= 1}>
            {page > 1 ? <Link href={href(page - 1)} aria-label="Page précédente"><ChevronLeft /></Link> : <ChevronLeft />}
          </Button>
          <span>Page {page} / {pageCount}</span>
          <Button asChild={page < pageCount} variant="outline" size="icon" disabled={page >= pageCount}>
            {page < pageCount ? <Link href={href(page + 1)} aria-label="Page suivante"><ChevronRight /></Link> : <ChevronRight />}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
