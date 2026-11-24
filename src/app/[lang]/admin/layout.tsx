import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { requireStaffPage } from "@/lib/session";
import { countPendingOrders } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin Mega Electro" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  const user = await requireStaffPage();
  const pendingOrders = await countPendingOrders();
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: (user.role as string) ?? "STAFF" }} pendingOrders={pendingOrders}>
      {children}
    </AdminShell>
  );
}
