import { redirect } from "next/navigation";
import NextLink from "next/link";
import { TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { isAdmin, requireStaffPage } from "@/lib/session";
import { resolveSections } from "@/lib/storefront";
import { getAdminStorefront } from "@/server/queries/admin";
import { StorefrontForm } from "./storefront-form";

export const metadata = { title: "Vitrine" };

export default async function StorefrontPage() {
  const user = await requireStaffPage();
  if (!isAdmin(user)) redirect("/admin");
  const { available, data } = await getAdminStorefront();
  return (
    <>
      <PageHeader title="Vitrine" description="Page d'accueil : bannières, collections, ordre des sections et couleurs de la marque." />
      {!available ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Les fonctions serveur de la vitrine ne sont pas encore déployées sur Convex. La boutique utilise l&apos;affichage par défaut.
            Déployez le backend (<code className="rounded bg-amber-100 px-1">npm run deploy:convex</code>) pour activer l&apos;enregistrement.
          </p>
        </div>
      ) : null}
      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Les autres réglages de la vitrine sont déjà dans leurs pages :{" "}
        <NextLink href="/admin/products" className="font-medium underline">produits mis en avant</NextLink> (case « Mis en avant » d&apos;un produit),{" "}
        <NextLink href="/admin/categories" className="font-medium underline">images des catégories</NextLink>,{" "}
        <NextLink href="/admin/brands" className="font-medium underline">logos des marques</NextLink>,{" "}
        <NextLink href="/admin/seo" className="font-medium underline">métadonnées SEO</NextLink> et les photos dans chaque fiche produit.
      </p>
      <StorefrontForm
        disabled={!available}
        initial={{
          banners: (data?.banners ?? []).map((b) => ({ ...b, startsAt: b.startsAt ?? null, endsAt: b.endsAt ?? null })),
          collections: (data?.collections ?? []).map((c) => ({ ...c, startsAt: c.startsAt ?? null, endsAt: c.endsAt ?? null })),
          sections: resolveSections(data?.sections),
          theme: { accent: data?.theme?.accent ?? "", navy: data?.theme?.navy ?? "" },
        }}
      />
    </>
  );
}
