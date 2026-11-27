"use client";

import { BadgePercent, ChevronRight, Heart, Menu, Package, Phone, Search as SearchIcon, User } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CategoryIcon } from "@/components/shared/category-icon";
import { StoreImage } from "@/components/shared/store-image";
import { useStoreUi } from "@/hooks/use-saved-products";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitch } from "@/components/store/language-switch";
import { Link, useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";

export type MenuCategory = { id: string; slug: string; icon: string | null; label: string; cover?: { key: string } | null; children: { id: string; slug: string; label: string }[] };

function Thumb({ c }: { c: MenuCategory }) {
  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
      {c.cover ? <StoreImage imageKey={c.cover.key} alt="" fill sizes="40px" className="object-contain p-1" /> : <CategoryIcon name={c.icon} className="size-5 text-muted-foreground" />}
    </span>
  );
}

export function MobileMenu({ categories, phone }: { categories: MenuCategory[]; phone: string }) {
  const { t, locale } = useI18n();
  const open = useStoreUi((s) => s.menuOpen);
  const setOpen = useStoreUi((s) => s.setMenuOpen);
  const close = () => setOpen(false);
  const row = "flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-[15px] hover:bg-muted";
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="-ms-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-muted lg:hidden" aria-label={t.header.openMenu}>
        <Menu className="size-5.5" />
      </SheetTrigger>
      <SheetContent side={locale === "ar" ? "right" : "left"} className="flex w-[88%] max-w-sm flex-col gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle asChild>
            <div onClick={close}><Logo /></div>
          </SheetTitle>
          <SheetDescription className="sr-only">{t.header.mainMenu}</SheetDescription>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-2" aria-label={t.header.mainMenu}>
          <p className="px-3 pb-1 pt-3 text-xs font-semibold text-muted-foreground">{t.header.categories}</p>
          <Accordion type="single" collapsible>
            {categories.map((c) =>
              c.children.length ? (
                <AccordionItem key={c.id} value={c.id} className="border-none">
                  <AccordionTrigger className="min-h-12 rounded-xl px-3 py-2 text-[15px] hover:bg-muted hover:no-underline">
                    <span className="flex items-center gap-3"><Thumb c={c} /> {c.label}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 ps-11">
                    {c.children.map((s) => (
                      <Link key={s.id} href={`/categorie/${s.slug}`} onClick={close} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-muted">{s.label}</Link>
                    ))}
                    <Link href={`/categorie/${c.slug}`} onClick={close} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-orange-strong">
                      {fmt(t.header.viewCategory, { name: c.label })}
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link key={c.id} href={`/categorie/${c.slug}`} onClick={close} className={`${row} justify-between`}>
                  <span className="flex items-center gap-3"><Thumb c={c} /> {c.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground rtl:-scale-x-100" aria-hidden />
                </Link>
              ),
            )}
          </Accordion>
          <div className="my-2 border-t" />
          {[
            { href: "/promotions", label: t.header.promotions, icon: BadgePercent },
            { href: "/recherche", label: t.header.allProducts, icon: SearchIcon },
            { href: "/favoris", label: t.wishlist.title, icon: Heart },
            { href: "/suivi-commande", label: t.header.trackOrder, icon: Package },
            { href: "/compte", label: t.header.account, icon: User },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={close} className={row}>
              <Icon className="size-5 text-muted-foreground" /> {label}
            </Link>
          ))}
          <LanguageSwitch className={`${row} w-full`} />
        </nav>
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="m-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background">
          <Phone className="size-4" aria-hidden /> <span dir="ltr">{phone}</span>
        </a>
      </SheetContent>
    </Sheet>
  );
}
