import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, PackageX, ShoppingCart, TrendingUp, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getDashboardStats } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";
import { formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Tableau de bord" };

function Stat({ label, value, icon: Icon, hint, href, tone }: { label: string; value: string; icon: typeof Wallet; hint?: string; href?: string; tone?: "warn" }) {
  const body = (
    <Card className="h-full gap-0 py-0 transition hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={tone === "warn" ? "flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function DashboardPage() {
  await requireStaffPage();
  const s = await getDashboardStats();
  return (
    <>
      <PageHeader title="Tableau de bord" description="Activité des 30 derniers jours" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Chiffre d'affaires (30 j)" value={formatPrice(s.revenue30)} icon={Wallet} hint="Hors annulations et retours" />
        <Stat label="Commandes (30 j)" value={String(s.orders30)} icon={ShoppingCart} hint={`Panier moyen ${formatPrice(s.averageOrder)}`} href="/admin/orders" />
        <Stat label="À confirmer" value={String(s.pending)} icon={Clock} hint="Commandes en attente d'appel" href="/admin/orders?status=PENDING" tone={s.pending ? "warn" : undefined} />
        <Stat label="Alertes stock" value={`${s.lowStock} / ${s.outOfStock}`} icon={s.outOfStock ? PackageX : AlertTriangle} hint="Stock faible / rupture" href="/admin/inventory?filter=low" tone={s.lowStock + s.outOfStock ? "warn" : undefined} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="size-4.5 text-orange-strong" /> Chiffre d&apos;affaires quotidien (14 jours)</CardTitle></CardHeader>
          <CardContent><RevenueChart data={s.series} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Meilleurs produits (30 j)</CardTitle></CardHeader>
          <CardContent>
            {s.topProducts.length ? (
              <ol className="space-y-3">
                {s.topProducts.map((p, i) => (
                  <li key={`${p.productId}-${i}`} className="flex items-center gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                    <span className="line-clamp-1 flex-1">{p.name}</span>
                    <span className="text-muted-foreground tabular-nums">×{p.quantity}</span>
                    <span className="w-24 text-end font-medium tabular-nums">{formatPrice(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-muted-foreground">Aucune vente sur la période.</p>}
            <p className="mt-5 flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground"><Users className="size-4" /> {s.customers} comptes clients</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Dernières commandes</CardTitle>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-orange-strong hover:underline">Tout voir <ArrowRight className="size-4" /></Link>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="ps-6">N°</TableHead><TableHead>Client</TableHead><TableHead className="hidden sm:table-cell">Date</TableHead><TableHead>Statut</TableHead><TableHead className="pe-6 text-end">Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {s.recentOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="ps-6 font-mono text-xs"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-orange-strong hover:underline">{o.number}</Link></TableCell>
                  <TableCell><span className="block">{o.fullName}</span><span className="text-xs text-muted-foreground">{o.city}</span></TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(o.createdAt, { dateStyle: "short", timeStyle: "short" })}</TableCell>
                  <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                  <TableCell className="pe-6 text-end font-medium tabular-nums">{formatPrice(o.total)}</TableCell>
                </TableRow>
              ))}
              {s.recentOrders.length === 0 ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aucune commande pour le moment.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
