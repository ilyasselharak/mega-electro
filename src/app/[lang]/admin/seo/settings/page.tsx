import { PageHeader } from "@/components/admin/page-header";
import { SeoSettingsForm } from "@/components/admin/seo/seo-settings-form";
import { getSeoOverview } from "@/server/queries/seo";
import { getCurrentUser, isAdmin } from "@/lib/session";
import type { SeoSettingsFormInput } from "@/lib/validators/seo";

export const metadata = { title: "Paramètres SEO" };

export default async function SeoSettingsPage() {
  const [{ settings: s }, user] = await Promise.all([getSeoOverview(), getCurrentUser()]);
  const initial: SeoSettingsFormInput = {
    ...s,
    orgType: (["Store", "OnlineStore", "Organization"].includes(s.orgType) ? s.orgType : "Store") as SeoSettingsFormInput["orgType"],
    returnFees: s.returnFees as SeoSettingsFormInput["returnFees"],
    returnMethod: s.returnMethod as SeoSettingsFormInput["returnMethod"],
    ogImageKey: s.ogImageKey || null,
    socialImageKey: s.socialImageKey || null,
    orgLogoKey: s.orgLogoKey || null,
    homeOgImageKey: s.homeOgImageKey || null,
  };
  return (
    <>
      <PageHeader title="Paramètres SEO" description="SEO global, page d'accueil, Open Graph, organisation, données structurées, robots.txt et sitemap." />
      <SeoSettingsForm initial={initial} canEdit={isAdmin(user)} envSiteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />
    </>
  );
}
