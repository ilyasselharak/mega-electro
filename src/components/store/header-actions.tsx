"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-saved-products";
import { useMounted } from "@/hooks/use-mounted";
import { Link, useI18n } from "@/i18n/client";
import { plural } from "@/i18n/fmt";

export function WishlistLink() {
  const { t, locale } = useI18n();
  const mounted = useMounted();
  const count = useWishlist((s) => s.ids.length);
  const n = mounted ? count : 0;
  return (
    <Link href="/favoris" className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label={plural(locale, n, t.wishlist.headerLabel)}>
      <Heart className="size-5.5" aria-hidden />
      {n > 0 ? <span className="price absolute end-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-bold leading-5 text-background">{n}</span> : null}
    </Link>
  );
}
