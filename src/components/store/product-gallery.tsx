"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StoreImage } from "@/components/shared/store-image";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/fmt";
import { cn } from "@/lib/utils";

type Img = { key: string; alt: string | null };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const { t, locale } = useI18n();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  // In RTL, scrollLeft runs from 0 to negative values.
  const sign = locale === "ar" ? -1 : 1;

  function goTo(i: number) {
    const next = (i + images.length) % images.length;
    setIndex(next);
    track.current?.scrollTo({ left: sign * next * track.current.clientWidth, behavior: "smooth" });
  }

  if (!images.length) {
    return (
      <div className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border bg-white text-sm text-muted-foreground">
        <StoreImage imageKey={null} alt={name} />
        <span className="absolute bottom-6">{t.product.noImage}</span>
      </div>
    );
  }
  const alt = (img: Img, i: number) => img.alt ?? `${name} — ${fmt(t.product.imageN, { n: i + 1 })}`;

  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 lg:flex-row">
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-none max-sm:hidden lg:max-h-[560px] lg:flex-col lg:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img.key}
              type="button"
              onClick={() => goTo(i)}
              aria-label={fmt(t.product.imageN, { n: i + 1 })}
              aria-current={i === index}
              className={cn("relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-opacity sm:size-20", i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}
            >
              <StoreImage imageKey={img.key} alt="" fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
      <div className="relative min-w-0 flex-1">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
            if (i !== index) setIndex(i);
          }}
          className="flex aspect-square snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-3xl border bg-white scrollbar-none"
        >
          {images.map((img, i) => (
            <button key={img.key} type="button" onClick={() => { setIndex(i); setZoom(true); }} className="relative size-full shrink-0 cursor-zoom-in snap-center" aria-label={t.product.zoom}>
              <StoreImage imageKey={img.key} alt={alt(img, i)} fill priority={i === 0} sizes="(min-width: 1024px) 560px, 100vw" className="object-contain p-6 sm:p-10" />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute end-3 top-3 flex size-9 items-center justify-center rounded-full border bg-background/90 text-muted-foreground" aria-hidden>
          <Expand className="size-4" />
        </span>
        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => goTo(index - 1)} className="absolute start-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:bg-background sm:flex" aria-label={t.product.prevImage}>
              <ChevronLeft className="size-5 rtl:-scale-x-100" />
            </button>
            <button type="button" onClick={() => goTo(index + 1)} className="absolute end-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 shadow-sm hover:bg-background sm:flex" aria-label={t.product.nextImage}>
              <ChevronRight className="size-5 rtl:-scale-x-100" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden" aria-hidden>
              {images.map((img, i) => <span key={img.key} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-primary" : "w-1.5 bg-foreground/20")} />)}
            </div>
          </>
        ) : null}
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-[min(96vw,1100px)] border-0 bg-white p-2 sm:p-4">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">{fmt(t.product.imageN, { n: index + 1 })}</DialogDescription>
          <div className="relative aspect-square max-h-[85dvh] w-full">
            <StoreImage imageKey={images[index].key} alt={alt(images[index], index)} fill sizes="(min-width: 1100px) 1100px, 96vw" className="object-contain" />
          </div>
          {images.length > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <button type="button" onClick={() => goTo(index - 1)} className="flex size-11 items-center justify-center rounded-full border hover:bg-muted" aria-label={t.product.prevImage}><ChevronLeft className="size-5 rtl:-scale-x-100" /></button>
              <span className="text-sm tabular-nums text-muted-foreground">{index + 1} / {images.length}</span>
              <button type="button" onClick={() => goTo(index + 1)} className="flex size-11 items-center justify-center rounded-full border hover:bg-muted" aria-label={t.product.nextImage}><ChevronRight className="size-5 rtl:-scale-x-100" /></button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
