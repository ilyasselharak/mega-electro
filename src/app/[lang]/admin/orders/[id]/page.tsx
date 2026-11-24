import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoreImage } from "@/components/shared/store-image";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getAdminOrder } from "@/server/queries/admin";
import { requireStaffPage } from "@/lib/session";
import { formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { ORDER_TRANSITIONS } from "@/lib/constants";
import { OrderActions, OrderNoteForm, CustomerEditDialog } from "./order-actions";

export const metadata = { title: "Commande" };

export default async function OrderDetailPage({ params }: PageProps<"/[lang]/admin/orders/[id]">) {
  await requireStaffPage();
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const waPhone = order.phone.replace(/^0/, "212");

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Commandes</Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold">{order.number}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Passée le {formatDate(order.createdAt, { dateStyle: "full", timeStyle: "short" })} · Paiement à la livraison ({order.paymentStatus === "PAID" ? "payée" : order.paymentStatus === "REFUNDED" ? "remboursée" : "non payée"})</p>
        </div>
        <OrderActions orderId={order.id} allowed={ORDER_TRANSITIONS[order.status]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Articles</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-4 py-3">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                      <StoreImage imageKey={it.imageKey} alt={it.name} fill sizes="56px" className="object-contain p-1" />
                    </span>
                    <div className="min-w-0 flex-1">
                      {it.product ? <Link href={`/admin/products/${it.productId}`} className="line-clamp-1 font-medium hover:underline">{it.name}</Link> : <span className="line-clamp-1 font-medium">{it.name}</span>}
                      <p className="text-xs text-muted-foreground">SKU {it.sku}{it.product ? ` · stock actuel ${it.product.stock}` : ""}</p>
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">{formatPrice(it.unitPrice)} × {it.quantity}</span>
                    <span className="w-24 text-end font-semibold tabular-nums">{formatPrice(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1.5 border-t pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd className="tabular-nums">{order.shippingFee ? formatPrice(order.shippingFee) : "Gratuite"}</dd></div>
                <div className="flex justify-between text-base font-bold"><dt>Total à encaisser</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <OrderNoteForm orderId={order.id} />
              <ol className="relative space-y-4 border-s ps-5">
                {order.events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -start-[25px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                    <div className="flex flex-wrap items-center gap-2">
                      {e.status ? <OrderStatusBadge status={e.status} /> : null}
                      <span className="text-sm">{e.message}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(e.createdAt, { dateStyle: "medium", timeStyle: "short" })}{e.user ? ` · ${e.user.name}` : ""}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Client</CardTitle>
              <CustomerEditDialog orderId={order.id} initial={{ fullName: order.fullName, phone: order.phone, city: order.city, address: order.address, internalNote: order.internalNote ?? "" }} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2.5"><User className="size-4 text-muted-foreground" /> {order.fullName}</p>
              <p className="flex items-center gap-2.5"><Phone className="size-4 text-muted-foreground" /> <a href={`tel:${order.phone}`} className="font-mono text-primary hover:underline">{order.phone}</a></p>
              <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 text-muted-foreground" /> <span>{order.address}<br /><strong>{order.city}</strong></span></p>
              {order.email ? <p className="text-muted-foreground">{order.email}</p> : null}
              {order.user ? <p className="text-xs text-muted-foreground">Compte : {order.user.email}</p> : <p className="text-xs text-muted-foreground">Commande invité</p>}
              <div className="flex gap-2 pt-2">
                <a href={`tel:${order.phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium hover:bg-muted"><Phone className="size-4" /> Appeler</a>
                <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Bonjour ${order.fullName}, Mega Electro vous contacte au sujet de votre commande ${order.number}.`)}`} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium text-[#128C7E] hover:bg-muted"><MessageCircle className="size-4" /> WhatsApp</a>
              </div>
            </CardContent>
          </Card>
          {order.customerNote ? (
            <Card><CardHeader><CardTitle>Note du client</CardTitle></CardHeader><CardContent className="text-sm">{order.customerNote}</CardContent></Card>
          ) : null}
          {order.internalNote ? (
            <Card><CardHeader><CardTitle>Note interne</CardTitle></CardHeader><CardContent className="text-sm">{order.internalNote}</CardContent></Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
