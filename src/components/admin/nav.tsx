"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, Package, Settings, ShoppingCart, Tags, Users, Warehouse, Award, ExternalLink, Link2, SearchCheck, Truck, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart, badge: "pending" as const },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/brands", label: "Marques", icon: Award },
  { href: "/admin/inventory", label: "Stock", icon: Warehouse },
  { href: "/admin/livraison", label: "Livraison & paiement", icon: Truck },
  { href: "/admin/faq", label: "FAQ", icon: MessageCircleQuestion },
  { href: "/admin/seo", label: "SEO", icon: SearchCheck },
  { href: "/admin/electrodarna", label: "Electro Darna", icon: Link2 },
  { href: "/admin/customers", label: "Clients", icon: Users },
  { href: "/admin/settings", label: "Paramètres", icon: Settings, adminOnly: true },
];

export function AdminNav({ pendingOrders, isAdmin, onNavigate }: { pendingOrders: number; isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Administration">
      {NAV.filter((n) => !n.adminOnly || isAdmin).map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className={cn("size-4.5", active && "text-primary")} />
            <span className="flex-1">{label}</span>
            {badge === "pending" && pendingOrders > 0 ? (
              <span className="rounded-full bg-brass px-2 py-0.5 text-[11px] font-bold text-brass-foreground">{pendingOrders}</span>
            ) : null}
          </Link>
        );
      })}
      <div className="mt-auto border-t pt-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60">
          <ExternalLink className="size-4.5" /> Voir la boutique
        </Link>
        <span className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground"><Boxes className="size-4" /> Mega Electro Admin</span>
      </div>
    </nav>
  );
}
