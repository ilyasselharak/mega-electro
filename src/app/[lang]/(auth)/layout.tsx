import { Logo } from "@/components/shared/logo";
import { getDictionary } from "@/i18n/server";

export default async function AuthLayout({ children }: LayoutProps<"/[lang]">) {
  const t = await getDictionary();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-zellige opacity-60" aria-hidden />
        <div className="relative inline-flex w-fit rounded-xl bg-background p-2 pe-3 text-foreground"><Logo /></div>
        <div className="relative space-y-3">
          <p className="font-heading text-4xl font-extrabold leading-tight">{t.auth.asideTitle}</p>
          <p className="opacity-80">{t.trust.deliveryTitle} — {t.trust.codTitle} — {t.trust.warrantyTitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
