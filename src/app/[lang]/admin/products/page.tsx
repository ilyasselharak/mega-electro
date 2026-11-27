import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { StoreImage } from "@/components/shared/store-image";
import { ProductRowActions } from "./product-row-actions";
import { listAdminProducts } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/types";

export const metadata = { title: "Produits" };

const STATUS_LABEL: Record<ProductStatus, string> = { ACTIVE: "Actif", DRAFT: "Brouillon", ARCHIVED: "Archivé" };
const STATUS_STYLE: Record<ProductStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300",
  DRAFT: "bg-zinc-200 text-zinc-800 dark:bg-zinc-500/20 dark:text-zinc-300",
  ARCHIVED: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300",
};

export default async function ProductsPage({ searchParams }: PageProps<"/[lang]/admin/products">) {
  await requireStaffPage();
  const sp = await searchParams;
  const status = (["ACTIVE", "DRAFT", "ARCHIVED"] as const).find((s) => s === sp.status);
  const stock = sp.stock === "low" || sp.stock === "out" ? sp.stock : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await listAdminProducts({ q, status, stock, page });

  const tabs = [
    { label: "Tous", href: "/admin/products", active: !status && !stock },
    { label: "Actifs", href: "/admin/products?status=ACTIVE", active: status === "ACTIVE" },
    { label: "Brouillons", href: "/admin/products?status=DRAFT", active: status === "DRAFT" },
    { label: "Archivés", href: "/admin/products?status=ARCHIVED", active: status === "ARCHIVED" },
    { label: "Rupture", href: "/admin/products?stock=out", active: stock === "out" },
  ];

  return (
    <>
      <PageHeader
        title="Produits"
        description="Gérez votre catalogue, vos prix et vos images."
        actions={<><SearchInput placeholder="Nom ou SKU…" /><Button asChild><Link href="/admin/products/new"><Plus /> Nouveau produit</Link></Button></>}
      />
      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium", t.active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>{t.label}</Link>
        ))}
      </div>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-5">Produit</TableHead>
              <TableHead className="hidden md:table-cell">Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden sm:table-cell">Statut</TableHead>
              <TableHead className="w-10 pe-5" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="ps-5">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-white">
                      <StoreImage imageKey={p.images[0]?.key} alt="" fill sizes="44px" className="object-contain p-0.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-medium hover:underline">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.sku}{p.brand ? ` · ${p.brand.name}` : ""}{p.isFeatured ? " · ★" : ""}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{p.category?.name ?? "—"}</TableCell>
                <TableCell className="tabular-nums">
                  {formatPrice(p.price)}
                  {p.compareAtPrice ? <span className="block text-xs text-muted-foreground line-through">{formatPrice(p.compareAtPrice)}</span> : null}
                </TableCell>
                <TableCell>
                  <span className={cn("font-medium tabular-nums", p.stock <= 0 ? "text-destructive" : p.stock <= p.lowStockThreshold ? "text-amber-600" : "")}>{p.stock}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell"><Badge className={cn("border-0", STATUS_STYLE[p.status])}>{STATUS_LABEL[p.status]}</Badge></TableCell>
                <TableCell className="pe-5"><ProductRowActions id={p.id} name={p.name} /></TableCell>
              </TableRow>
            ))}
            {data.items.length === 0 ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Aucun produit. <Link href="/admin/products/new" className="text-orange-strong hover:underline">Créer le premier</Link></TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </Card>
      <AdminPagination page={data.page} pageCount={data.pageCount} total={data.total} basePath="/admin/products" params={{ q, status, stock }} />
    </>
  );
}
