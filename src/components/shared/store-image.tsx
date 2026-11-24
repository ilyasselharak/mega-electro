"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { ImageIcon } from "lucide-react";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

const loader: ImageLoader = ({ src, width, quality }) => imageUrl(src, width, quality ?? 80);

type Props = Omit<ImageProps, "src" | "loader" | "alt"> & { imageKey?: string | null; alt?: string | null };

/**
 * Product/category/brand image served from Cloudinary.
 * `imageKey` is the Cloudinary public_id; the loader builds responsive AVIF/WebP URLs.
 */
export function StoreImage({ imageKey, alt, className, ...props }: Props) {
  if (!imageKey) {
    return (
      <div className={cn("flex size-full items-center justify-center bg-muted text-muted-foreground/50", className)}>
        <ImageIcon className="size-1/4 max-h-12 max-w-12" aria-hidden />
      </div>
    );
  }
  return <Image loader={loader} src={imageKey} alt={alt ?? ""} className={className} {...props} />;
}
