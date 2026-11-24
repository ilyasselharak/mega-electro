"use client";

import { useLocalePath, useI18n } from "@/i18n/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const lp = useLocalePath();
  const { t } = useI18n();
  return (
    <Button
      variant="outline"
      className="rounded-full"
      onClick={async () => {
        await signOut();
        router.push(lp("/"));
        router.refresh();
      }}
    >
      <LogOut /> {t.header.signOut}
    </Button>
  );
}
