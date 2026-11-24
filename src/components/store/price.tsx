"use client";

import { useI18n } from "@/i18n/client";
import { discountPercent, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({ price, compareAtPrice, size = "md", className }: { price: number; compareAtPrice?: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const { locale } = useI18n();
  const off = discountPercent(price, compareAtPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-heading font-bold tabular-nums", size === "sm" && "text-[17px]", size === "md" && "text-xl", size === "lg" && "text-3xl sm:text-4xl", off && "text-destructive")}>
        {formatPrice(price, locale)}
      </span>
      {off && compareAtPrice ? (
        <s className={cn("text-muted-foreground tabular-nums", size === "lg" ? "text-lg" : "text-sm")}>{formatPrice(compareAtPrice, locale)}</s>
      ) : null}
    </div>
  );
}

/** Price formatter for client components. */
export function usePrice() {
  const { locale } = useI18n();
  return (centimes: number) => formatPrice(centimes, locale);
}
