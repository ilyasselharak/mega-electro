import { Link } from "@/i18n/client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreImage } from "@/components/shared/store-image";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/lib/convex";
import { LAST_ORDER_COOKIE } from "@/lib/constants";
import { formatPrice } from "@/lib/money";
import { localizedMetadata } from "@/lib/seo-server";
import { getSettings } from "@/server/queries/settings";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const t = await getDictionary();
  return localizedMetadata({ title: t.checkout.confirmationTitle, path: "/commande/confirmation", noIndex: true });
}

export default async function ConfirmationPage({ params }: PageProps<"/[lang]/commande/confirmation/[number]">) {
  const { number } = await params;
  if (!/^DZ\d{6}-[A-Z0-9]{4}$/.test(number)) notFound();
  const jar = await cookies();
  const [cookieNumber, token] = (jar.get(LAST_ORDER_COOKIE)?.value ?? "").split(".");
  // Details (PII) are only returned to the buyer's browser (cookie token) or the account owner
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const price = (c: number) => formatPrice(c, locale);
  const [order, settings] = await Promise.all([
    fetchAuthQuery(api.orders.confirmation, { number, token: cookieNumber === number ? token : undefined }),
    getSettings(),
  ]);
  if (!order) notFound();

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="space-y-6 rounded-3xl border bg-card p-6 text-center sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-9 text-success" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">{t.checkout.confirmationTitle}</h1>
          <p className="text-muted-foreground">
            {fmt(t.checkout.confirmationNumber, { number: "" })}<strong className="font-mono text-foreground" dir="ltr">{order.number}</strong>
          </p>
          <p className="text-sm text-muted-foreground">{order.canSee ? fmt(t.checkout.confirmationText, { phone: order.phone }) : t.checkout.callConfirm}</p>
        </div>

        {order.canSee ? (
          <div className="space-y-4 rounded-2xl bg-muted/50 p-4 text-start sm:p-5">
            <ul className="divide-y">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-2.5">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-white">
                    <StoreImage imageKey={it.imageKey} alt={it.name} fill sizes="48px" className="object-contain p-0.5" />
                  </span>
                  <span className="flex-1 text-sm">{it.name} <span className="text-muted-foreground">× {it.quantity}</span></span>
                  <span className="text-sm font-semibold tabular-nums">{price(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{order.shippingFee ? price(order.shippingFee) : t.cart.free}</dd></div>
              <div className="flex justify-between text-base font-bold"><dt>{t.checkout.totalToPay}</dt><dd className="tabular-nums">{price(order.total)}</dd></div>
            </dl>
            <div className="border-t pt-3 text-sm">
              <p className="font-semibold">{t.checkout.deliveryTo}</p>
              <p className="text-muted-foreground">{order.fullName} — <span dir="ltr">{order.phone}</span><br />{order.address}, {order.city}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="h-12 rounded-xl px-6"><Link href="/">{t.cart.continue}</Link></Button>
          <Button asChild variant="outline" className="h-12 rounded-xl px-6"><Link href="/suivi-commande">{t.checkout.confirmationTrack}</Link></Button>
        </div>
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Phone className="size-4" aria-hidden /> {t.checkout.question} <span dir="ltr">{settings.phone}</span>
        </p>
      </div>
    </div>
  );
}
