import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { STATIC_PAGES, STATIC_PAGES_AR } from "@/lib/content/pages";
import { getDictionary, getLocale } from "@/i18n/server";
import { localizedMetadata } from "@/lib/seo-server";
import { getSettings } from "@/server/queries/settings";
import { getSeoSettings } from "@/server/queries/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(STATIC_PAGES).map((page) => ({ page }));
}

async function contentFor(page: string) {
  const pages = (await getLocale()) === "ar" ? STATIC_PAGES_AR : STATIC_PAGES;
  return page in pages ? pages[page as keyof typeof STATIC_PAGES_AR] : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[page]">): Promise<Metadata> {
  const { page } = await params;
  const content = await contentFor(page);
  if (!content) return {};
  return localizedMetadata({ title: content.title, description: content.description, path: `/${page}`, seo: await getSeoSettings() });
}

export default async function StaticPage({ params }: PageProps<"/[lang]/[page]">) {
  const { page } = await params;
  const content = await contentFor(page);
  if (!content) notFound();
  const settings = page === "contact" ? await getSettings() : null;
  const t = await getDictionary();

  return (
    <div className="container-page max-w-3xl space-y-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ name: content.title, path: `/${page}` }]} />
      <h1 className="text-3xl font-extrabold sm:text-4xl">{content.title}</h1>
      <div className="prose-store space-y-6">
        {content.sections.map((s, i) => (
          <section key={i}>
            {s.heading ? <h2 className="text-xl">{s.heading}</h2> : null}
            {s.body.map((p, j) => <p key={j}>{p}</p>)}
          </section>
        ))}
      </div>
      {settings ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          <li><a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40"><Phone className="size-5 text-orange-strong" aria-hidden /><span dir="ltr">{settings.phone}</span></a></li>
          <li><a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40"><MessageCircle className="size-5 text-orange-strong" aria-hidden />{t.footer.whatsapp}</a></li>
          <li><a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/40"><Mail className="size-5 text-orange-strong" />{settings.email}</a></li>
          <li className="flex items-center gap-3 rounded-2xl border bg-card p-4"><MapPin className="size-5 text-orange-strong" />{settings.address}</li>
        </ul>
      ) : null}
    </div>
  );
}
