"use client";

import { Link, useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-9", className)}>
      <rect width="64" height="64" rx="14" className="fill-primary" />
      <path d="M20 50V30a12 12 0 0 1 24 0v20" fill="none" className="stroke-brass" strokeWidth="5" strokeLinecap="round" />
      <path d="M27 50V34a5 5 0 0 1 10 0v16" className="fill-brass" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  const { t } = useI18n();
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)} aria-label={t.brand.homeLabel}>
      <LogoMark />
      <span className="flex flex-col gap-0.5 leading-none">
        <span className="font-heading text-lg font-extrabold tracking-tight">{t.brand.name}</span>
        <span className="text-[11px] font-medium text-muted-foreground">{t.brand.tagline}</span>
      </span>
    </Link>
  );
}
