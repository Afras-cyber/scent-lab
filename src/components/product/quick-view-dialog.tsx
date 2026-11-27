"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";

import { productConfig } from "@/config";
import { useProductQuickView } from "@/features/catalog/hooks";
import { useQuickViewStore } from "@/features/catalog/quick-view-store";

import { BuyBox } from "./buy-box";
import { productHref } from "./product-card";
import { ProductGallery } from "./product-gallery";
import { ProductSkeleton } from "./product-skeleton";

const copy = productConfig.quickView;

/**
 * Quick view: a centered modal on desktop and a bottom sheet on mobile, with
 * the gallery and buy box. Mounted once in the storefront layout; product
 * cards open it through the quick view store.
 */
export function QuickViewDialog() {
  const { open, slug, setOpen } = useQuickViewStore();
  const { data: product, isError } = useProductQuickView(slug);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-brand-darkest/55 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-[max(3.5rem,7dvh)] bottom-0 z-50 flex flex-col overflow-y-auto rounded-t-[28px] bg-background shadow-2xl outline-none data-[state=closed]:animate-slide-out-bottom data-[state=open]:animate-slide-in-bottom lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:max-h-[calc(100dvh-4rem)] lg:w-[calc(100%-4rem)] lg:max-w-[980px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[28px] lg:data-[state=closed]:animate-fade-out lg:data-[state=open]:animate-fade-in"
        >
          <span
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-input lg:hidden"
            aria-hidden
          />
          <Dialog.Close
            aria-label="Close"
            className="absolute top-4 right-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            <X className="size-5" aria-hidden />
          </Dialog.Close>

          {product && product.slug === slug ? (
            <div className="grid gap-6 p-5 pt-4 md:grid-cols-2 lg:gap-8 lg:p-8">
              <Dialog.Title className="sr-only">{product.name}</Dialog.Title>
              <ProductGallery
                images={product.images}
                name={product.name}
                dimmed={!product.inStock}
                compact
              />
              <div className="flex flex-col gap-5">
                <BuyBox product={product} compact />
                <Link
                  href={productHref(product.slug)}
                  onClick={() => setOpen(false)}
                  className="group inline-flex items-center justify-center gap-2 text-sm font-semibold text-heading"
                >
                  {copy.viewDetails}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <Dialog.Title className="text-xl font-semibold">
                {copy.error}
              </Dialog.Title>
              {slug && (
                <Link
                  href={productHref(slug)}
                  onClick={() => setOpen(false)}
                  className="mt-4 inline-block text-sm font-semibold underline"
                >
                  {copy.viewDetails}
                </Link>
              )}
            </div>
          ) : (
            <>
              <Dialog.Title className="sr-only">Loading product</Dialog.Title>
              <ProductSkeleton compact />
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
