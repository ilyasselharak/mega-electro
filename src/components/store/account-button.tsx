"use client";

import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import NextLink from "next/link";
import { Link, useI18n } from "@/i18n/client";

export function AccountButton() {
  const { t } = useI18n();
  const { data } = useSession();
  const router = useRouter();
  const user = data?.user;

  if (!user) {
    return (
      <Link href="/connexion" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label={t.header.signIn}>
        <User className="size-5.5" />
      </Link>
    );
  }
  const isStaff = user.role === "ADMIN" || user.role === "STAFF";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex size-11 items-center justify-center rounded-full hover:bg-muted" aria-label={t.header.account}>
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold uppercase text-primary-foreground">
          {user.name?.[0] ?? "?"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isStaff ? (
          <DropdownMenuItem asChild>
            <NextLink href="/admin"><LayoutDashboard /> {t.header.admin}</NextLink>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/compte"><Package /> {t.header.myOrders}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
        >
          <LogOut /> {t.header.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
