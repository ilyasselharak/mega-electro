import { Logo } from "@/components/shared/logo";
import { getDictionary } from "@/i18n/server";

export default async function AuthLayout({ children }: LayoutProps<"/[lang]">) {
  const t = await getDictionary();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink text-ink-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-showroom [mask-image:linear-gradient(to_top,black,transparent)]" aria-hidden />
        <Logo tone="inverse" className="relative w-fit" />
        <div className="relative space-y-3">
          <p className="max-w-md font-heading text-5xl font-extrabold leading-[1.05] tracking-[-0.03em]">{t.auth.asideTitle}</p>
          <p className="text-ink-foreground/70">{[t.trust.deliveryTitle, t.trust.codTitle, t.trust.warrantyTitle].join(t.meta.languageName === "Français" ? ", " : "، ")}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
