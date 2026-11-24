import { StoreImage } from "@/components/shared/store-image";
import { Price } from "@/components/store/price";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Link } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { getDictionary, getLocale } from "@/i18n/server";
import { discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/server/queries/catalog";

/** Products at or under this stock show "Only N left" (real stock, never invented urgency). */
const LOW_STOCK = 3;

export async function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const locale = await getLocale();
  const t = await getDictionary(locale);
  const name = localName(locale, product);
  const [first, second] = product.images;
  const off = discountPercent(product.price, product.compareAtPrice);
  const stock =
    product.stock <= 0
      ? { label: t.common.outOfStock, tone: "bg-muted-foreground/50" }
      : product.stock <= LOW_STOCK
        ? { label: fmt(t.product.lowStock, { count: product.stock }), tone: "bg-amber-500" }
        : { label: t.common.inStock, tone: "bg-success" };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-300 hover:border-primary/35 hover:shadow-[0_18px_40px_-24px_rgb(11_26_58/0.35)]">
      <Link href={`/produit/${product.slug}`} prefetch={false} tabIndex={-1} aria-hidden className="relative block aspect-square overflow-hidden bg-white">
        <StoreImage
          imageKey={first?.key}
          alt={first?.alt ?? name}
          fill
          sizes="(min-width: 1280px) 290px, (min-width: 768px) 33vw, 50vw"
          className={cn("object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]", product.stock <= 0 && "opacity-60")}
          priority={priority}
        />
        {second ? (
          <StoreImage imageKey={second.key} alt="" fill sizes="(min-width: 1280px) 290px, 33vw" className="object-contain p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden" />
        ) : null}
        {off ? <span dir="ltr" className="absolute start-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white tabular-nums">-{off}%</span> : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 pt-1 sm:p-4 sm:pt-1">
        {product.brand ? <span className="text-xs font-semibold text-primary">{product.brand.name}</span> : null}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-foreground">
          <Link href={`/produit/${product.slug}`} prefetch={false} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0 space-y-1">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("size-1.5 shrink-0 rounded-full", stock.tone)} aria-hidden /> {stock.label}
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <AddToCartButton
              variant="icon"
              product={{ productId: product.id, slug: product.slug, name, price: product.price, imageKey: first?.key ?? null, maxQuantity: product.stock }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}><ProductCard product={p} priority={i < priorityCount} /></li>
      ))}
    </ul>
  );
}

/** Horizontal scroller on mobile, 4-column grid on desktop. */
export function ProductRail({ products }: { products: ProductCardData[] }) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {products.map((p) => (
        <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-auto">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
