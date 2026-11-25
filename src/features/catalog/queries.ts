import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { resolveImagePath } from "@/lib/images";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { filterProducts } from "./filter";
import { toProductCard, toProductDetail } from "./mappers";
import type { ShopFilters } from "./schemas";
import type {
  Banner,
  CatalogCollection,
  CatalogNote,
  ProductCardData,
  ProductDetail,
  ProductRow,
  Review,
} from "./types";

// Public catalog reads. RLS already hides inactive products, variants and
// collections. Cache tags let admin changes call revalidateTag (Phase 4).
export const CATALOG_TAGS = {
  products: "products",
  collections: "collections",
  banners: "banners",
  reviews: "reviews",
} as const;

const PRODUCT_COLUMNS = `
  id, slug, name, short_description, gender, occasions, is_featured,
  rating_avg, rating_count, created_at,
  product_variants (id, label, price_lkr, compare_at_lkr, stock, sort_order),
  product_images (path, alt, width, height, sort_order),
  product_notes (sort_order, notes (slug, name)),
  product_collections (collections (slug, name))
`;

// Column grants on `reviews`: list columns explicitly, never "*".
const REVIEW_COLUMNS =
  "id, customer_name, location, rating, title, body, is_verified, created_at";

/** Every active, buyable product as card data. */
export async function getCatalog(): Promise<ProductCardData[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAGS.products);

  const { data, error } = await createSupabaseServerClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false })
    .overrideTypes<ProductRow[], { merge: false }>();
  if (error) throw new Error(`getCatalog: ${error.message}`);
  return data.flatMap((row) => toProductCard(row) ?? []);
}

export async function listProducts(filters: ShopFilters) {
  return filterProducts(await getCatalog(), filters);
}

export async function getFeaturedProducts(limit = 8) {
  const products = await listProducts({ sort: "trending" });
  return products.slice(0, limit);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAGS.products, `product:${slug}`);

  const { data, error } = await createSupabaseServerClient()
    .from("products")
    .select(`${PRODUCT_COLUMNS}, description`)
    .eq("slug", slug)
    .maybeSingle()
    .overrideTypes<ProductRow | null, { merge: false }>();
  if (error) throw new Error(`getProductBySlug: ${error.message}`);
  return data ? toProductDetail(data) : null;
}

/** Products sharing a collection or note with `product`, best matches first. */
export async function getRelatedProducts(product: ProductCardData, limit = 4) {
  const notes = new Set(product.notes.map((n) => n.slug));
  const collections = new Set(product.collectionSlugs);
  const score = (p: ProductCardData) =>
    p.collectionSlugs.filter((c) => collections.has(c)).length * 2 +
    p.notes.filter((n) => notes.has(n.slug)).length;

  return (await listProducts({ sort: "trending" }))
    .filter((p) => p.id !== product.id && score(p) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

export async function listCollections(): Promise<CatalogCollection[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAGS.collections);

  const { data, error } = await createSupabaseServerClient()
    .from("collections")
    .select("id, slug, name, description, image_path")
    .order("sort_order");
  if (error) throw new Error(`listCollections: ${error.message}`);
  return data.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image_path ? resolveImagePath(c.image_path) : null,
  }));
}

export async function getCollectionBySlug(slug: string) {
  return (await listCollections()).find((c) => c.slug === slug) ?? null;
}

export async function listNotes(): Promise<CatalogNote[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CATALOG_TAGS.products);

  const { data, error } = await createSupabaseServerClient()
    .from("notes")
    .select("slug, name")
    .order("name");
  if (error) throw new Error(`listNotes: ${error.message}`);
  return data;
}

export async function getBanners(
  placement: "hero" | "promo",
): Promise<Banner[]> {
  "use cache";
  // Short lifetime: the RLS policy hides banners outside starts_at..ends_at.
  cacheLife("minutes");
  cacheTag(CATALOG_TAGS.banners);

  const { data, error } = await createSupabaseServerClient()
    .from("banners")
    .select(
      "id, title, subtitle, cta_label, cta_href, image_desktop_path, image_mobile_path, alt",
    )
    .eq("placement", placement)
    .order("sort_order");
  if (error) throw new Error(`getBanners: ${error.message}`);
  return data.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    ctaLabel: b.cta_label,
    ctaHref: b.cta_href,
    imageDesktop: resolveImagePath(b.image_desktop_path),
    imageMobile: b.image_mobile_path
      ? resolveImagePath(b.image_mobile_path)
      : null,
    alt: b.alt,
  }));
}

type ReviewRow = {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  title: string | null;
  body: string;
  is_verified: boolean;
  created_at: string;
  products?: { slug: string; name: string } | null;
};

function toReview(r: ReviewRow): Review {
  return {
    id: r.id,
    customerName: r.customer_name,
    location: r.location,
    rating: r.rating,
    title: r.title,
    body: r.body,
    isVerified: r.is_verified,
    createdAt: r.created_at,
    product: r.products ?? undefined,
  };
}

export async function getProductReviews(
  productId: string,
  limit = 20,
): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAGS.reviews);

  const { data, error } = await createSupabaseServerClient()
    .from("reviews")
    .select(REVIEW_COLUMNS)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getProductReviews: ${error.message}`);
  return data.map(toReview);
}

/** Latest approved reviews with their product, for the home page. */
export async function getLatestReviews(limit = 6): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAGS.reviews);

  const { data, error } = await createSupabaseServerClient()
    .from("reviews")
    .select(`${REVIEW_COLUMNS}, products (slug, name)`)
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<ReviewRow[], { merge: false }>();
  if (error) throw new Error(`getLatestReviews: ${error.message}`);
  return data.map(toReview);
}
