"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { cartCount, useCart } from "@/hooks/use-cart";
import { useStoreUi } from "@/hooks/use-saved-products";
import { useMounted } from "@/hooks/use-mounted";
import { Link, useI18n } from "@/i18n/client";
import { localizePath, splitLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

function Dot({ active }: { active: boolean }) {
  return <span className={cn("absolute top-0 h-0.5 w-8 rounded-full", active ? "bg-primary" : "bg-transparent")} aria-hidden />;
}

/**
 * Mobile bottom navigation: Home, Categories, Search, Cart, Account. Hidden from lg up, and on
 * product pages where the sticky purchase bar takes its place.
 */
export function BottomNav() {
  const { t, locale } = useI18n();
  const path = splitLocale(usePathname()).path;
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.open);
  const setMenuOpen = useStoreUi((s) => s.setMenuOpen);
  const count = mounted ? cartCount(lines) : 0;

  function focusSearch() {
    const input = document.getElementById("site-search-mobile") as HTMLInputElement | null;
    if (!input) return router.push(localizePath(locale, "/recherche"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    input.focus({ preventScroll: true });
  }

  const item = "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium";
  const tone = (active: boolean) => (active ? "text-foreground" : "text-muted-foreground");

  return (
    <nav aria-label={t.header.mainMenu} className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden [body:has(.has-sticky-cta)_&]:hidden">
      <ul className="flex h-16 items-stretch">
        <li className="relative flex flex-1 justify-center">
          <Dot active={path === "/"} />
          <Link href="/" className={cn(item, tone(path === "/"))} aria-current={path === "/" ? "page" : undefined}>
            <Home className="size-5.5" aria-hidden /> {t.common.home}
          </Link>
        </li>
        <li className="relative flex flex-1 justify-center">
          <Dot active={path.startsWith("/categorie")} />
          <button type="button" onClick={() => setMenuOpen(true)} className={cn(item, tone(path.startsWith("/categorie")))}>
            <LayoutGrid className="size-5.5" aria-hidden /> {t.header.categories}
          </button>
        </li>
        <li className="relative flex flex-1 justify-center">
          <Dot active={path.startsWith("/recherche")} />
          <button type="button" onClick={focusSearch} className={cn(item, tone(path.startsWith("/recherche")))}>
            <Search className="size-5.5" aria-hidden /> {t.listing.search}
          </button>
        </li>
        <li className="relative flex flex-1 justify-center">
          <button type="button" onClick={openCart} className={cn(item, "text-muted-foreground")}>
            <span className="relative">
              <ShoppingCart className="size-5.5" aria-hidden />
              {count > 0 ? <span className="price absolute -end-2.5 -top-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4.5 text-primary-foreground">{count}</span> : null}
            </span>
            {t.header.cart}
          </button>
        </li>
        <li className="relative flex flex-1 justify-center">
          <Dot active={path.startsWith("/compte")} />
          <Link href="/compte" className={cn(item, tone(path.startsWith("/compte")))}>
            <User className="size-5.5" aria-hidden /> {t.header.account}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
