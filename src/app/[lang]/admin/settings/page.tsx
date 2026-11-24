import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "./settings-form";
import { getAdminSettings } from "@/server/queries/admin";
import { isAdmin, requireStaffPage } from "@/lib/session";
import { toDirhams } from "@/lib/money";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireStaffPage();
  if (!isAdmin(user)) redirect("/admin");
  const s = await getAdminSettings();
  return (
    <>
      <PageHeader title="Paramètres" description="Informations de la boutique, livraison et contact." />
      <SettingsForm
        initial={{
          storeName: s.storeName,
          tagline: s.tagline,
          phone: s.phone,
          whatsapp: s.whatsapp,
          email: s.email,
          address: s.address,
          shippingFee: toDirhams(s.shippingFee),
          freeShippingThreshold: toDirhams(s.freeShippingThreshold),
          announcement: s.announcement ?? "",
          facebookUrl: s.facebookUrl ?? "",
          instagramUrl: s.instagramUrl ?? "",
          tiktokUrl: s.tiktokUrl ?? "",
        }}
      />
    </>
  );
}
