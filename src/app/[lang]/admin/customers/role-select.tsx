"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setUserRole } from "@/server/actions/admin";

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Select
      value={role}
      disabled={disabled || pending}
      onValueChange={(v) =>
        start(async () => {
          const res = await setUserRole(userId, v as "CUSTOMER" | "STAFF" | "ADMIN");
          if (res.ok) {
            toast.success("Rôle mis à jour");
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="CUSTOMER">Client</SelectItem>
        <SelectItem value="STAFF">Équipe</SelectItem>
        <SelectItem value="ADMIN">Administrateur</SelectItem>
      </SelectContent>
    </Select>
  );
}
