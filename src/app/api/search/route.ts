import { NextResponse } from "next/server";
import { searchSuggestions } from "@/server/queries/catalog";
import { formatPrice } from "@/lib/money";
import { imageUrl } from "@/lib/images";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim().slice(0, 80) ?? "";
  const locale = sp.get("lang") === "ar" ? "ar" : "fr";
  if (q.length < 2) return NextResponse.json({ items: [] });
  const items = await searchSuggestions(q.toLowerCase());
  return NextResponse.json(
    {
      items: items.map((p) => ({
        id: p.id,
        name: locale === "ar" && p.nameAr ? p.nameAr : p.name,
        href: `/produit/${p.slug}`, // localized by the client
        brand: p.brand?.name ?? null,
        price: formatPrice(p.price, locale),
        image: p.images[0] ? imageUrl(p.images[0].key, 160) : null,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
