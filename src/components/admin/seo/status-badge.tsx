import { CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";
import type { SeoStatus } from "@convex/lib/seoRules";
import { cn } from "@/lib/utils";

const STYLES: Record<SeoStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  optimized: { label: "Optimisé", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300", Icon: CheckCircle2 },
  incomplete: { label: "Incomplet", className: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300", Icon: CircleAlert },
  missing: { label: "Manquant", className: "bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300", Icon: CircleDashed },
};

export function SeoStatusBadge({ status, className }: { status: SeoStatus; className?: string }) {
  const s = STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", s.className, className)}>
      <s.Icon className="size-3.5" aria-hidden /> {s.label}
    </span>
  );
}

/** Character count coloured by the recommended range. */
export function LengthPill({ value, min, max }: { value: number; min: number; max: number }) {
  const tone = value === 0 ? "text-red-700 dark:text-red-400" : value < min || value > max ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400";
  return <span className={cn("font-mono text-xs tabular-nums", tone)}>{value}</span>;
}

export function ScoreBar({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <span className="flex items-center gap-2" title={`${score}%`}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><span className={cn("block h-full rounded-full", tone)} style={{ width: `${score}%` }} /></span>
      <span className="text-xs tabular-nums text-muted-foreground">{score}%</span>
    </span>
  );
}
