"use client";

import { Link, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** The mark: an "M" drawn as one wire on a navy tile, with an orange plug point at its centre. */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: "default" | "inverse" }) {
  const inverse = tone === "inverse";
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-9", className)}>
      <rect width="64" height="64" rx="14" fill={inverse ? "#ffffff" : "var(--navy)"} />
      <path d="M15 45V20l17 17 17-17v25" fill="none" stroke={inverse ? "var(--navy)" : "#ffffff"} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="45" r="4.5" fill="var(--orange)" />
    </svg>
  );
}

export function Logo({ className, href = "/", tone = "default" }: { className?: string; href?: string; tone?: "default" | "inverse" }) {
  const { t } = useI18n();
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label={t.brand.homeLabel}>
      <LogoMark tone={tone} />
      <span className="flex flex-col gap-0.5 leading-none">
        <span className={cn("text-[19px] font-extrabold tracking-[-0.03em]", tone === "inverse" ? "text-white" : "text-foreground")}>
          Mega<span className="font-semibold"> Electro</span>
        </span>
        <span className={cn("text-[11px] font-medium max-sm:hidden", tone === "inverse" ? "text-white/60" : "text-muted-foreground")}>{t.brand.tagline}</span>
      </span>
    </Link>
  );
}
