"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold">{t.error.title}</h1>
      <p className="text-muted-foreground">{t.error.text}</p>
      {error.digest ? <p className="font-mono text-xs text-muted-foreground">Réf. {error.digest}</p> : null}
      <Button onClick={reset} className="rounded-full">{t.common.retry}</Button>
    </div>
  );
}
