"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { rollbackSeoBatch } from "@/server/actions/seo";

export function RollbackButton({ batchId }: { batchId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Undo2 />} Annuler ce lot</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler le lot {batchId} ?</AlertDialogTitle>
          <AlertDialogDescription>Les champs retrouvent leur valeur d&apos;avant le lot. Les champs modifiés depuis restent inchangés et seront listés.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Garder</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              start(async () => {
                const res = await rollbackSeoBatch(batchId);
                if (!res.ok) return void toast.error(res.error);
                toast.success(`${res.data.restored} champ(s) restauré(s)`, { description: res.data.conflicts.length ? `Non restaurés (modifiés depuis) : ${res.data.conflicts.slice(0, 5).join(", ")}` : undefined });
                router.refresh();
              })
            }
          >
            Annuler le lot
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
