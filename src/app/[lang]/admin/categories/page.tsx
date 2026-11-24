import Link from "next/link";
import { SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CategoryDialog, DeleteTaxonomyButton } from "./category-dialog";
import { listAdminCategories } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";

export const metadata = { title: "Catégories" };

export default async function CategoriesPage() {
  await requireStaffPage();
  const categories = await listAdminCategories();
  const roots = categories.filter((c) => !c.parentId);
  const ordered = roots.flatMap((r) => [r, ...categories.filter((c) => c.parentId === r.id)]);
  const parents = roots.map((r) => ({ id: r.id, name: r.name }));

  return (
    <>
      <PageHeader title="Catégories" description="Organisez la navigation de la boutique." actions={<CategoryDialog parents={parents} />} />
      <Card className="py-0">
        <Table>
          <TableHeader><TableRow><TableHead className="ps-5">Nom</TableHead><TableHead className="hidden sm:table-cell">URL</TableHead><TableHead>Produits</TableHead><TableHead>Statut</TableHead><TableHead className="w-32 pe-5" /></TableRow></TableHeader>
          <TableBody>
            {ordered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="ps-5">
                  <span className={`flex items-center gap-2.5 ${c.parentId ? "ps-7 text-muted-foreground" : "font-medium"}`}>
                    {c.parentId ? "↳" : <CategoryIcon name={c.icon} className="size-4 text-primary" />} {c.name}
                  </span>
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">/categorie/{c.slug}</TableCell>
                <TableCell className="tabular-nums">{c._count.products}</TableCell>
                <TableCell>{c.isActive ? <Badge variant="secondary">Visible</Badge> : <Badge variant="outline">Masquée</Badge>}</TableCell>
                <TableCell className="pe-5">
                  <div className="flex justify-end">
                    <CategoryDialog id={c.id} parents={parents} initial={{ name: c.name, nameAr: c.nameAr ?? "", slug: c.slug, description: c.description ?? "", parentId: c.parentId, icon: c.icon ?? "", position: c.position, isActive: c.isActive, imageKey: c.imageKey, metaTitle: c.metaTitle ?? "", metaDescription: c.metaDescription ?? "" }} />
                    <Button asChild variant="ghost" size="icon-sm" aria-label="SEO avancé"><Link href={`/admin/seo/edit/category/${c.id}`}><SearchCheck /></Link></Button>
                    <DeleteTaxonomyButton id={c.id} kind="category" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ordered.length === 0 ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">Aucune catégorie.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
