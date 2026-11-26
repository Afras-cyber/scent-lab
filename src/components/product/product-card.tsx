import { BellRing, Eye, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig, whatsappConfig } from "@/config";
import type { ProductCardData } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { fillMessage, waLink } from "@/lib/whatsapp/link";

import { Price } from "./price";
import { Rating } from "./rating";

export function productHref(slug: string) {
  return `/product/${slug}`;
}

function badgeFor(product: ProductCardData) {
  if (!product.inStock) return "Sold out";
  if (product.onSale) return "Sale";
  if (product.isFeatured) return "Featured";
  return null;
}

/**
 * The product card from the Figma "Product Card" frame, used on every product
 * list (home, shop, collections, search, related products).
 */
export function ProductCard({
  product,
  eager = false,
  className,
}: {
  product: ProductCardData;
  /** Load the image right away (first row of a grid, likely the LCP). */
  eager?: boolean;
  className?: string;
}) {
  const href = productHref(product.slug);
  const badge = badgeFor(product);

  return (
    <article
      className={cn(
        "relative flex flex-col gap-3 rounded-[20px] border bg-card p-3 text-center shadow-sm lg:p-3.5",
        className,
      )}
    >
      <div className="relative aspect-[280/232] overflow-hidden rounded-[14px] bg-gradient-to-br from-[#f3efe6] to-[#e9e2d3]">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          loading={eager ? "eager" : undefined}
          sizes="(min-width: 1024px) 280px, 45vw"
          className={cn(
            "object-contain p-4",
            !product.inStock && "opacity-60 grayscale",
          )}
        />
        {badge && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              product.inStock
                ? "bg-gold text-white"
                : "bg-brand-mid text-brand-foreground",
            )}
          >
            {badge}
          </span>
        )}
        {/* Quick view (a dialog) comes with the shop page; for now it opens the product. */}
        <Link
          href={href}
          aria-label={`View ${product.name}`}
          className="absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white text-brand-deep shadow-sm transition-transform hover:scale-105 lg:size-9"
        >
          <Eye className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5">
        {product.notes.length > 0 && (
          <p className="text-[10px] font-semibold tracking-[0.1em] text-heading uppercase lg:text-[11px]">
            {product.notes
              .slice(0, 3)
              .map((n) => n.name)
              .join(" · ")}
          </p>
        )}
        <h3 className="text-lg leading-snug lg:text-xl">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:rounded-[20px]"
          >
            {product.name}
          </Link>
        </h3>
        <Rating average={product.ratingAvg} count={product.ratingCount} />
        <Price
          price={product.price}
          compareAt={product.compareAt}
          from={product.variantCount > 1}
          className="justify-center"
        />
        {product.lowStock && (
          <p className="text-xs font-medium text-destructive">
            Only a few left
          </p>
        )}
      </div>

      {product.inStock ? (
        // Phase 2 wires this to the cart store; until then it opens the product page.
        <Button
          asChild
          className="relative z-10 w-full max-lg:h-10 max-lg:text-[13px]"
        >
          <Link href={href}>
            <ShoppingCart aria-hidden />
            Add to Cart
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          variant="secondary"
          className="relative z-10 w-full bg-muted text-muted-foreground hover:bg-muted/80 max-lg:h-10 max-lg:text-[13px]"
        >
          <a
            href={waLink(
              fillMessage(whatsappConfig.messages.notifyStock, {
                product: product.name,
                url: `${siteConfig.url}${href}`,
              }),
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BellRing aria-hidden />
            <span className="lg:hidden">Notify me</span>
            <span className="max-lg:hidden">Notify on WhatsApp</span>
          </a>
        </Button>
      )}
    </article>
  );
}
