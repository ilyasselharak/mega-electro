import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Link } from "@/i18n/client";
import { getDictionary } from "@/i18n/server";

export default async function NotFound() {
  const t = await getDictionary();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <p className="font-heading text-7xl font-extrabold text-orange-strong">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t.notFound.title}</h1>
        <p className="text-muted-foreground">{t.notFound.text}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full"><Link href="/">{t.common.backHome}</Link></Button>
        <Button asChild variant="outline" className="rounded-full"><Link href="/recherche"><Search /> {t.notFound.search}</Link></Button>
      </div>
    </div>
  );
}
