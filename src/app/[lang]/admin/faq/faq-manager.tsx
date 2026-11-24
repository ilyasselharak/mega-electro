"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteFaq, saveFaq, type FaqInput } from "@/server/actions/store-config";

type Faq = { id: string; question: string; answer: string; questionAr: string; answerAr: string; categoryId: string | null; categoryName: string | null; position: number; isActive: boolean };
const STORE = "__store__";
const EMPTY: FaqInput = { question: "", answer: "", questionAr: "", answerAr: "", categoryId: null, position: 0, isActive: true };

export function FaqManager({ faqs, categories }: { faqs: Faq[]; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<{ id: string | null; values: FaqInput } | null>(null);
  const v = editing?.values;
  const set = (patch: Partial<FaqInput>) => setEditing((e) => (e ? { ...e, values: { ...e.values, ...patch } } : e));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    start(async () => {
      const res = await saveFaq(editing.id, editing.values);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Question enregistrée");
      setEditing(null);
      router.refresh();
    });
  }

  function remove(f: Faq) {
    if (!confirm("Supprimer cette question ?")) return;
    start(async () => {
      const res = await deleteFaq(f.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Question supprimée");
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ id: null, values: { ...EMPTY, position: faqs.length } })}><Plus /> Nouvelle question</Button>
      </div>
      <Card className="divide-y py-0">
        {faqs.map((f) => (
          <div key={f.id} className={`flex items-start gap-4 p-5 ${f.isActive ? "" : "opacity-60"}`}>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{f.categoryName ?? "Toute la boutique"}</Badge>
                {f.questionAr && f.answerAr ? <Badge variant="outline">FR + AR</Badge> : <Badge variant="outline">FR seulement</Badge>}
                {f.isActive ? null : <Badge variant="outline">Masquée</Badge>}
              </div>
              <p className="font-medium">{f.question}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{f.answer}</p>
            </div>
            <div className="flex shrink-0">
              <Button variant="ghost" size="icon-sm" aria-label="Modifier" onClick={() => setEditing({ id: f.id, values: { question: f.question, answer: f.answer, questionAr: f.questionAr, answerAr: f.answerAr, categoryId: f.categoryId, position: f.position, isActive: f.isActive } })}><Pencil /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="Supprimer" disabled={pending} onClick={() => remove(f)}><Trash2 className="text-destructive" /></Button>
            </div>
          </div>
        ))}
        {faqs.length === 0 ? <p className="p-10 text-center text-sm text-muted-foreground">Aucune question. Les fiches produit n&apos;affichent la section FAQ que si des questions existent.</p> : null}
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Modifier la question" : "Nouvelle question"}</DialogTitle><DialogDescription>Réponses réelles uniquement (délais, garantie, installation…).</DialogDescription></DialogHeader>
          {v ? (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div className="space-y-1.5">
                  <Label>Affichée sur</Label>
                  <Select value={v.categoryId || STORE} onValueChange={(val) => set({ categoryId: val === STORE ? null : val })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={STORE}>Tous les produits</SelectItem>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label htmlFor="f-pos">Ordre</Label><Input id="f-pos" type="number" min={0} value={String(v.position)} onChange={(e) => set({ position: e.target.value as unknown as number })} /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="f-q">Question (français) *</Label><Input id="f-q" value={v.question} onChange={(e) => set({ question: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label htmlFor="f-a">Réponse (français) *</Label><Textarea id="f-a" rows={3} value={v.answer} onChange={(e) => set({ answer: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label htmlFor="f-qar">Question (arabe)</Label><Input id="f-qar" dir="rtl" lang="ar" value={v.questionAr ?? ""} onChange={(e) => set({ questionAr: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="f-aar">Réponse (arabe)</Label><Textarea id="f-aar" dir="rtl" lang="ar" rows={3} value={v.answerAr ?? ""} onChange={(e) => set({ answerAr: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">Sans traduction arabe, la question n&apos;apparaît que sur le site en français.</p>
              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">Visible sur les fiches produit <Switch checked={v.isActive} onCheckedChange={(c) => set({ isActive: c })} /></label>
              <DialogFooter><Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button></DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
