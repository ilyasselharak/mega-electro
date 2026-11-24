"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { syncElectroDarnaNow } from "@/server/actions/electrodarna";

export function SyncButton({ linkedCount, lastSync }: { linkedCount: number; lastSync: string | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3">
      {lastSync ? <span className="text-xs text-muted-foreground">Dernière synchro : {formatDate(new Date(lastSync), { dateStyle: "short", timeStyle: "short" })}</span> : null}
      <Button
        variant="outline"
        disabled={pending || linkedCount === 0}
        onClick={() =>
          start(async () => {
            const res = await syncElectroDarnaNow();
            if (res.ok) {
              toast.success(`${res.data.checked} produit(s) vérifié(s), ${res.data.updated} mis à jour, ${res.data.outOfStock} en rupture`);
              router.refresh();
            } else toast.error(res.error);
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />} Synchroniser le stock
      </Button>
    </div>
  );
}
