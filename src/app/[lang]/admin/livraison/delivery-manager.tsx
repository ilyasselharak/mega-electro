"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteZone, savePaymentSettings, saveZone, type ZoneInput } from "@/server/actions/store-config";
import { formatPrice, toDirhams } from "@/lib/money";

type Zone = { id: string; city: string; cityAr: string | null; fee: number; freeThreshold: number | null; etaMinDays: number; etaMaxDays: number; codAvailable: boolean; isActive: boolean; position: number };
const EMPTY: ZoneInput = { city: "", cityAr: "", fee: 30, freeThreshold: "", etaMinDays: 1, etaMaxDays: 3, codAvailable: true, isActive: true, position: 0 };

export function DeliveryManager({ zones, payment, defaultFee, freeShippingThreshold, canEdit }: { zones: Zone[]; payment: { codEnabled: boolean; acceptUnlistedCities: boolean }; defaultFee: number; freeShippingThreshold: number; canEdit: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<{ id: string | null; values: ZoneInput } | null>(null);
  const [pay, setPay] = useState(payment);

  function savePay(next: typeof pay) {
    setPay(next);
    start(async () => {
      const res = await savePaymentSettings(next);
      if (!res.ok) {
        setPay(pay);
        return void toast.error(res.error);
      }
      toast.success("Paramètres enregistrés — la boutique est mise à jour.");
      router.refresh();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    start(async () => {
      const res = await saveZone(editing.id, editing.values);
      if (!res.ok) return void toast.error(res.error);
      toast.success(editing.id ? "Ville modifiée" : "Ville ajoutée");
      setEditing(null);
      router.refresh();
    });
  }

  function remove(z: Zone) {
    if (!confirm(`Supprimer la zone « ${z.city} » ?`)) return;
    start(async () => {
      const res = await deleteZone(z.id);
      if (!res.ok) return void toast.error(res.error);
      toast.success("Zone supprimée");
      router.refresh();
    });
  }

  const v = editing?.values;
  const set = (patch: Partial<ZoneInput>) => setEditing((e) => (e ? { ...e, values: { ...e.values, ...patch } } : e));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Paiement et villes desservies</CardTitle><CardDescription>Ces réglages s&apos;appliquent immédiatement au panier et à la commande.</CardDescription></CardHeader>
        <CardContent className="grid gap-3">
          <label className="flex items-center justify-between gap-4 rounded-lg border p-4 text-sm">
            <span><span className="font-medium">Paiement à la livraison</span><span className="block text-xs text-muted-foreground">Désactivé : la commande en ligne est remplacée par la commande sur WhatsApp.</span></span>
            <Switch checked={pay.codEnabled} disabled={!canEdit || pending} onCheckedChange={(c) => savePay({ ...pay, codEnabled: c })} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-lg border p-4 text-sm">
            <span>
              <span className="font-medium">Accepter les villes non listées</span>
              <span className="block text-xs text-muted-foreground">Au tarif par défaut ({formatPrice(defaultFee)}, gratuit dès {formatPrice(freeShippingThreshold)} — modifiable dans Paramètres). Désactivé : seules les villes ci-dessous sont livrées.</span>
            </span>
            <Switch checked={pay.acceptUnlistedCities} disabled={!canEdit || pending} onCheckedChange={(c) => savePay({ ...pay, acceptUnlistedCities: c })} />
          </label>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b py-5">
          <div><CardTitle>Zones de livraison</CardTitle><CardDescription>Frais, délai et paiement à la livraison par ville.</CardDescription></div>
          {canEdit ? <Button onClick={() => setEditing({ id: null, values: { ...EMPTY, position: zones.length } })}><Plus /> Ajouter une ville</Button> : null}
        </CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead className="ps-5">Ville</TableHead><TableHead>Frais</TableHead><TableHead className="hidden sm:table-cell">Gratuit dès</TableHead><TableHead>Délai</TableHead><TableHead>Paiement livraison</TableHead><TableHead className="w-24 pe-5" /></TableRow></TableHeader>
          <TableBody>
            {zones.map((z) => (
              <TableRow key={z.id} className={z.isActive ? "" : "opacity-60"}>
                <TableCell className="ps-5 font-medium">{z.city}{z.cityAr ? <span className="ms-2 text-muted-foreground" lang="ar">{z.cityAr}</span> : null}{z.isActive ? null : <Badge variant="outline" className="ms-2">Inactive</Badge>}</TableCell>
                <TableCell className="tabular-nums">{formatPrice(z.fee)}</TableCell>
                <TableCell className="hidden tabular-nums text-muted-foreground sm:table-cell">{z.freeThreshold != null ? formatPrice(z.freeThreshold) : "Par défaut"}</TableCell>
                <TableCell className="tabular-nums">{z.etaMinDays === z.etaMaxDays ? z.etaMinDays : `${z.etaMinDays}–${z.etaMaxDays}`} j</TableCell>
                <TableCell>{z.codAvailable ? <Badge variant="secondary">Oui</Badge> : <Badge variant="outline">Non</Badge>}</TableCell>
                <TableCell className="pe-5">
                  {canEdit ? (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${z.city}`} onClick={() => setEditing({ id: z.id, values: { city: z.city, cityAr: z.cityAr ?? "", fee: toDirhams(z.fee), freeThreshold: z.freeThreshold != null ? toDirhams(z.freeThreshold) : "", etaMinDays: z.etaMinDays, etaMaxDays: z.etaMaxDays, codAvailable: z.codAvailable, isActive: z.isActive, position: z.position } })}><Pencil /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Supprimer ${z.city}`} disabled={pending} onClick={() => remove(z)}><Trash2 className="text-destructive" /></Button>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {zones.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">Aucune zone : toutes les villes paient le tarif par défaut ({formatPrice(defaultFee)}).</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Modifier la ville" : "Nouvelle ville"}</DialogTitle><DialogDescription>Montants en dirhams.</DialogDescription></DialogHeader>
          {v ? (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="z-city">Ville *</Label><Input id="z-city" value={v.city} onChange={(e) => set({ city: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label htmlFor="z-city-ar">Nom en arabe</Label><Input id="z-city-ar" dir="rtl" lang="ar" value={v.cityAr ?? ""} onChange={(e) => set({ cityAr: e.target.value })} placeholder="الدار البيضاء" /></div>
              <div className="space-y-1.5"><Label htmlFor="z-fee">Frais de livraison (DH) *</Label><Input id="z-fee" type="number" min={0} step="0.01" value={String(v.fee)} onChange={(e) => set({ fee: e.target.value as unknown as number })} required /></div>
              <div className="space-y-1.5"><Label htmlFor="z-free">Gratuit dès (DH)</Label><Input id="z-free" type="number" min={0} step="0.01" value={String(v.freeThreshold ?? "")} onChange={(e) => set({ freeThreshold: e.target.value as unknown as number })} placeholder="Seuil par défaut" /></div>
              <div className="space-y-1.5"><Label htmlFor="z-min">Délai min. (jours)</Label><Input id="z-min" type="number" min={0} value={String(v.etaMinDays)} onChange={(e) => set({ etaMinDays: e.target.value as unknown as number })} /></div>
              <div className="space-y-1.5"><Label htmlFor="z-max">Délai max. (jours)</Label><Input id="z-max" type="number" min={0} value={String(v.etaMaxDays)} onChange={(e) => set({ etaMaxDays: e.target.value as unknown as number })} /></div>
              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm sm:col-span-2">Paiement à la livraison disponible <Switch checked={v.codAvailable} onCheckedChange={(c) => set({ codAvailable: c })} /></label>
              <label className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm sm:col-span-2">Zone active <Switch checked={v.isActive} onCheckedChange={(c) => set({ isActive: c })} /></label>
              <DialogFooter className="sm:col-span-2">
                <Button type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Enregistrer</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
