import { ConvexError } from "convex/values";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireStaffPage } from "@/lib/session";
import { getLinkedProducts, getRemoteCatalog } from "@/server/queries/admin";
import { logger } from "@/lib/logger";
import { RemoteCatalog, type RemoteProduct } from "./remote-catalog";
import { SyncButton } from "./sync-button";

export const metadata = { title: "Electro Darna" };

export default async function ElectroDarnaPage() {
  await requireStaffPage();

  let remote: RemoteProduct[] = [];
  let error: string | null = null;
  try {
    remote = await getRemoteCatalog();
  } catch (err) {
    if (err instanceof ConvexError && typeof err.data === "string") error = err.data;
    else {
      logger.error("Electro Darna catalog fetch failed", { err });
      error = "Impossible de joindre Electro Darna pour le moment. Réessayez plus tard.";
    }
  }

  const linked = await getLinkedProducts();
  const lastSync = linked.reduce<number | null>((max, p) => (p.sourceSyncedAt && (!max || p.sourceSyncedAt > max) ? p.sourceSyncedAt : max), null);

  return (
    <>
      <PageHeader
        title="Electro Darna"
        description="Produits disponibles chez Electro Darna. Clonez-les dans votre catalogue : leur stock est ensuite synchronisé automatiquement (toutes les 15 min)."
        actions={<SyncButton linkedCount={linked.length} lastSync={lastSync ? new Date(lastSync).toISOString() : null} />}
      />
      {error ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{error}</CardContent></Card>
      ) : (
        <RemoteCatalog products={remote} linked={Object.fromEntries(linked.map((p) => [p.sourceId, { id: p.id, stock: p.stock, price: p.price }]))} />
      )}
    </>
  );
}
