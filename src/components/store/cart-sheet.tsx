"use client";

import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StoreImage } from "@/components/shared/store-image";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { usePrice } from "@/components/store/price";
import { cartCount, cartSubtotal, useCart, type CartLine } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { Link, useI18n } from "@/i18n/client";
import { fmt, plural } from "@/i18n/fmt";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { t, locale } = useI18n();
  const lines = useCart((s) => s.lines);
  const open = useCart((s) => s.open);
  const mounted = useMounted();
  const count = mounted ? cartCount(lines) : 0;
  return (
    <button type="button" onClick={open} className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label={plural(locale, count, t.header.cartCount)}>
      <ShoppingBag className="size-5.5" />
      {count > 0 ? (
        <span className="absolute end-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-brass px-1 text-[11px] font-bold leading-5 text-brass-foreground">{count}</span>
      ) : null}
    </button>
  );
}

export function QuantityStepper({ value, max, onChange, size = "md" }: { value: number; max: number; onChange: (v: number) => void; size?: "sm" | "md" }) {
  const { t } = useI18n();
  return (
    <div className={cn("inline-flex items-center rounded-full border bg-background", size === "sm" ? "h-9" : "h-12")}>
      <button type="button" className="flex h-full w-10 items-center justify-center rounded-s-full hover:bg-muted disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t.product.decrease}>
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite" aria-label={t.product.quantity}>{value}</span>
      <button type="button" className="flex h-full w-10 items-center justify-center rounded-e-full hover:bg-muted disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= Math.min(max, 20)} aria-label={t.product.increase}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/** wa.me link listing the cart lines (prices are indicative; the team confirms by phone). */
export function useWhatsAppCartLink(whatsapp: string) {
  const { t } = useI18n();
  const price = usePrice();
  return (lines: CartLine[]) => {
    const text = fmt(t.cart.whatsappCartText, {
      lines: lines.map((l) => `• ${l.name} x${l.quantity} — ${price(l.price * l.quantity)}`).join("\n"),
      total: price(cartSubtotal(lines)),
    });
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  };
}

export function FreeShippingProgress({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  const { t } = useI18n();
  const price = usePrice();
  if (threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  return (
    <div>
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 shrink-0 text-orange-strong" aria-hidden />
        {remaining > 0 ? <span>{fmt(t.cart.freeShippingLeft, { amount: price(remaining) })}</span> : <strong>{t.cart.freeShippingReached}</strong>}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(100, (subtotal / threshold) * 100))}>
        <div className="h-full rounded-full bg-brass transition-[width] duration-500" style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }} />
      </div>
    </div>
  );
}

export function CartSheet({ freeShippingThreshold, whatsapp }: { freeShippingThreshold: number; whatsapp: string }) {
  const { t, locale } = useI18n();
  const price = usePrice();
  const { lines, isOpen, setOpen, setQuantity, remove } = useCart();
  const mounted = useMounted();
  const subtotal = cartSubtotal(lines);
  const waLink = useWhatsAppCartLink(whatsapp);
  const close = () => setOpen(false);

  return (
    <Sheet open={mounted && isOpen} onOpenChange={setOpen}>
      <SheetContent side={locale === "ar" ? "left" : "right"} className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="font-heading text-lg">{fmt(t.cart.titleCount, { count: cartCount(lines) })}</SheetTitle>
          <SheetDescription className="sr-only">{t.cart.itemsLabel}</SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted"><ShoppingBag className="size-7 text-muted-foreground" /></div>
            <p className="font-semibold">{t.cart.empty}</p>
            <p className="max-w-60 text-sm text-muted-foreground">{t.cart.emptyText}</p>
            <Button asChild variant="outline" className="mt-2 h-11 rounded-full px-5" onClick={close}>
              <Link href="/recherche">{t.cart.discover}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b px-5 py-3.5">
              <FreeShippingProgress subtotal={subtotal} threshold={freeShippingThreshold} />
            </div>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {lines.map((l) => (
                <li key={l.productId} className="flex gap-3 py-4">
                  <Link href={`/produit/${l.slug}`} onClick={close} className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-white">
                    <StoreImage imageKey={l.imageKey} alt={l.name} fill sizes="80px" className="object-contain p-1.5" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/produit/${l.slug}`} onClick={close} className="line-clamp-2 text-sm font-medium leading-5 hover:underline">{l.name}</Link>
                      <button type="button" onClick={() => remove(l.productId)} className="-m-1 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive" aria-label={fmt(t.cart.remove, { name: l.name })}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <QuantityStepper size="sm" value={l.quantity} max={l.maxQuantity} onChange={(v) => setQuantity(l.productId, v)} />
                      <span className="text-sm font-semibold tabular-nums">{price(l.price * l.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <SheetFooter className="gap-3 border-t bg-muted/40 p-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt>{t.cart.subtotal}</dt>
                  <dd className="font-heading text-lg font-bold tabular-nums">{price(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <dt>{t.cart.shipping}</dt>
                  <dd>{subtotal >= freeShippingThreshold && freeShippingThreshold > 0 ? t.cart.free : t.cart.shippingAtCheckout}</dd>
                </div>
              </dl>
              <Button asChild className="h-12 rounded-xl text-base" onClick={close}>
                <Link href="/commande">{t.cart.checkout}</Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="h-11 rounded-xl" onClick={close}>
                  <Link href="/panier">{t.cart.viewCart}</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-xl border-[#25D366]/50 text-[#0f7a5a] hover:bg-[#25D366]/10 hover:text-[#0f7a5a]">
                  <a href={waLink(lines)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-4" /> WhatsApp</a>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
