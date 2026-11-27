"use client";

import { StoreImage } from "@/components/shared/store-image";
import { Price } from "@/components/store/price";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { Link, useI18n } from "@/i18n/client";
import { localName } from "@/i18n/config";
import { fmt } from "@/i18n/fmt";
import { discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardData } from "@convex/lib/products";

/** Products at or under this stock show "Only N left" (real stock, never invented urgency). */
const LOW_STOCK = 3;

/**
 * The store's price tag: photo on a white stage, brand and name, then one bottom row with the
 * price, a real discount (only when the original price is higher) and the quick add button.
 */
export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const { t, locale } = useI18n();
  const name = localName(locale, product);
  const [first, second] = product.images;
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock <= 0;
  const stock = soldOut
    ? { label: t.common.outOfStock, tone: "bg-muted-foreground/50", text: "text-muted-foreground" }
    : product.stock <= LOW_STOCK
      ? { label: fmt(t.product.lowStock, { count: product.stock }), tone: "bg-amber-500", text: "text-amber-800" }
      : { label: t.common.inStock, tone: "bg-success", text: "text-success-strong" };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-border/70 transition-shadow duration-200 hover:shadow-lift">
      <div className="relative aspect-square bg-white">
        <Link href={`/produit/${product.slug}`} prefetch={false} tabIndex={-1} aria-hidden className="absolute inset-0 block overflow-hidden">
          <StoreImage
            imageKey={first?.key}
            alt={first?.alt ?? name}
            fill
            sizes="(min-width: 1536px) 260px, (min-width: 1024px) 22vw, (min-width: 768px) 33vw, 50vw"
            className={cn("object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] sm:p-6", soldOut && "opacity-50")}
            priority={priority}
          />
          {second ? (
            <StoreImage imageKey={second.key} alt="" fill sizes="(min-width: 1024px) 22vw, 33vw" className="object-contain p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-md:hidden" />
          ) : null}
        </Link>
        {off ? (
          <span dir="ltr" className="price absolute start-2.5 top-2.5 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground sm:start-3 sm:top-3">
            -{off}%
          </span>
        ) : null}
        <WishlistButton productId={product.id} name={name} className="absolute end-2.5 top-2.5 z-10 sm:end-3 sm:top-3" />
      </div>
      <div className="flex flex-1 flex-col border-t border-border/60 p-3 sm:p-4">
        {product.brand ? <span className="mb-0.5 truncate text-xs font-semibold capitalize text-muted-foreground">{product.brand.name}</span> : null}
        <h3 className="line-clamp-2 min-h-10 text-[13.5px] font-medium leading-5 text-foreground sm:text-sm">
          <Link href={`/produit/${product.slug}`} prefetch={false} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {name}
          </Link>
        </h3>
        <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium", stock.text)}>
          <span className={cn("size-1.5 shrink-0 rounded-full", stock.tone)} aria-hidden /> {stock.label}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" className="min-w-0" />
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

/** 2 columns on phones, up to 4 (with filters) or 5 (full width) on large screens. */
export function ProductGrid({ products, priorityCount = 0, wide }: { products: ProductCardData[]; priorityCount?: number; wide?: boolean }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4", wide && "2xl:grid-cols-5")}>
      {products.map((p, i) => (
        <li key={p.id}><ProductCard product={p} priority={i < priorityCount} /></li>
      ))}
    </ul>
  );
}

/** Horizontal scroller on phones and tablets; one full row of 4 (two rows) or 5 on desktop. */
export function ProductRail({ products }: { products: ProductCardData[] }) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 xl:grid-cols-5">
      {products.slice(0, 8).map((p, i) => (
        <li key={p.id} className={cn("w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-auto", i >= 5 && "xl:hidden")}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
