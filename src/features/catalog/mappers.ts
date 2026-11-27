import { commerceConfig } from "@/config";
import { resolveImagePath } from "@/lib/images";

import type {
  CatalogImage,
  CatalogNote,
  Gender,
  NoteTier,
  ProductCardData,
  ProductDetail,
  ProductRow,
  ProductVariant,
  ScentProfile,
  Season,
} from "./types";

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

/** Bottle sizes in a variant label: "12ml attar" → ["12ml"], "5 × 3ml" → ["3ml"]. */
export function parseSizes(label: string): string[] {
  return [...label.matchAll(/(\d+)\s*ml/gi)].map((m) => `${Number(m[1])}ml`);
}

function toGender(value: string | null): Gender | null {
  return value === "men" || value === "women" || value === "unisex"
    ? value
    : null;
}

const NOTE_TIERS: readonly NoteTier[] = ["top", "heart", "base"];
const SEASONS: readonly Season[] = ["spring", "summer", "autumn", "winter"];

function toLevel(value: number | null | undefined): number | null {
  return value != null && value >= 1 && value <= 5 ? value : null;
}

/** Scent profile columns, with notes grouped into top, heart and base. */
export function toScentProfile(row: ProductRow): ScentProfile {
  const pyramid: Record<NoteTier, CatalogNote[]> = {
    top: [],
    heart: [],
    base: [],
  };
  for (const n of [...row.product_notes].sort(bySortOrder)) {
    const tier = NOTE_TIERS.find((t) => t === n.tier);
    if (tier && n.notes) pyramid[tier].push(n.notes);
  }
  return {
    concentration: row.concentration ?? null,
    longevity: row.longevity ?? null,
    projection: toLevel(row.projection),
    sweetness: toLevel(row.sweetness),
    freshness: toLevel(row.freshness),
    // Calendar order, whatever order staff entered them in.
    seasons: SEASONS.filter((season) => row.seasons?.includes(season)),
    story: row.scent_story ?? null,
    pyramid,
  };
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
    sizes: [...new Set(variants.flatMap((v) => parseSizes(v.label)))].sort(
      (a, b) => parseInt(a) - parseInt(b),
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
    profile: toScentProfile(row),
  };
}

// A full longevity bar means this many hours or more.
const FULL_LONGEVITY_HOURS = 15;

/**
 * Bar fill (0–1) for a longevity text, from its largest number of hours:
 * "8–12 hours" → 0.8. Null when the text has no number.
 */
export function longevityShare(longevity: string | null): number | null {
  const hours = (longevity?.match(/\d+/g) ?? []).map(Number);
  if (hours.length === 0) return null;
  return Math.min(Math.max(...hours) / FULL_LONGEVITY_HOURS, 1);
}
