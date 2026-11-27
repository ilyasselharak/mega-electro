"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/seo", label: "Tableau de bord", exact: true },
  { href: "/admin/seo/categories", label: "Catégories" },
  { href: "/admin/seo/products", label: "Produits" },
  { href: "/admin/seo/settings", label: "Paramètres SEO" },
  { href: "/admin/seo/redirects", label: "Redirections" },
  { href: "/admin/seo/historique", label: "Historique" },
];

export function SeoTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections SEO" className="-mx-4 mb-6 overflow-x-auto border-b px-4 scrollbar-none sm:mx-0 sm:px-0">
      <ul className="flex gap-1">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href) || (t.href.endsWith("categories") && pathname.startsWith("/admin/seo/edit/category")) || (t.href.endsWith("products") && pathname.startsWith("/admin/seo/edit/product"));
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn("inline-flex whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition", active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
