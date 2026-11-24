import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/search-input";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { RoleSelect } from "./role-select";
import { listCustomers } from "@/server/queries/admin";
import { isAdmin, requireStaffPage } from "@/lib/session";
import { formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Clients" };

const ROLE: Record<string, string> = { CUSTOMER: "Client", STAFF: "Équipe", ADMIN: "Admin" };

export default async function CustomersPage({ searchParams }: PageProps<"/[lang]/admin/customers">) {
  const me = await requireStaffPage();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await listCustomers({ q, page });
  const admin = isAdmin(me);

  return (
    <>
      <PageHeader title="Clients" description="Comptes clients et équipe, meilleurs clients invités." actions={<SearchInput placeholder="Nom, email, téléphone…" />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div>
          <Card className="py-0">
            <Table>
              <TableHeader><TableRow><TableHead className="ps-5">Utilisateur</TableHead><TableHead className="hidden md:table-cell">Inscrit le</TableHead><TableHead>Commandes</TableHead><TableHead className="pe-5">Rôle</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="ps-5"><span className="block font-medium">{u.name}</span><span className="text-xs text-muted-foreground">{u.email}{u.phone ? ` · ${u.phone}` : ""}</span></TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="tabular-nums">{u._count.orders}</TableCell>
                    <TableCell className="pe-5">{admin ? <RoleSelect userId={u.id} role={u.role} disabled={u.id === me.id} /> : <Badge variant="secondary">{ROLE[u.role]}</Badge>}</TableCell>
                  </TableRow>
                ))}
                {data.items.length === 0 ? <TableRow><TableCell colSpan={4} className="py-12 text-center text-muted-foreground">Aucun utilisateur.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </Card>
          <AdminPagination page={data.page} pageCount={data.pageCount} total={data.total} basePath="/admin/customers" params={{ q }} />
        </div>
        <Card>
          <CardHeader><CardTitle>Meilleurs clients invités</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.guests.map((g) => (
                <li key={`${g.phone}-${g.fullName}-${g.city}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <Link href={`/admin/orders?q=${encodeURIComponent(g.phone)}`} className="line-clamp-1 font-medium hover:underline">{g.fullName}</Link>
                    <span className="text-xs text-muted-foreground">{g.phone} · {g.city}</span>
                  </span>
                  <span className="text-end"><span className="block font-medium tabular-nums">{formatPrice(g._sum.total ?? 0)}</span><span className="text-xs text-muted-foreground">{g._count} cmd</span></span>
                </li>
              ))}
              {data.guests.length === 0 ? <li className="text-sm text-muted-foreground">Aucune commande invité.</li> : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
