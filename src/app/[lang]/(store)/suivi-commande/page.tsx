import { TrackOrderForm } from "./track-form";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { getDictionary } from "@/i18n/server";
import { localizedMetadata } from "@/lib/seo-server";
import { getSeoSettings } from "@/server/queries/seo";

export async function generateMetadata() {
  const t = await getDictionary();
  return localizedMetadata({ title: t.track.title, description: t.track.description, path: "/suivi-commande", seo: await getSeoSettings() });
}

export default async function TrackOrderPage() {
  const t = await getDictionary();
  return (
    <div className="container-page max-w-2xl space-y-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ name: t.track.title, path: "/suivi-commande" }]} />
      <h1 className="text-3xl font-extrabold">{t.track.title}</h1>
      <TrackOrderForm />
    </div>
  );
}
