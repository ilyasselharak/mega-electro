"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid, ProductRail } from "@/components/store/product-card";
import { useRecentlyViewed, useWishlist } from "@/hooks/use-saved-products";
import { useMounted } from "@/hooks/use-mounted";
import { Link, useI18n } from "@/i18n/client";
import type { ProductCard } from "@convex/lib/products";

/** Current catalog data for saved ids, kept in the saved order (removed products drop out). */
function useCards(ids: string[]) {
  return useQuery({
    queryKey: ["cards", ids.join(",")],
    enabled: ids.length > 0,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/products?ids=${ids.join(",")}`, { signal });
      const items = ((await res.json()) as { items: ProductCard[] }).items;
      const byId = new Map(items.map((p) => [p.id, p]));
      return ids.map((id) => byId.get(id)).filter((p): p is ProductCard => Boolean(p));
    },
  });
}

/** Records a product page view (ids only, in this browser). */
export function TrackRecentlyViewed({ productId }: { productId: string }) {
  const push = useRecentlyViewed((s) => s.push);
  useEffect(() => push(productId), [productId, push]);
  return null;
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { t } = useI18n();
  const mounted = useMounted();
  const all = useRecentlyViewed((s) => s.ids);
  const ids = mounted ? all.filter((id) => id !== excludeId).slice(0, 8) : [];
  const { data } = useCards(ids);
  if (!data?.length) return null;
  return (
    <section className="container-page py-8 sm:py-10" aria-labelledby="recent-title">
      <h2 id="recent-title" className="mb-5 text-[1.375rem] font-extrabold tracking-[-0.025em] sm:text-[1.75rem]">{t.recent.title}</h2>
      <ProductRail products={data} />
    </section>
  );
}

export function WishlistProducts() {
  const { t } = useI18n();
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const { data, isLoading } = useCards(mounted ? ids : []);
  if (!mounted || (ids.length && isLoading)) {
    return <div className="h-72 animate-pulse rounded-2xl bg-card" aria-busy="true" aria-label={t.common.loading} />;
  }
  if (!ids.length || !data?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-16 text-center shadow-card ring-1 ring-border/70">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-orange-strong"><Heart className="size-6" aria-hidden /></span>
        <p className="text-lg font-bold">{t.wishlist.empty}</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">{t.wishlist.emptyText}</p>
        <Button asChild className="mt-2 h-12 rounded-xl px-6 font-bold"><Link href="/recherche">{t.home.heroShop}</Link></Button>
      </div>
    );
  }
  return (
    <>
      <p className="text-sm text-muted-foreground">{t.wishlist.intro}</p>
      <ProductGrid products={data} wide />
    </>
  );
}
