"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, ExternalLink, Loader2, Pencil, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SEO_LIMITS } from "@convex/lib/seoRules";
import { applySeoSuggestions, setSeoRobots } from "@/server/actions/seo";
import { LengthPill, ScoreBar, SeoStatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";
import type { SeoRow } from "@/server/seo-audit";

export type SeoFilter = "all" | "optimized" | "incomplete" | "missing" | "duplicates" | "noindex" | "no-description";

const FILTERS: { id: SeoFilter; label: string; test: (r: SeoRow) => boolean }[] = [
  { id: "all", label: "Tous", test: () => true },
  { id: "optimized", label: "Optimisés", test: (r) => r.status === "optimized" },
  { id: "incomplete", label: "Incomplets", test: (r) => r.status === "incomplete" },
  { id: "missing", label: "SEO manquant", test: (r) => r.status === "missing" },
  { id: "no-description", label: "Sans méta-description", test: (r) => !r.metaDescription },
  { id: "duplicates", label: "Doublons", test: (r) => r.duplicateTitle || r.duplicateDescription },
  { id: "noindex", label: "Noindex", test: (r) => r.noindex },
];

const PAGE_SIZE = 50;

export function SeoEntityTable({ kind, rows, initialFilter = "all" }: { kind: "category" | "product"; rows: SeoRow[]; initialFilter?: SeoFilter }) {
  const router = useRouter();
  const [filter, setFilter] = useState<SeoFilter>(initialFilter);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, rows.filter(f.test).length])), [rows]);
  const filtered = useMemo(() => {
    const test = FILTERS.find((f) => f.id === filter)!.test;
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => test(r) && (!needle || `${r.name} ${r.slug} ${r.context ?? ""}`.toLowerCase().includes(needle)));
  }, [rows, filter, q]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allVisibleSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const ids = [...selected];
  const label = kind === "category" ? "catégorie" : "produit";

  function runSuggestions() {
    start(async () => {
      const res = await applySeoSuggestions(kind, ids);
      setConfirm(false);
      if (!res.ok) return void toast.error(res.error);
      toast.success(res.data.filled ? `${res.data.filled} champ(s) vide(s) complété(s) sur ${res.data.touched} ${label}(s)` : "Aucun champ vide à compléter");
      setSelected(new Set());
      router.refresh();
    });
  }

  function runRobots(noindex: boolean) {
    start(async () => {
      const res = await setSeoRobots(kind, ids, noindex);
      if (!res.ok) return void toast.error(res.error);
      toast.success(noindex ? "Pages exclues de Google (noindex)" : "Pages indexables");
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            aria-pressed={filter === f.id}
            className={cn("rounded-full border px-3 py-1.5 text-sm font-medium transition", filter === f.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}
          >
            {f.label} <span className="ms-1 tabular-nums opacity-70">{counts[f.id]}</span>
          </button>
        ))}
        <div className="relative ms-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={`Rechercher un(e) ${label}…`}
            className="ps-8"
            aria-label="Rechercher"
          />
        </div>
      </div>

      {selected.size ? (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
          <span className="me-auto text-sm font-medium">{selected.size} sélectionné(s)</span>
          <Button size="sm" onClick={() => setConfirm(true)} disabled={pending}><Sparkles /> Compléter les champs vides</Button>
          <Button size="sm" variant="outline" onClick={() => runRobots(true)} disabled={pending}><EyeOff /> Noindex</Button>
          <Button size="sm" variant="outline" onClick={() => runRobots(false)} disabled={pending}>Index</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Annuler</Button>
        </div>
      ) : null}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 ps-4">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={(on) => setSelected((s) => { const n = new Set(s); for (const r of visible) { if (on) n.add(r.id); else n.delete(r.id); } return n; })}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>{kind === "category" ? "Catégorie" : "Produit"}</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell" title={`Titre affiché, ${SEO_LIMITS.titleMin}–${SEO_LIMITS.titleMax} caractères`}>Titre</TableHead>
              <TableHead className="hidden lg:table-cell" title={`Méta-description, ${SEO_LIMITS.descMin}–${SEO_LIMITS.descMax} caractères`}>Desc.</TableHead>
              <TableHead className="hidden sm:table-cell">Alertes</TableHead>
              <TableHead className="w-20 pe-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => (
              <TableRow key={r.id} data-state={selected.has(r.id) ? "selected" : undefined}>
                <TableCell className="ps-4"><Checkbox checked={selected.has(r.id)} onCheckedChange={(on) => toggle(r.id, on === true)} aria-label={`Sélectionner ${r.name}`} /></TableCell>
                <TableCell className="max-w-[22rem]">
                  <Link href={`/admin/seo/edit/${kind}/${r.id}`} className="line-clamp-1 font-medium hover:text-orange-strong hover:underline">{r.name}</Link>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{r.context ?? r.publicPath}{r.isPublic ? "" : " · masqué en boutique"}</span>
                  {r.missing.length ? <span className="line-clamp-1 text-xs text-amber-700 dark:text-amber-400" title={r.missing.join("\n")}>À corriger : {r.missing.join(", ")}</span> : null}
                </TableCell>
                <TableCell><SeoStatusBadge status={r.status} /></TableCell>
                <TableCell className="hidden md:table-cell"><ScoreBar score={r.score} /></TableCell>
                <TableCell className="hidden lg:table-cell"><LengthPill value={r.titleLength} min={SEO_LIMITS.titleMin} max={SEO_LIMITS.titleMax} /></TableCell>
                <TableCell className="hidden lg:table-cell"><LengthPill value={r.descriptionLength} min={SEO_LIMITS.descMin} max={SEO_LIMITS.descMax} /></TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="flex flex-wrap gap-1">
                    {r.duplicateTitle ? <Flag tone="red">Titre dupliqué</Flag> : null}
                    {r.duplicateDescription ? <Flag tone="red">Desc. dupliquée</Flag> : null}
                    {r.noindex ? <Flag tone="zinc">Noindex</Flag> : null}
                    {r.hasCanonical ? <Flag tone="zinc">Canonical</Flag> : null}
                    {r.hasArabic ? <Flag tone="sky">AR</Flag> : null}
                  </span>
                </TableCell>
                <TableCell className="pe-4">
                  <div className="flex justify-end">
                    <Button asChild variant="ghost" size="icon-sm" aria-label="Modifier le SEO"><Link href={`/admin/seo/edit/${kind}/${r.id}`}><Pencil /></Link></Button>
                    {r.isPublic ? <Button asChild variant="ghost" size="icon-sm" aria-label="Voir la page"><a href={r.publicPath} target="_blank" rel="noopener"><ExternalLink /></a></Button> : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 ? <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">Aucun résultat.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </Card>

      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
          <span className="tabular-nums text-muted-foreground">Page {page} / {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
        </div>
      ) : null}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Compléter les champs SEO vides ?</AlertDialogTitle>
            <AlertDialogDescription>
              Des suggestions seront écrites uniquement dans les champs <strong>vides</strong> des {selected.size} {label}(s) sélectionné(e)s
              (titre, méta-description, mots-clés, Open Graph{kind === "category" ? ", textes de catégorie" : ", textes ALT des images"}, et arabe quand la famille de produits est reconnue).
              Aucun contenu existant ne sera modifié. Relisez ensuite chaque page pour personnaliser les textes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); runSuggestions(); }} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Sparkles />} Compléter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Flag({ tone, children }: { tone: "red" | "zinc" | "sky"; children: React.ReactNode }) {
  const cls = {
    red: "bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300",
    zinc: "bg-zinc-200 text-zinc-900 dark:bg-zinc-500/20 dark:text-zinc-300",
    sky: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-300",
  }[tone];
  return <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", cls)}>{children}</span>;
}
