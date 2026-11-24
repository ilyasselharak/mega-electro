"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { localizePath, splitLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Same page in the other language. A plain <a>: the document direction changes, so a full load is wanted. */
type Props = { className?: string; withIcon?: boolean };

export function LanguageSwitch(props: Props) {
  return (
    <Suspense fallback={<SwitchLink {...props} search="" />}>
      <WithSearch {...props} />
    </Suspense>
  );
}

function WithSearch(props: Props) {
  const sp = useSearchParams();
  return <SwitchLink {...props} search={sp.size ? `?${sp}` : ""} />;
}

function SwitchLink({ className, withIcon = true, search }: Props & { search: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const other = locale === "ar" ? "fr" : "ar";
  const href = `${localizePath(other, splitLocale(pathname).path)}${search}`;
  return (
    <a href={href} hrefLang={other} lang={other} aria-label={t.meta.switchToLabel} className={cn("inline-flex items-center gap-1.5 font-medium", className)}>
      {withIcon ? <Languages className="size-4" aria-hidden /> : null}
      {t.meta.switchTo}
    </a>
  );
}
