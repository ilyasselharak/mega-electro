import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StoreImage } from "@/components/shared/store-image";
import { BrandDialog } from "./brand-dialog";
import { DeleteTaxonomyButton } from "../categories/category-dialog";
import { listAdminBrands } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";

export const metadata = { title: "Marques" };

export default async function BrandsPage() {
  await requireStaffPage();
  const brands = await listAdminBrands();
  return (
    <>
      <PageHeader title="Marques" actions={<BrandDialog />} />
      <Card className="py-0">
        <Table>
          <TableHeader><TableRow><TableHead className="ps-5">Marque</TableHead><TableHead className="hidden sm:table-cell">URL</TableHead><TableHead>Produits</TableHead><TableHead>Statut</TableHead><TableHead className="w-24 pe-5" /></TableRow></TableHeader>
          <TableBody>
            {brands.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="ps-5">
                  <span className="flex items-center gap-3 font-medium">
                    <span className="relative size-9 overflow-hidden rounded-md border bg-white"><StoreImage imageKey={b.logoKey} alt="" fill sizes="36px" className="object-contain p-0.5" /></span>
                    {b.name}
                  </span>
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">/marque/{b.slug}</TableCell>
                <TableCell className="tabular-nums">{b._count.products}</TableCell>
                <TableCell>{b.isActive ? <Badge variant="secondary">Visible</Badge> : <Badge variant="outline">Masquée</Badge>}</TableCell>
                <TableCell className="pe-5">
                  <div className="flex justify-end">
                    <BrandDialog id={b.id} initial={{ name: b.name, slug: b.slug, description: b.description ?? "", isActive: b.isActive, logoKey: b.logoKey, metaTitle: b.metaTitle ?? "", metaDescription: b.metaDescription ?? "" }} />
                    <DeleteTaxonomyButton id={b.id} kind="brand" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {brands.length === 0 ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">Aucune marque.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
