"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, ShoppingBag, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderSummary } from "@/components/store/order-summary";
import { usePrice } from "@/components/store/price";
import { WhatsAppIcon } from "@/components/store/whatsapp-button";
import { cartSubtotal, useCart } from "@/hooks/use-cart";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { Link, useI18n, useLocalePath } from "@/i18n/client";
import { fmt, plural } from "@/i18n/fmt";
import { createOrder } from "@/server/actions/checkout";
import type { DeliveryConfigData } from "@/server/queries/delivery";
import { MOROCCAN_CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const OTHER = "__other__";
const PHONE_RE = /^(?:\+212|00212|0)[5-7]\d{8}$/;

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="text-xs font-medium text-destructive" role="alert">{message}</p> : null;
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function CheckoutForm({ defaults, config, whatsapp }: { defaults: { fullName: string; email: string; phone: string }; config: DeliveryConfigData; whatsapp: string }) {
  const { t, locale } = useI18n();
  const price = usePrice();
  const router = useRouter();
  const lp = useLocalePath();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const zones = config.zones;
  const [citySelect, setCitySelect] = useState("");

  const schema = useMemo(
    () =>
      z.object({
        fullName: z.string().trim().min(3, t.checkout.errors.fullName).max(100),
        phone: z.string().trim().refine((v) => PHONE_RE.test(v.replace(/[\s.-]/g, "")), t.checkout.errors.phone),
        email: z.union([z.literal(""), z.email(t.checkout.errors.email)]).optional(),
        city: z.string().trim().min(2, t.checkout.errors.city).max(80),
        address: z.string().trim().min(8, t.checkout.errors.address).max(300),
        note: z.string().max(500).optional(),
        website: z.string().optional(),
      }),
    [t],
  );
  type FormIn = z.input<typeof schema>;
  type FormOut = z.output<typeof schema>;

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaults, city: "", address: "", note: "", website: "" },
    mode: "onTouched",
  });
  const { errors } = form.formState;
  const city = form.watch("city") ?? "";
  const debouncedCity = useDebounced(city.trim(), 250);
  const { data: quote, isFetching, isEmpty, mounted } = useCartQuote(debouncedCity);
  const d = quote?.delivery;
  const cityChosen = Boolean(d?.cityChosen);
  const blocked = cityChosen && d ? !d.deliverable || !d.cod : !config.codEnabled;

  const waLink = () => {
    const text = fmt(t.checkout.whatsappCheckoutText, {
      city: city || "—",
      lines: lines.map((l) => `• ${l.name} x${l.quantity} — ${price(l.price * l.quantity)}`).join("\n"),
      total: price(cartSubtotal(lines)),
    });
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  };

  function onSubmit(values: FormOut) {
    if (blocked) return;
    setServerError(null);
    startTransition(async () => {
      const res = await createOrder({
        ...values,
        phone: values.phone.replace(/[\s.-]/g, ""),
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      if (!res.ok) {
        setServerError(res.error);
        if (res.fieldErrors) for (const [k, v] of Object.entries(res.fieldErrors)) if (v?.[0]) form.setError(k as keyof FormIn, { message: v[0] });
        toast.error(res.error);
        return;
      }
      clear();
      router.replace(lp(`/commande/confirmation/${res.data.number}`));
    });
  }

  if (!mounted) return <div className="h-96" aria-busy />;

  if (isEmpty) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border bg-card p-10 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
        <p className="text-lg font-semibold">{t.checkout.emptyCart}</p>
        <Button asChild className="rounded-full"><Link href="/recherche">{t.cart.discover}</Link></Button>
      </div>
    );
  }

  const eta = d?.eta ? (d.eta.min === d.eta.max ? plural(locale, d.eta.min, t.checkout.sameDays) : plural(locale, d.eta.max, t.checkout.days, { min: d.eta.min, max: d.eta.max })) : null;
  const field = "h-12 text-base sm:text-sm";
  const submitLabel = pending ? t.checkout.placing : t.checkout.place;

  return (
    <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit, () => toast.error(t.checkout.errors.fix))} noValidate className="grid gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 lg:pb-0">
      <div className="space-y-6">
        <section className="space-y-5 rounded-3xl border bg-card p-5 sm:p-7" aria-labelledby="sec-contact">
          <h2 id="sec-contact" className="text-lg font-bold">{t.checkout.contact}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="fullName">{t.checkout.fullName} *</Label>
              <Input id="fullName" autoComplete="name" className={field} aria-invalid={!!errors.fullName} aria-describedby="err-fullName" {...form.register("fullName")} />
              <FieldError id="err-fullName" message={errors.fullName?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t.checkout.phone} *</Label>
              <Input id="phone" type="tel" inputMode="tel" dir="ltr" autoComplete="tel" placeholder="06 12 34 56 78" className={cn(field, "text-start rtl:text-right")} aria-invalid={!!errors.phone} aria-describedby="hint-phone err-phone" {...form.register("phone")} />
              {errors.phone ? <FieldError id="err-phone" message={errors.phone.message} /> : <p id="hint-phone" className="text-xs text-muted-foreground">{t.checkout.phoneHint}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.checkout.email}</Label>
              <Input id="email" type="email" dir="ltr" autoComplete="email" className={cn(field, "text-start rtl:text-right")} aria-invalid={!!errors.email} aria-describedby="err-email" {...form.register("email")} />
              <FieldError id="err-email" message={errors.email?.message} />
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border bg-card p-5 sm:p-7" aria-labelledby="sec-delivery">
          <h2 id="sec-delivery" className="text-lg font-bold">{t.checkout.delivery}</h2>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={zones.length ? "city-select" : "city"}>{t.checkout.city} *</Label>
              {zones.length ? (
                <>
                  <select
                    id="city-select"
                    value={citySelect}
                    onChange={(e) => {
                      setCitySelect(e.target.value);
                      form.setValue("city", e.target.value === OTHER ? "" : e.target.value, { shouldValidate: e.target.value !== OTHER, shouldTouch: true });
                    }}
                    className={cn("w-full rounded-md border border-input bg-background px-3 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50", field)}
                    aria-invalid={!!errors.city}
                    aria-describedby="err-city"
                  >
                    <option value="" disabled>{t.checkout.cityPlaceholder}</option>
                    {zones.map((z) => <option key={z.city} value={z.city}>{locale === "ar" && z.cityAr ? z.cityAr : z.city}</option>)}
                    {config.acceptUnlistedCities ? <option value={OTHER}>{t.checkout.otherCity}</option> : null}
                  </select>
                  {citySelect === OTHER ? (
                    <Input id="city" autoComplete="address-level2" placeholder={t.checkout.cityOther} aria-label={t.checkout.cityOther} className={cn(field, "mt-2")} aria-invalid={!!errors.city} {...form.register("city")} />
                  ) : null}
                </>
              ) : (
                <>
                  <Input id="city" list="cities" autoComplete="address-level2" placeholder={t.checkout.cityPlaceholder} className={field} aria-invalid={!!errors.city} aria-describedby="err-city" {...form.register("city")} />
                  <datalist id="cities">{MOROCCAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                </>
              )}
              <FieldError id="err-city" message={errors.city?.message} />
              <div aria-live="polite" className="pt-1 text-sm">
                {!cityChosen ? (
                  <p className="flex items-center gap-2 text-muted-foreground"><Truck className="size-4 shrink-0" aria-hidden /> {t.checkout.pickCity}</p>
                ) : d && !d.deliverable ? (
                  <p className="flex items-start gap-2 text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {t.checkout.deliveryUnavailable}</p>
                ) : quote && quote.shippingFee !== null ? (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                    <span className="font-medium">{quote.shippingFee === 0 ? t.checkout.deliveryFree : fmt(t.checkout.deliveryFee, { fee: price(quote.shippingFee) })}</span>
                    {eta ? <span className="text-muted-foreground">— {fmt(t.checkout.deliveryTime, { time: eta })}</span> : null}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">{t.checkout.address} *</Label>
              <Textarea id="address" rows={2} autoComplete="street-address" placeholder={t.checkout.addressPlaceholder} className="text-base sm:text-sm" aria-invalid={!!errors.address} aria-describedby="err-address" {...form.register("address")} />
              <FieldError id="err-address" message={errors.address?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">{t.checkout.note}</Label>
              <Textarea id="note" rows={2} placeholder={t.checkout.notePlaceholder} className="text-base sm:text-sm" {...form.register("note")} />
            </div>
            {/* Honeypot: real users never fill it */}
            <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...form.register("website")} />
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border bg-card p-5 sm:p-7" aria-labelledby="sec-payment">
          <h2 id="sec-payment" className="text-lg font-bold">{t.checkout.payment}</h2>
          {!blocked ? (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-4" role="radio" aria-checked="true">
              <Wallet className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">{t.checkout.codLabel}</p>
                <p className="text-sm text-muted-foreground">{t.checkout.codText}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden /> {!config.codEnabled ? t.checkout.noPayment : d && !d.deliverable ? t.checkout.deliveryUnavailable : t.checkout.codUnavailable}</p>
              <Button asChild className="h-11 rounded-xl bg-[#25D366] text-[#063f2d] hover:bg-[#25D366]/90">
                <a href={waLink()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-5" /> {t.checkout.orderWhatsappInstead}</a>
              </Button>
            </div>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start" aria-labelledby="sec-summary">
        <div className="space-y-5 rounded-3xl border bg-card p-5 sm:p-7">
          <h2 id="sec-summary" className="text-lg font-bold">{t.checkout.summary} <span className="text-sm font-normal text-muted-foreground">({plural(locale, lines.reduce((s, l) => s + l.quantity, 0), t.checkout.items)})</span></h2>
          <OrderSummary quote={quote} loading={isFetching} />
          {serverError ? <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive" role="alert">{serverError}</p> : null}
          <Button type="submit" disabled={pending || blocked || !quote?.lines.length} className="hidden h-14 w-full rounded-2xl text-base font-semibold lg:flex">
            {pending ? <Loader2 className="animate-spin" /> : null} {submitLabel}
          </Button>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><ShieldCheck className="size-4 shrink-0 text-success" aria-hidden /> {t.checkout.callConfirm}</li>
            <li className="flex items-start gap-2"><Wallet className="size-4 shrink-0 text-success" aria-hidden /> {t.checkout.noOnlinePayment}</li>
          </ul>
          <p className="text-[11px] text-muted-foreground"><Link href="/conditions-generales" className="underline">{t.checkout.terms}</Link></p>
        </div>
      </aside>

      {/* Mobile: total and confirm always reachable */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{quote?.shippingFee !== null && quote ? t.checkout.total : t.cart.subtotal}</p>
            <p className="font-heading text-lg font-bold tabular-nums">{quote ? price(quote.total) : "…"}</p>
          </div>
          <Button type="submit" disabled={pending || blocked || !quote?.lines.length} className="h-12 shrink-0 rounded-xl px-6 text-base">
            {pending ? <Loader2 className="animate-spin" /> : null} {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
