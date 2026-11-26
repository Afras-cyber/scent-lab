import { commerceConfig } from "@/config";
import { resolveImagePath } from "@/lib/images";

import type {
  CatalogImage,
  Gender,
  ProductCardData,
  ProductDetail,
  ProductRow,
  ProductVariant,
} from "./types";

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

function toGender(value: string | null): Gender | null {
  return value === "men" || value === "women" || value === "unisex"
    ? value
    : null;
}

function toImages(row: ProductRow): CatalogImage[] {
  const images = [...row.product_images].sort(bySortOrder).map((img) => ({
    src: resolveImagePath(img.path),
    alt: img.alt,
    width: img.width,
    height: img.height,
  }));
  return images.length > 0
    ? images
    : [
        {
          src: resolveImagePath(null),
          alt: row.name,
          width: null,
          height: null,
        },
      ];
}

/**
 * Maps a product row to card data. Returns null for products with no active
 * variant: they cannot be bought, so the storefront hides them.
 */
export function toProductCard(row: ProductRow): ProductCardData | null {
  const variants: ProductVariant[] = [...row.product_variants]
    .sort(bySortOrder)
    .map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price_lkr,
      compareAt: v.compare_at_lkr,
      stock: v.stock,
    }));
  if (variants.length === 0) return null;

  const buyable = variants.filter((v) => v.stock > 0);
  // Show the cheapest variant that can be bought, else the cheapest overall.
  const cheapest = [...(buyable.length > 0 ? buyable : variants)].sort(
    (a, b) => a.price - b.price,
  )[0]!;
  const inStock = buyable.length > 0;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    gender: toGender(row.gender),
    occasions: row.occasions,
    isFeatured: row.is_featured,
    ratingAvg: Number(row.rating_avg),
    ratingCount: row.rating_count,
    createdAt: row.created_at,
    image: toImages(row)[0]!,
    defaultVariantId: cheapest.id,
    price: cheapest.price,
    compareAt: cheapest.compareAt,
    variantCount: variants.length,
    onSale: variants.some((v) => v.compareAt !== null && v.compareAt > v.price),
    inStock,
    lowStock:
      inStock &&
      buyable.every((v) => v.stock < commerceConfig.lowStockThreshold),
    notes: [...row.product_notes]
      .sort(bySortOrder)
      .flatMap((n) => (n.notes ? [n.notes] : [])),
    collectionSlugs: row.product_collections.flatMap((c) =>
      c.collections ? [c.collections.slug] : [],
    ),
  };
}

export function toProductDetail(row: ProductRow): ProductDetail | null {
  const card = toProductCard(row);
  if (!card) return null;
  return {
    ...card,
    description: row.description ?? null,
    variants: [...row.product_variants].sort(bySortOrder).map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price_lkr,
      compareAt: v.compare_at_lkr,
      stock: v.stock,
    })),
    images: toImages(row),
    collections: row.product_collections.flatMap((c) =>
      c.collections ? [c.collections] : [],
    ),
  };
}
