"use client";

import { useI18n } from "@/i18n/client";
import { discountPercent, formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Current price in DH; the original price is shown struck only when it is really higher. */
export function Price({ price, compareAtPrice, size = "md", className }: { price: number; compareAtPrice?: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const { locale } = useI18n();
  const off = discountPercent(price, compareAtPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0", className)}>
      <span className={cn("price font-extrabold tracking-[-0.02em] text-foreground", size === "sm" && "text-base sm:text-[17px]", size === "md" && "text-xl", size === "lg" && "text-3xl sm:text-[2.5rem]")}>
        {formatPrice(price, locale)}
      </span>
      {off && compareAtPrice ? (
        <s className={cn("price text-muted-foreground", size === "lg" ? "text-lg" : "text-xs sm:text-[13px]")}>{formatPrice(compareAtPrice, locale)}</s>
      ) : null}
    </div>
  );
}

/** Price formatter for client components. */
export function usePrice() {
  const { locale } = useI18n();
  return (centimes: number) => formatPrice(centimes, locale);
}
