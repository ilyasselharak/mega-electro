import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { listAdminOrders } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import { cn, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Commandes" };

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function OrdersPage({ searchParams }: PageProps<"/[lang]/admin/orders">) {
  await requireStaffPage();
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await listAdminOrders({ status, q, page });
  const total = Object.values(data.counts).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <>
      <PageHeader title="Commandes" description="Confirmez, préparez et suivez les livraisons." actions={<SearchInput placeholder="N°, nom, téléphone, ville…" />} />
      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        {[{ key: undefined, label: "Toutes", count: total }, ...STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s], count: data.counts[s] ?? 0 }))].map((t) => (
          <Link
            key={t.key ?? "all"}
            href={`/admin/orders${t.key ? `?status=${t.key}` : ""}`}
            className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium", status === t.key ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
          >
            {t.label} <span className="opacity-70">{t.count}</span>
          </Link>
        ))}
      </div>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-5">N°</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">Téléphone</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="pe-5 text-end">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((o) => (
              <TableRow key={o.id} className="relative">
                <TableCell className="ps-5">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold text-primary after:absolute after:inset-0 hover:underline">{o.number}</Link>
                </TableCell>
                <TableCell><span className="block font-medium">{o.fullName}</span><span className="text-xs text-muted-foreground">{o.city} · {o._count.items} article{o._count.items > 1 ? "s" : ""}</span></TableCell>
                <TableCell className="hidden font-mono text-xs md:table-cell">{o.phone}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(o.createdAt, { dateStyle: "short", timeStyle: "short" })}</TableCell>
                <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                <TableCell className="pe-5 text-end font-medium tabular-nums">{formatPrice(o.total)}</TableCell>
              </TableRow>
            ))}
            {data.items.length === 0 ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">Aucune commande trouvée.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </Card>
      <AdminPagination page={data.page} pageCount={data.pageCount} total={data.total} basePath="/admin/orders" params={{ status, q }} />
    </>
  );
}
