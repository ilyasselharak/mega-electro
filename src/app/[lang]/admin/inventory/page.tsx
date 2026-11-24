import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { StoreImage } from "@/components/shared/store-image";
import { StockAdjust } from "./stock-adjust";
import { listInventory } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Stock" };

const REASON_LABEL: Record<string, string> = { RESTOCK: "Réappro.", SALE: "Vente", ORDER_CANCELLED: "Annulation", ADJUSTMENT: "Correction", RETURN: "Retour", DAMAGE: "Casse" };

export default async function InventoryPage({ searchParams }: PageProps<"/[lang]/admin/inventory">) {
  await requireStaffPage();
  const sp = await searchParams;
  const filter = sp.filter === "low" || sp.filter === "out" ? sp.filter : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await listInventory({ q, filter, page });

  return (
    <>
      <PageHeader title="Stock" description="Niveaux de stock, ajustements et historique des mouvements." actions={<SearchInput placeholder="Nom ou SKU…" />} />
      <div className="mb-4 flex gap-1.5">
        {[{ k: undefined, l: "Tous" }, { k: "low", l: "Stock faible" }, { k: "out", l: "Rupture" }].map((t) => (
          <Link key={t.l} href={`/admin/inventory${t.k ? `?filter=${t.k}` : ""}`} className={cn("rounded-full border px-3.5 py-1.5 text-sm font-medium", filter === t.k ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>{t.l}</Link>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div>
          <Card className="py-0">
            <Table>
              <TableHeader><TableRow><TableHead className="ps-5">Produit</TableHead><TableHead>Stock</TableHead><TableHead className="hidden sm:table-cell">Seuil</TableHead><TableHead className="pe-5 text-end" /></TableRow></TableHeader>
              <TableBody>
                {data.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="ps-5">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-white"><StoreImage imageKey={p.images[0]?.key} alt="" fill sizes="40px" className="object-contain p-0.5" /></span>
                        <span className="min-w-0"><span className="line-clamp-1 font-medium hover:underline">{p.name}</span><span className="text-xs text-muted-foreground">{p.sku}</span></span>
                      </Link>
                    </TableCell>
                    <TableCell><span className={cn("rounded-md px-2 py-0.5 font-semibold tabular-nums", p.stock <= 0 ? "bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300" : p.stock <= p.lowStockThreshold ? "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300" : "")}>{p.stock}</span></TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{p.lowStockThreshold}</TableCell>
                    <TableCell className="pe-5 text-end"><StockAdjust productId={p.id} stock={p.stock} /></TableCell>
                  </TableRow>
                ))}
                {data.items.length === 0 ? <TableRow><TableCell colSpan={4} className="py-12 text-center text-muted-foreground">Rien à afficher.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </Card>
          <AdminPagination page={data.page} pageCount={data.pageCount} total={data.total} basePath="/admin/inventory" params={{ q, filter }} />
        </div>
        <Card>
          <CardHeader><CardTitle>Derniers mouvements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.movements.map((m) => (
                <li key={m.id} className="flex items-start gap-3 text-sm">
                  <span className={cn("w-12 shrink-0 text-end font-mono font-semibold", m.delta > 0 ? "text-success" : "text-destructive")}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1">{m.product.name}</span>
                    <span className="text-xs text-muted-foreground">{REASON_LABEL[m.reason]} · → {m.stockAfter} · {formatDate(m.createdAt, { dateStyle: "short", timeStyle: "short" })}{m.user ? ` · ${m.user.name}` : ""}{m.note ? ` · ${m.note}` : ""}</span>
                  </span>
                </li>
              ))}
              {data.movements.length === 0 ? <li className="text-sm text-muted-foreground">Aucun mouvement.</li> : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
