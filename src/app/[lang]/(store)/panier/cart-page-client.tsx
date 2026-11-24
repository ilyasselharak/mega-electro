"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreImage } from "@/components/shared/store-image";
import { FreeShippingProgress, QuantityStepper, useWhatsAppCartLink } from "@/components/store/cart-sheet";
import { usePrice } from "@/components/store/price";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { useCart } from "@/hooks/use-cart";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { Link, useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";

export function CartPageClient({ whatsapp, freeShippingThreshold }: { whatsapp: string; freeShippingThreshold: number }) {
  const { t } = useI18n();
  const price = usePrice();
  const { lines, setQuantity, remove } = useCart();
  const { data: quote, isEmpty, mounted } = useCartQuote();
  const waLink = useWhatsAppCartLink(whatsapp);

  if (!mounted) return <div className="h-64" aria-busy />;
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border bg-card p-12 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-lg font-semibold">{t.cart.empty}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t.cart.emptyText}</p>
        <Button asChild className="mt-2 rounded-full"><Link href="/recherche">{t.cart.discover}</Link></Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      <ul className="divide-y rounded-3xl border bg-card px-4 sm:px-6">
        {lines.map((l) => (
          <li key={l.productId} className="flex gap-4 py-5">
            <Link href={`/produit/${l.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl border bg-white">
              <StoreImage imageKey={l.imageKey} alt={l.name} fill sizes="96px" className="object-contain p-2" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex justify-between gap-2">
                <Link href={`/produit/${l.slug}`} className="line-clamp-2 font-medium hover:underline">{l.name}</Link>
                <button type="button" onClick={() => remove(l.productId)} className="-m-1 h-fit rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive" aria-label={fmt(t.cart.remove, { name: l.name })}>
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{fmt(t.cart.perUnit, { price: price(l.price) })}</p>
              <div className="mt-auto flex items-center justify-between">
                <QuantityStepper size="sm" value={l.quantity} max={l.maxQuantity} onChange={(v) => setQuantity(l.productId, v)} />
                <span className="font-semibold tabular-nums">{price(l.price * l.quantity)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit space-y-5 rounded-3xl border bg-card p-6 lg:sticky lg:top-36">
        <FreeShippingProgress subtotal={quote?.subtotal ?? 0} threshold={freeShippingThreshold} />
        <dl className="space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{t.cart.subtotal}</dt><dd className="tabular-nums">{quote ? price(quote.subtotal) : "…"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{t.cart.shipping}</dt><dd className="text-end">{t.cart.shippingAtCheckout}</dd></div>
        </dl>
        <Button asChild className="h-12 w-full rounded-xl text-base"><Link href="/commande">{t.cart.checkout}</Link></Button>
        <Button asChild variant="outline" className="h-11 w-full rounded-xl border-[#25D366]/50 text-[#0f7a5a] hover:bg-[#25D366]/10 hover:text-[#0f7a5a]">
          <a href={waLink(lines)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-4" /> {t.cart.orderWhatsapp}</a>
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t.trust.codText}</p>
      </aside>
    </div>
  );
}
