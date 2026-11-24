"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteRedirect, saveRedirect } from "@/server/actions/seo";
import { formatDate } from "@/lib/utils";

type Redirect = { id: string; from: string; to: string; statusCode: number; note: string | null; auto: boolean; updatedAt: number };
const EMPTY = { from: "", to: "", statusCode: "301", note: "" };

export function RedirectsManager({ redirects }: { redirects: Redirect[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [q, setQ] = useState("");

  const list = redirects.filter((r) => !q || `${r.from} ${r.to}`.toLowerCase().includes(q.toLowerCase()));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveRedirect(editing, { ...form, statusCode: Number(form.statusCode) });
      if (!res.ok) return void toast.error(res.error);
      toast.success(editing ? "Redirection modifiée" : "Redirection ajoutée");
      setForm(EMPTY);
      setEditing(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Supprimer cette redirection ? L'ancienne URL renverra une erreur 404.")) return;
    start(async () => {
      const res = await deleteRedirect(id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Redirection supprimée");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{editing ? "Modifier la redirection" : "Nouvelle redirection"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_1fr_120px]">
            <div className="space-y-1.5"><Label htmlFor="from">Ancienne URL (chemin)</Label><Input id="from" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder="/ancienne-page" required /></div>
            <div className="space-y-1.5"><Label htmlFor="to">Nouvelle URL</Label><Input id="to" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="/categorie/refrigerateurs" required /></div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.statusCode} onValueChange={(statusCode) => setForm({ ...form, statusCode })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="301">301 (permanente)</SelectItem><SelectItem value="302">302 (temporaire)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2"><Label htmlFor="note">Note (interne)</Label><Input id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={pending} className="flex-1">{pending ? <Loader2 className="animate-spin" /> : <Plus />} {editing ? "Enregistrer" : "Ajouter"}</Button>
              {editing ? <Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm(EMPTY); }}>Annuler</Button> : null}
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Les changements de slug (produits, catégories, marques) créent automatiquement une redirection 301. Les redirections sont appliquées en moins d&apos;une minute.</p>
        </CardContent>
      </Card>

      <Card className="py-0">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <p className="text-sm font-medium">{redirects.length} redirection(s)</p>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" className="w-48" aria-label="Filtrer les redirections" />
        </div>
        <Table>
          <TableHeader><TableRow><TableHead className="ps-5">Source → destination</TableHead><TableHead>Code</TableHead><TableHead className="hidden md:table-cell">Origine</TableHead><TableHead className="hidden md:table-cell">Modifiée</TableHead><TableHead className="w-24 pe-5" /></TableRow></TableHeader>
          <TableBody>
            {list.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="ps-5 font-mono text-xs">
                  <span className="flex flex-wrap items-center gap-1.5"><span>{r.from}</span><ArrowRight className="size-3.5 text-muted-foreground" /><span className="text-primary">{r.to}</span></span>
                  {r.note ? <span className="font-sans text-muted-foreground">{r.note}</span> : null}
                </TableCell>
                <TableCell className="tabular-nums">{r.statusCode}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{r.auto ? "Automatique" : "Manuelle"}</TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{formatDate(r.updatedAt, { dateStyle: "short" })}</TableCell>
                <TableCell className="pe-5">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon-sm" aria-label="Modifier" onClick={() => { setEditing(r.id); setForm({ from: r.from, to: r.to, statusCode: String(r.statusCode), note: r.note ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" aria-label="Supprimer" disabled={pending} onClick={() => remove(r.id)}><Trash2 className="text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aucune redirection.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
