import { PageHeader } from "@/components/admin/page-header";
import { RedirectsManager } from "@/components/admin/seo/redirects-manager";
import { listRedirects } from "@/server/queries/seo";

export const metadata = { title: "Redirections" };

export default async function RedirectsPage() {
  const redirects = await listRedirects();
  return (
    <>
      <PageHeader title="Redirections 301" description="Redirigez les anciennes URL vers les nouvelles pour conserver le référencement acquis." />
      <RedirectsManager redirects={redirects} />
    </>
  );
}
