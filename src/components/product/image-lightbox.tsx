"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Dialog } from "radix-ui";

import type { CatalogImage } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

/**
 * Full-screen image viewer (Figma "Image lightbox"): dark backdrop, arrows,
 * thumbnails, and ← / → keys. The index is owned by the gallery so closing
 * the lightbox keeps the same image selected.
 */
export function ImageLightbox({
  images,
  name,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: {
  images: CatalogImage[];
  name: string;
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const count = images.length;
  const go = (step: number) => onIndexChange((index + step + count) % count);
  const image = images[index]!;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-darkest data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(-1);
            if (e.key === "ArrowRight") go(1);
          }}
          className="fixed inset-0 z-50 flex flex-col gap-6 p-5 text-white outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in lg:p-8"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-sans text-sm font-medium text-white">
              {name} · {index + 1} / {count}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center gap-4 lg:gap-12">
            {count > 1 && (
              <LightboxArrow direction="prev" onClick={() => go(-1)} />
            )}
            <div className="relative aspect-square h-full max-h-[min(70dvh,560px)] max-w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#f6f3ec] to-[#e8e0cf]">
              <Image
                key={image.src + index}
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 560px, 90vw"
                className="object-contain p-8"
              />
            </div>
            {count > 1 && (
              <LightboxArrow direction="next" onClick={() => go(1)} />
            )}
          </div>

          {count > 1 && (
            <ul className="flex justify-center gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <li key={img.src + i}>
                  <button
                    type="button"
                    onClick={() => onIndexChange(i)}
                    aria-label={`Image ${i + 1}`}
                    aria-current={i === index}
                    className={cn(
                      "relative block size-12 overflow-hidden rounded-xl border-2 bg-gradient-to-br from-[#f6f3ec] to-[#e8e0cf] lg:size-14",
                      i === index ? "border-gold" : "border-transparent",
                    )}
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain p-1.5"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function LightboxArrow({
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
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 max-sm:hidden"
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
