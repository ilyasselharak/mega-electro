"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/money";

type Point = { date: string; revenue: number; orders: number };

/** Single-series bar chart: daily revenue, 14 days. Hover/focus shows a tooltip. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const fmtDay = (iso: string) => new Intl.DateTimeFormat("fr-MA", { day: "numeric", month: "short" }).format(new Date(iso));
  const current = active != null ? data[active] : null;

  return (
    <div className="space-y-3">
      <div className="h-6 text-sm">
        {current ? (
          <span>
            <span className="text-muted-foreground">{fmtDay(current.date)} · </span>
            <strong className="tabular-nums">{formatPrice(current.revenue)}</strong>
            <span className="text-muted-foreground"> · {current.orders} commande{current.orders > 1 ? "s" : ""}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Survolez une barre pour le détail</span>
        )}
      </div>
      <div className="relative h-48 border-b border-border" role="img" aria-label="Chiffre d'affaires quotidien sur 14 jours">
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-border/70" aria-hidden />
        <span className="absolute -top-2.5 end-0 bg-card ps-1 text-[11px] text-muted-foreground tabular-nums">{formatPrice(max)}</span>
        <div className="flex h-full items-end gap-[2px] pt-4">
          {data.map((d, i) => (
            <button
              key={d.date}
              type="button"
              className="group flex h-full flex-1 items-end focus-visible:outline-none"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${fmtDay(d.date)} : ${formatPrice(d.revenue)}, ${d.orders} commandes`}
            >
              <span
                className="w-full rounded-t-[4px] bg-chart-1 transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-ring"
                style={{ height: `${d.revenue === 0 ? 0 : Math.max(2, (d.revenue / max) * 100)}%`, opacity: active != null && active !== i ? 0.45 : 1 }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{fmtDay(data[0].date)}</span>
        <span>{fmtDay(data[Math.floor(data.length / 2)].date)}</span>
        <span>{fmtDay(data[data.length - 1].date)}</span>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">Voir les données</summary>
        <table className="mt-2 w-full">
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-b last:border-0">
                <td className="py-1">{fmtDay(d.date)}</td>
                <td className="py-1 text-end tabular-nums">{formatPrice(d.revenue)}</td>
                <td className="py-1 text-end tabular-nums">{d.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
