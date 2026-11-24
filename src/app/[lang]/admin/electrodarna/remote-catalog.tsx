"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyPlus, ImageOff, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, toCentimes } from "@/lib/money";
import { cn } from "@/lib/utils";
import { importElectroDarnaProducts } from "@/server/actions/electrodarna";
import type { RemoteProduct } from "@convex/electrodarna";

export type { RemoteProduct };

type Linked = Record<string, { id: string; stock: number; price: number }>;
type Filter = "all" | "available" | "new" | "imported";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "available", label: "Disponibles" },
  { key: "new", label: "Pas encore clonés" },
  { key: "imported", label: "Déjà clonés" },
];

const MAX_PER_IMPORT = 50;

export function RemoteCatalog({ products, linked }: { products: RemoteProduct[]; linked: Linked }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("available");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT");
  const [pending, start] = useTransition();

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "available" && !p.available) return false;
      if (filter === "new" && linked[p.id]) return false;
      if (filter === "imported" && !linked[p.id]) return false;
      if (!needle) return true;
      return [p.name, p.brand, p.categoryName].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [products, linked, q, filter]);

  const selectable = rows.filter((p) => !linked[p.id]);
  const allSelected = selectable.length > 0 && selectable.every((p) => selected.has(p.id));

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const clone = (ids: string[]) =>
    start(async () => {
      if (ids.length > MAX_PER_IMPORT) {
        toast.error(`${MAX_PER_IMPORT} produits maximum par clonage.`);
        return;
      }
      const res = await importElectroDarnaProducts({ ids, status });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const { created, skipped, failed } = res.data;
      toast.success(`${created} produit(s) cloné(s)${skipped ? `, ${skipped} déjà présent(s)` : ""}`);
      if (failed.length) toast.error(`Échec : ${failed.join(", ")}`);
      setSelected(new Set());
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, marque, catégorie…" className="ps-9" />
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium", filter === f.key ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
        <span className="me-auto text-muted-foreground">
          {rows.length} produit(s) · {Object.keys(linked).length} déjà cloné(s){selected.size ? ` · ${selected.size} sélectionné(s)` : ""}
        </span>
        <Select value={status} onValueChange={(v) => setStatus(v as "DRAFT" | "ACTIVE")}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Cloner en brouillon</SelectItem>
            <SelectItem value="ACTIVE">Cloner et publier</SelectItem>
          </SelectContent>
        </Select>
        <Button disabled={pending || selected.size === 0} onClick={() => clone([...selected])}>
          {pending ? <Loader2 className="animate-spin" /> : <CopyPlus />} Cloner la sélection
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 ps-5">
                <Checkbox
                  checked={allSelected}
                  disabled={selectable.length === 0}
                  onCheckedChange={(v) => setSelected(v ? new Set(selectable.slice(0, MAX_PER_IMPORT).map((p) => p.id)) : new Set())}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>Produit</TableHead>
              <TableHead>Prix Electro Darna</TableHead>
              <TableHead>Disponibilité</TableHead>
              <TableHead className="pe-5 text-end" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => {
              const local = linked[p.id];
              return (
                <TableRow key={p.id} className={cn(!p.isActive && "opacity-60")}>
                  <TableCell className="ps-5">
                    <Checkbox checked={selected.has(p.id)} disabled={Boolean(local)} onCheckedChange={(v) => toggle(p.id, v === true)} aria-label={`Sélectionner ${p.name}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
                        {p.imageUrls[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote Convex storage URL
                          <img src={p.imageUrls[0]} alt="" loading="lazy" className="size-full object-contain p-0.5" />
                        ) : (
                          <ImageOff className="size-4 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{[p.brand, p.categoryName].filter(Boolean).join(" · ") || "—"}</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatPrice(toCentimes(p.price))}
                    {local && local.price !== toCentimes(p.price) ? <span className="block text-xs text-muted-foreground">Chez vous : {formatPrice(local.price)}</span> : null}
                  </TableCell>
                  <TableCell>
                    {!p.isActive ? (
                      <Badge variant="secondary">Désactivé</Badge>
                    ) : p.available ? (
                      <Badge className="border-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {p.stock != null ? `${p.stock} en stock` : "En stock"}
                      </Badge>
                    ) : (
                      <Badge className="border-0 bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300">Rupture</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pe-5 text-end">
                    {local ? (
                      <Button asChild variant="ghost" size="sm"><Link href={`/admin/products/${local.id}`}>Cloné · voir</Link></Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled={pending} onClick={() => clone([p.id])}><CopyPlus /> Cloner</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">Aucun produit.</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
