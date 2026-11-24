"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/logo";
import { AdminNav } from "@/components/admin/nav";
import { signOut } from "@/lib/auth-client";

export function AdminShell({ user, pendingOrders, children }: { user: { name: string; email: string; role: string }; pendingOrders: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isAdmin = user.role === "ADMIN";
  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5"><Logo href="/admin" /></div>
        <AdminNav pendingOrders={pendingOrders} isAdmin={isAdmin} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="-ms-2 inline-flex size-10 items-center justify-center rounded-lg hover:bg-muted lg:hidden" aria-label="Menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col gap-0 bg-sidebar p-0">
              <SheetHeader className="h-16 justify-center border-b px-5">
                <SheetTitle asChild><div><Logo href="/admin" /></div></SheetTitle>
                <SheetDescription className="sr-only">Navigation de l&apos;administration</SheetDescription>
              </SheetHeader>
              <AdminNav pendingOrders={pendingOrders} isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="lg:hidden"><Logo href="/admin" /></div>
          <div className="ms-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 pe-3 hover:bg-muted">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold uppercase text-primary-foreground">{user.name[0]}</span>
                <span className="hidden text-start text-sm sm:block">
                  <span className="block font-medium leading-4">{user.name}</span>
                  <span className="block text-xs text-muted-foreground">{user.role === "ADMIN" ? "Administrateur" : "Équipe"}</span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.push("/connexion");
                  }}
                >
                  <LogOut /> Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
