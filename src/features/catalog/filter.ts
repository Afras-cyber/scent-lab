import { GENDERS, type ShopFilters, type ShopSort } from "./schemas";
import type { ProductCardData } from "./types";

// The catalog is small (tens to a few hundred products), so the cached list is
// filtered in memory rather than with one Supabase query per filter combination.

const compare: Record<
  ShopSort,
  (a: ProductCardData, b: ProductCardData) => number
> = {
  featured: (a, b) =>
    Number(b.isFeatured) - Number(a.isFeatured) ||
    b.createdAt.localeCompare(a.createdAt),
  trending: (a, b) =>
    Number(b.isFeatured) - Number(a.isFeatured) ||
    b.ratingCount - a.ratingCount ||
    b.ratingAvg - a.ratingAvg,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount,
};

type Facet = "gender" | "collection" | "note" | "size";

/** Whether `p` passes every filter except `skip` (used for facet counts). */
function matches(
  p: ProductCardData,
  filters: ShopFilters,
  terms: string[],
  skip?: Facet,
): boolean {
  const { gender, note, occasion, collection, size, minPrice, maxPrice } =
    filters;
  return (
    // Within a facet any selected option matches; across facets all must.
    // Unisex scents show under Men and Women too.
    (skip === "gender" ||
      !gender?.length ||
      gender.some((g) => p.gender === g || p.gender === "unisex")) &&
    (skip === "note" ||
      !note?.length ||
      p.notes.some((n) => note.includes(n.slug))) &&
    (skip === "collection" ||
      !collection?.length ||
      p.collectionSlugs.some((c) => collection.includes(c))) &&
    (skip === "size" ||
      !size?.length ||
      p.sizes.some((s) => size.includes(s))) &&
    (!occasion || p.occasions.includes(occasion)) &&
    (minPrice === undefined || p.price >= minPrice) &&
    (maxPrice === undefined || p.price <= maxPrice) &&
    (!filters.sale || p.onSale) &&
    (!filters.inStock || p.inStock) &&
    terms.every((t) => haystack(p).includes(t))
  );
}

export function filterProducts(
  products: readonly ProductCardData[],
  filters: ShopFilters,
): ProductCardData[] {
  const { q } = filters;
  const terms = q ? searchTerms(q) : [];
  const found = products.filter((p) => matches(p, filters, terms));

  const sort = filters.sort ?? (q ? undefined : "featured");
  const sorted = sort
    ? found.sort(compare[sort])
    : found.sort((a, b) => searchRank(b, terms) - searchRank(a, terms));
  // Sold-out products go last, keeping the chosen order otherwise.
  return sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock));
}

export type FacetCounts = Record<Facet, Record<string, number>>;

/**
 * For each option of each facet, how many products would match if it were
 * selected, given every other active filter ("Men 18" in the sidebar).
 * Gender counts follow the filter: unisex products count under Men and Women.
 */
export function facetCounts(
  products: readonly ProductCardData[],
  filters: ShopFilters,
): FacetCounts {
  const terms = filters.q ? searchTerms(filters.q) : [];
  const counts: FacetCounts = {
    gender: {},
    collection: {},
    note: {},
    size: {},
  };
  const bump = (facet: Facet, key: string) => {
    counts[facet][key] = (counts[facet][key] ?? 0) + 1;
  };

  for (const p of products) {
    if (matches(p, filters, terms, "gender") && p.gender) {
      if (p.gender === "unisex") {
        GENDERS.forEach((g) => bump("gender", g));
      } else {
        bump("gender", p.gender);
      }
    }
    if (matches(p, filters, terms, "collection")) {
      p.collectionSlugs.forEach((c) => bump("collection", c));
    }
    if (matches(p, filters, terms, "note")) {
      p.notes.forEach((n) => bump("note", n.slug));
    }
    if (matches(p, filters, terms, "size")) {
      p.sizes.forEach((s) => bump("size", s));
    }
  }
  return counts;
}

/** Lowest and highest card price, widened to whole hundreds. */
export function priceBounds(products: readonly ProductCardData[]) {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices) / 100) * 100,
    max: Math.ceil(Math.max(...prices) / 100) * 100,
  };
}

/** Every size in the catalog, smallest first ("3ml", "12ml", "50ml"). */
export function catalogSizes(products: readonly ProductCardData[]) {
  return [...new Set(products.flatMap((p) => p.sizes))].sort(
    (a, b) => parseInt(a) - parseInt(b),
  );
}

export type CollectionStats = { count: number; minPrice: number };

/** Product count and lowest card price per collection slug. */
export function collectionStats(
  products: readonly ProductCardData[],
): Map<string, CollectionStats> {
  const stats = new Map<string, CollectionStats>();
  for (const p of products) {
    for (const slug of p.collectionSlugs) {
      const current = stats.get(slug);
      stats.set(slug, {
        count: (current?.count ?? 0) + 1,
        minPrice: Math.min(current?.minPrice ?? Infinity, p.price),
      });
    }
  }
  return stats;
}

export function paginate<T>(items: readonly T[], page = 1, perPage: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    pageCount,
    total: items.length,
  };
}

/** Lowercase, accent-free search words from a query. */
export function searchTerms(q: string): string[] {
  return normalize(q).split(/\s+/).filter(Boolean);
}

/** Lowercase, strips accents and punctuation; shared by every search matcher. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function haystack(p: ProductCardData): string {
  return normalize(
    [
      p.name,
      p.shortDescription ?? "",
      p.notes.map((n) => n.name).join(" "),
      p.collectionSlugs.join(" ").replaceAll("-", " "),
      p.occasions.join(" ").replaceAll("-", " "),
      p.gender ?? "",
    ].join(" "),
  );
}

function searchRank(p: ProductCardData, terms: string[]): number {
  const name = normalize(p.name);
  return (
    terms.reduce((score, t) => score + (name.includes(t) ? 2 : 0), 0) +
    (p.isFeatured ? 1 : 0)
  );
}
