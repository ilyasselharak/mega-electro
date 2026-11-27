import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { WishlistProducts } from "@/components/store/saved-products";
import { getDictionary } from "@/i18n/server";

// Personal page (saved in the browser): never indexed.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.wishlist.metaTitle, robots: { index: false, follow: true } };
}

export default async function WishlistPage() {
  const t = await getDictionary();
  return (
    <div className="container-page space-y-5 py-6 sm:py-8">
      <Breadcrumbs items={[{ name: t.wishlist.title, path: "/favoris" }]} />
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{t.wishlist.title}</h1>
      <WishlistProducts />
    </div>
  );
}
