import { CartPageClient } from "./cart-page-client";
import { getDictionary } from "@/i18n/server";
import { localizedMetadata } from "@/lib/seo-server";
import { getSettings } from "@/server/queries/settings";

export async function generateMetadata() {
  const t = await getDictionary();
  return localizedMetadata({ title: t.cart.title, path: "/panier", noIndex: true });
}

export default async function CartPage() {
  const [t, settings] = await Promise.all([getDictionary(), getSettings()]);
  return (
    <div className="container-page py-6 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t.cart.title}</h1>
      <CartPageClient whatsapp={settings.whatsapp} freeShippingThreshold={settings.freeShippingThreshold} />
    </div>
  );
}
