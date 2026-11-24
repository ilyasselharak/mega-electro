import { PageHeader } from "@/components/admin/page-header";
import { DeliveryManager } from "./delivery-manager";
import { getAdminSettings, listDeliveryZones } from "@/server/queries/admin";
import { isAdmin, requireStaffPage } from "@/lib/session";

export const metadata = { title: "Livraison & paiement" };

export default async function DeliveryPage() {
  const user = await requireStaffPage();
  const [zones, settings] = await Promise.all([listDeliveryZones(), getAdminSettings()]);
  return (
    <>
      <PageHeader title="Livraison & paiement" description="Tarifs et délais par ville, paiement à la livraison. Les frais affichés au client sont ceux facturés." />
      <DeliveryManager
        zones={zones}
        payment={{ codEnabled: settings.codEnabled, acceptUnlistedCities: settings.acceptUnlistedCities }}
        defaultFee={settings.shippingFee}
        freeShippingThreshold={settings.freeShippingThreshold}
        canEdit={isAdmin(user)}
      />
    </>
  );
}
