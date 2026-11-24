"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addOrderNote, updateOrderCustomer, updateOrderStatus } from "@/server/actions/orders";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

const PRIMARY: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Confirmer",
  PROCESSING: "En préparation",
  SHIPPED: "Marquer expédiée",
  DELIVERED: "Marquer livrée",
};

export function OrderActions({ orderId, allowed }: { orderId: string; allowed: OrderStatus[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<OrderStatus | null>(null);

  function apply(status: OrderStatus) {
    start(async () => {
      const res = await updateOrderStatus({ orderId, status });
      if (res.ok) {
        toast.success(`Statut mis à jour : ${ORDER_STATUS_LABELS[status]}`);
        router.refresh();
      } else toast.error(res.error);
      setConfirm(null);
    });
  }

  if (!allowed.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((s) => {
        const destructive = s === "CANCELLED" || s === "RETURNED";
        return (
          <Button
            key={s}
            variant={destructive ? "destructive" : PRIMARY[s] && allowed[0] === s ? "default" : "outline"}
            disabled={pending}
            onClick={() => (destructive ? setConfirm(s) : apply(s))}
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            {PRIMARY[s] ?? (s === "CANCELLED" ? "Annuler" : "Retour")}
          </Button>
        );
      })}
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "CANCELLED" ? "Annuler cette commande ?" : "Enregistrer un retour ?"}</AlertDialogTitle>
            <AlertDialogDescription>Les quantités seront automatiquement remises en stock. Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && apply(confirm)}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function OrderNoteForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addOrderNote(orderId, text);
          if (res.ok) {
            setText("");
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ajouter une note (ex : client injoignable, rappeler demain)" />
      <Button type="submit" variant="outline" disabled={pending || !text.trim()}>Ajouter</Button>
    </form>
  );
}

type CustomerFields = { fullName: string; phone: string; city: string; address: string; internalNote: string };

export function CustomerEditDialog({ orderId, initial }: { orderId: string; initial: CustomerFields }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initial);
  const [pending, start] = useTransition();
  const field = (k: keyof CustomerFields) => ({ value: values[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value })) });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Modifier"><Pencil /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Modifier les informations client</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5"><Label>Nom</Label><Input {...field("fullName")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Téléphone</Label><Input {...field("phone")} /></div>
            <div className="space-y-1.5"><Label>Ville</Label><Input {...field("city")} /></div>
          </div>
          <div className="space-y-1.5"><Label>Adresse</Label><Textarea rows={2} {...field("address")} /></div>
          <div className="space-y-1.5"><Label>Note interne</Label><Textarea rows={2} {...field("internalNote")} /></div>
        </div>
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await updateOrderCustomer(orderId, values);
                if (res.ok) {
                  toast.success("Informations mises à jour");
                  setOpen(false);
                  router.refresh();
                } else toast.error(res.error);
              })
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : null} Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
