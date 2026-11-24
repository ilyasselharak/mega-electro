"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteProduct, duplicateProduct } from "@/server/actions/products";

export function ProductRowActions({ id, name, withLabels }: { id: string; name: string; withLabels?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const duplicate = () =>
    start(async () => {
      const res = await duplicateProduct(id);
      if (res.ok) {
        toast.success("Produit dupliqué (brouillon)");
        router.push(`/admin/products/${res.data.id}`);
      } else toast.error(res.error);
    });
  const remove = () =>
    start(async () => {
      const res = await deleteProduct(id);
      if (res.ok) {
        toast.success("Produit supprimé (ou archivé s'il a déjà été vendu)");
        router.push("/admin/products");
        router.refresh();
      } else toast.error(res.error);
    });

  return (
    <>
      {withLabels ? (
        <>
          <Button variant="outline" onClick={duplicate} disabled={pending}><Copy /> Dupliquer</Button>
          <Button variant="destructive" onClick={() => setConfirm(true)} disabled={pending}><Trash2 /> Supprimer</Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={duplicate}><Copy /> Dupliquer</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setConfirm(true)}><Trash2 /> Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {name} » ?</AlertDialogTitle>
            <AlertDialogDescription>Les images seront supprimées du stockage. Si le produit a déjà été commandé, il sera archivé pour conserver l&apos;historique.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
