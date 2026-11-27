"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-saved-products";
import { useMounted } from "@/hooks/use-mounted";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, name, className, size = "sm" }: { productId: string; name: string; className?: string; size?: "sm" | "lg" }) {
  const { t } = useI18n();
  const mounted = useMounted();
  const saved = useWishlist((s) => s.ids.includes(productId)) && mounted;
  const toggle = useWishlist((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={fmt(saved ? t.wishlist.remove : t.wishlist.add, { name })}
      className={cn(
        "flex items-center justify-center rounded-full border bg-card text-foreground/70 transition-colors hover:text-foreground",
        size === "sm" ? "size-9" : "size-12 rounded-xl",
        saved && "border-orange-strong/30 text-orange-strong hover:text-orange-strong",
        className,
      )}
    >
      <Heart className={cn(size === "sm" ? "size-4" : "size-5", saved && "fill-current")} aria-hidden />
    </button>
  );
}
