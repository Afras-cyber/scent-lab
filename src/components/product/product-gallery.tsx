"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { CatalogImage } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

import { ImageLightbox } from "./image-lightbox";

// Desktop rail shows this many thumbnails; the last tile becomes "+N".
const RAIL_SIZE = 6;
const SWIPE_PX = 40;

const imageBg = "bg-gradient-to-br from-[#f3efe6] to-[#e9e2d3]";

/**
 * Product images (Figma "Product page"): thumbnail rail on desktop, swipe and
 * dots on mobile, a "1 / 6" counter and a zoom button for the lightbox.
 * `compact` drops the rail for the quick view.
 */
export function ProductGallery({
  images,
  name,
  badges = [],
  dimmed = false,
  compact = false,
}: {
  images: CatalogImage[];
  name: string;
  badges?: { label: string; tone: "gold" | "light" }[];
  /** Greyed out when the product is sold out. */
  dimmed?: boolean;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const image = images[index]!;

  const railImages = images.slice(0, RAIL_SIZE);
  const hidden = count - RAIL_SIZE + 1;

  return (
    <div className={cn("flex gap-4", !compact && "lg:gap-5")}>
      {!compact && count > 1 && (
        <ul className="flex shrink-0 flex-col gap-3 max-lg:hidden">
          {railImages.map((img, i) => {
            const more = hidden > 1 && i === RAIL_SIZE - 1;
            return (
              <li key={img.src + i}>
                <button
                  type="button"
                  onClick={() =>
                    more ? (setIndex(i), setLightboxOpen(true)) : setIndex(i)
                  }
                  aria-label={
                    more ? `Show all ${count} images` : `Image ${i + 1}`
                  }
                  aria-current={!more && i === index}
                  className={cn(
                    "relative block size-[88px] overflow-hidden rounded-2xl border-2",
                    more ? "bg-brand-gradient" : imageBg,
                    !more && i === index ? "border-gold" : "border-transparent",
                  )}
                >
                  {more ? (
                    <span className="text-base font-semibold text-white">
                      +{hidden}
                    </span>
                  ) : (
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="88px"
                      className="object-contain p-2"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div
          className={cn(
            "relative aspect-square overflow-hidden",
            compact
              ? "rounded-[16px]"
              : "rounded-[20px] max-lg:-mx-5 max-lg:rounded-none lg:aspect-[500/516]",
            imageBg,
          )}
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null || count < 2) return;
            const dx = e.changedTouches[0]!.clientX - touchX.current;
            if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <Image
            key={image.src + index}
            src={image.src}
            alt={image.alt}
            fill
            priority={!compact}
            sizes={
              compact
                ? "(min-width: 1024px) 420px, 90vw"
                : "(min-width: 1024px) 500px, 100vw"
            }
            className={cn(
              "object-contain p-10 lg:p-14",
              dimmed && "opacity-60 grayscale",
            )}
          />

          {badges.length > 0 && (
            <div className="absolute top-4 left-4 flex gap-2">
              {badges.map((b) => (
                <span
                  key={b.label}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    b.tone === "gold"
                      ? "bg-gold text-brand-deep"
                      : "bg-white text-heading",
                  )}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}

          {count > 1 && (
            <>
              <GalleryArrow direction="prev" onClick={() => go(-1)} />
              <GalleryArrow direction="next" onClick={() => go(1)} />
              <span className="absolute bottom-4 left-4 rounded-full bg-brand-deep/70 px-2.5 py-1 text-xs font-medium text-white">
                {index + 1} / {count}
              </span>
              <div
                className="absolute inset-x-0 bottom-5 flex justify-center gap-1.5 lg:hidden"
                aria-hidden
              >
                {images.map((img, i) => (
                  <span
                    key={img.src + i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === index
                        ? "w-5 bg-brand-deep"
                        : "w-1.5 bg-brand-deep/25",
                    )}
                  />
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Zoom image"
            className={cn(
              "absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full bg-white text-heading shadow-sm transition-transform hover:scale-105",
              // Mobile product page: top right, as in the design. The quick
              // view keeps it at the bottom, clear of the close button.
              !compact && "max-lg:top-4 max-lg:bottom-auto",
            )}
          >
            <ZoomIn className="size-5" aria-hidden />
          </button>
        </div>

        {/* Mobile thumbnails under the image. */}
        {!compact && count > 1 && (
          <ul className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 lg:hidden">
            {images.map((img, i) => (
              <li key={img.src + i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "relative block size-[60px] overflow-hidden rounded-xl border-2",
                    imageBg,
                    i === index ? "border-gold" : "border-transparent",
                  )}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="60px"
                    className="object-contain p-1.5"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImageLightbox
        images={images}
        name={name}
        index={index}
        onIndexChange={setIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-heading shadow-sm transition-transform hover:scale-105 max-lg:hidden",
        direction === "prev" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
