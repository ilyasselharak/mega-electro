"use client";

import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart, type CartLine } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";

type Props = {
  product: Omit<CartLine, "quantity">;
  quantity?: number;
  variant?: "icon" | "full";
  className?: string;
};

export function AddToCartButton({ product, quantity = 1, variant = "full", className }: Props) {
  const { t } = useI18n();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const outOfStock = product.maxQuantity <= 0;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (variant === "icon") {
    return (
      <Button
        type="button"
        size="icon-lg"
        onClick={onClick}
        disabled={outOfStock}
        aria-label={outOfStock ? t.common.outOfStock : fmt(t.product.addNamed, { name: product.name })}
        className={cn("size-10 rounded-full", className)}
      >
        {added ? <Check /> : <ShoppingBag />}
      </Button>
    );
  }

  return (
    <Button type="button" onClick={onClick} disabled={outOfStock} className={cn("h-12 rounded-xl text-base", className)}>
      {added ? <Check /> : <ShoppingBag />}
      {outOfStock ? t.common.outOfStock : added ? t.product.added : t.product.addToCart}
    </Button>
  );
}
