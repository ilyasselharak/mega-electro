"use client";

import { Link, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** The mark: an "M" drawn as one live wire, with the current (yellow) at its peak. */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-9", className)}>
      <rect width="64" height="64" rx="16" className={tone === "inverse" ? "fill-primary" : "fill-ink"} />
      <path d="M14 46V20l18 18 18-18v26" fill="none" className="stroke-primary-foreground" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="38" r="5" className="fill-brass" />
    </svg>
  );
}

export function Logo({ className, href = "/", tone = "default" }: { className?: string; href?: string; tone?: "default" | "inverse" }) {
  const { t } = useI18n();
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label={t.brand.homeLabel}>
      <LogoMark tone={tone} />
      <span className="flex flex-col gap-1 leading-none">
        <span className={cn("font-heading text-[19px] font-extrabold tracking-[-0.02em]", tone === "inverse" && "text-ink-foreground")}>{t.brand.name}</span>
        <span className={cn("text-[11px] font-medium", tone === "inverse" ? "text-ink-foreground/60" : "text-muted-foreground")}>{t.brand.tagline}</span>
      </span>
    </Link>
  );
}
