"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { adjustStock } from "@/server/actions/admin";

const REASONS = { RESTOCK: "Réapprovisionnement", ADJUSTMENT: "Correction d'inventaire", RETURN: "Retour client", DAMAGE: "Casse / perte" } as const;

export function StockAdjust({ productId, stock }: { productId: string; stock: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState<keyof typeof REASONS>("RESTOCK");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const n = Number(delta);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" size="sm"><SlidersHorizontal /> Ajuster</Button></PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div className="space-y-1.5">
          <Label>Quantité (+ entrée / − sortie)</Label>
          <Input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="+10 ou -2" autoFocus />
          {delta && Number.isInteger(n) ? <p className="text-xs text-muted-foreground">Stock : {stock} → <strong>{stock + n}</strong></p> : null}
        </div>
        <div className="space-y-1.5">
          <Label>Motif</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as keyof typeof REASONS)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(REASONS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (facultatif)" />
        <Button
          className="w-full"
          disabled={pending || !Number.isInteger(n) || n === 0}
          onClick={() =>
            start(async () => {
              const res = await adjustStock({ productId, delta: n, reason, note });
              if (res.ok) {
                toast.success(`Stock mis à jour : ${res.data.stock}`);
                setOpen(false);
                setDelta("");
                setNote("");
                router.refresh();
              } else toast.error(res.error);
            })
          }
        >
          {pending ? <Loader2 className="animate-spin" /> : null} Valider
        </Button>
      </PopoverContent>
    </Popover>
  );
}
