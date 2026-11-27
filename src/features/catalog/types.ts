export type Gender = "men" | "women" | "unisex";

export type CatalogImage = {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type CatalogNote = { slug: string; name: string };

export type CatalogCollection = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  compareAt: number | null;
  stock: number;
};

/** Everything a product card, filter or search needs. Prices in whole rupees. */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  gender: Gender | null;
  occasions: string[];
  isFeatured: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  image: CatalogImage;
  /** Cheapest active variant; the card shows "From" when there are several. */
  defaultVariantId: string;
  price: number;
  compareAt: number | null;
  variantCount: number;
  onSale: boolean;
  inStock: boolean;
  /** In stock, but every variant is under `commerceConfig.lowStockThreshold`. */
  lowStock: boolean;
  notes: CatalogNote[];
  collectionSlugs: string[];
  /** Normalized bottle sizes from the variant labels, e.g. ["6ml", "12ml"]. */
  sizes: string[];
};

export type NoteTier = "top" | "heart" | "base";
export type Season = "spring" | "summer" | "autumn" | "winter";

/** Product page "Scent profile". Levels run 1–5; null hides that bar. */
export type ScentProfile = {
  concentration: string | null;
  longevity: string | null;
  projection: number | null;
  sweetness: number | null;
  freshness: number | null;
  seasons: Season[];
  story: string | null;
  /** Notes grouped for the pyramid; untiered notes are left out. */
  pyramid: Record<NoteTier, CatalogNote[]>;
};

export type ProductDetail = ProductCardData & {
  description: string | null;
  variants: ProductVariant[];
  images: CatalogImage[];
  collections: { slug: string; name: string }[];
  profile: ScentProfile;
};

export type DeliveryZone = {
  district: string;
  fee: number;
  estimatedDays: string;
};

export type Review = {
  id: string;
  customerName: string;
  location: string | null;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  createdAt: string;
  product?: { slug: string; name: string };
};

export type ReviewSummary = {
  average: number;
  total: number;
  /** Review counts for 1, 2, 3, 4 and 5 stars. */
  counts: [number, number, number, number, number];
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageDesktop: string;
  imageMobile: string | null;
  alt: string;
};

/** Shape of a `products` row with the embeds selected in `queries.ts`. */
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description?: string | null;
  gender: string | null;
  occasions: string[];
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  // Scent profile: only the product page query selects these.
  concentration?: string | null;
  longevity?: string | null;
  projection?: number | null;
  sweetness?: number | null;
  freshness?: number | null;
  seasons?: string[];
  scent_story?: string | null;
  product_variants: {
    id: string;
    label: string;
    price_lkr: number;
    compare_at_lkr: number | null;
    stock: number;
    sort_order: number;
  }[];
  product_images: {
    path: string;
    alt: string;
    width: number | null;
    height: number | null;
    sort_order: number;
  }[];
  product_notes: {
    sort_order: number;
    tier?: string | null;
    notes: { slug: string; name: string } | null;
  }[];
  product_collections: {
    collections: { slug: string; name: string } | null;
  }[];
};
