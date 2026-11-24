import { SeoTabs } from "@/components/admin/seo/seo-tabs";
import { requireStaffPage } from "@/lib/session";

export const metadata = { title: { default: "SEO", template: "%s · SEO · Admin Mega Electro" } };

export default async function SeoLayout({ children }: LayoutProps<"/[lang]/admin/seo">) {
  await requireStaffPage();
  return (
    <>
      <SeoTabs />
      {children}
    </>
  );
}
