"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { quoteCart } from "@/server/actions/checkout";
import { useCart } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";

/** Server-validated prices, stock and shipping for the current cart. Keeps the local cart in sync. */
export function useCartQuote(city = "") {
  const lines = useCart((s) => s.lines);
  const sync = useCart((s) => s.sync);
  const mounted = useMounted();
  const items = lines.map((l) => ({ productId: l.productId, quantity: l.quantity }));

  const query = useQuery({
    queryKey: ["cart-quote", items, city],
    queryFn: () => quoteCart(items, city),
    enabled: mounted && items.length > 0,
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    const q = query.data;
    if (!q) return;
    const needsSync =
      q.removedIds.length > 0 ||
      q.lines.some((l) => {
        const local = lines.find((x) => x.productId === l.productId);
        return local && (local.price !== l.price || local.maxQuantity !== l.stock || local.quantity > l.stock);
      });
    if (needsSync) sync(q.lines.map((l) => ({ productId: l.productId, price: l.price, maxQuantity: l.stock, name: l.name })), q.removedIds);
  }, [query.data, lines, sync]);

  return { ...query, mounted, isEmpty: mounted && lines.length === 0 };
}
