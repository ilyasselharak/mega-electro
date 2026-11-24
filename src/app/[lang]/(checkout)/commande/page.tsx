import { CheckoutForm } from "./checkout-form";
import { getDictionary } from "@/i18n/server";
import { localizedMetadata } from "@/lib/seo-server";
import { getCurrentUser } from "@/lib/session";
import { getDeliveryConfig } from "@/server/queries/delivery";
import { getSettings } from "@/server/queries/settings";

export async function generateMetadata() {
  const t = await getDictionary();
  return localizedMetadata({ title: t.checkout.title, path: "/commande", noIndex: true });
}

export default async function CheckoutPage() {
  const [user, config, settings, t] = await Promise.all([getCurrentUser(), getDeliveryConfig(), getSettings(), getDictionary()]);
  return (
    <div className="container-page py-6 sm:py-10">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t.checkout.title}</h1>
      <CheckoutForm
        config={config}
        whatsapp={settings.whatsapp}
        defaults={{ fullName: user?.name ?? "", email: user?.email ?? "", phone: (user as { phone?: string } | null)?.phone ?? "" }}
      />
    </div>
  );
}
