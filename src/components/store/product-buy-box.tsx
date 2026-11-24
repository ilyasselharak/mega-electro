"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { QuantityStepper } from "@/components/store/cart-sheet";
import { usePrice } from "@/components/store/price";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { useCart, type CartLine } from "@/hooks/use-cart";
import { useI18n, useLocalePath } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";

type Props = { product: Omit<CartLine, "quantity">; whatsapp: string; url: string };

export function ProductBuyBox({ product, whatsapp, url }: Props) {
  const { t } = useI18n();
  const price = usePrice();
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const lp = useLocalePath();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const outOfStock = product.maxQuantity <= 0;

  function buyNow() {
    add(product, qty);
    setOpen(false);
    router.push(lp("/commande"));
  }

  const waHref = (q: number) =>
    `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      outOfStock ? fmt(t.product.whatsappQuestion, { name: product.name, url }) : fmt(t.product.whatsappOrderText, { name: product.name, qty: q, total: price(product.price * q), url }),
    )}`;

  return (
    <>
      <div className="space-y-3">
        {!outOfStock ? (
          <>
            <div className="flex items-center gap-3">
              <QuantityStepper value={qty} max={product.maxQuantity} onChange={setQty} />
              <AddToCartButton product={product} quantity={qty} className="flex-1" />
            </div>
            <Button type="button" onClick={buyNow} variant="outline" className="h-12 w-full rounded-xl border-primary/30 text-base hover:bg-primary/5">
              {t.product.buyNow}
            </Button>
          </>
        ) : (
          <AddToCartButton product={product} className="w-full" />
        )}
        <a href={waHref(qty)} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-[#0f7a5a] hover:bg-[#25D366]/10">
          <WhatsAppIcon className="size-5" /> {outOfStock ? t.product.askWhatsapp : t.product.orderWhatsapp}
        </a>
      </div>

      {/* Sticky purchase bar on mobile (the floating WhatsApp bubble hides while it is present). */}
      {!outOfStock ? (
        <div className="has-sticky-cta fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">{product.name}</p>
              <p className="font-heading text-lg font-bold tabular-nums">{price(product.price)}</p>
            </div>
            <a href={waHref(qty)} target="_blank" rel="noopener noreferrer" aria-label={t.product.orderWhatsapp} className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#25D366]/50 text-[#0f7a5a]">
              <WhatsAppIcon className="size-5" />
            </a>
            <AddToCartButton product={product} quantity={qty} className="h-12 shrink-0 px-5" />
          </div>
        </div>
      ) : null}
    </>
  );
}
