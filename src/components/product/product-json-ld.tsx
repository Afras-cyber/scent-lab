import { siteConfig } from "@/config";
import type { ProductDetail } from "@/features/catalog/types";

import { productHref } from "./product-card";

/** schema.org Product + offers + rating, for rich results. */
export function ProductJsonLd({ product }: { product: ProductDetail }) {
  const url = `${siteConfig.url}${productHref(product.slug)}`;
  const prices = product.variants.map((v) => v.price);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    image: product.images.map((img) => new URL(img.src, siteConfig.url).href),
    url,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: siteConfig.currency.code,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so product text can't close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
