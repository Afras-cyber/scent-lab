import type { ShopFilters, ShopSort } from "./schemas";
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

export function filterProducts(
  products: readonly ProductCardData[],
  filters: ShopFilters,
): ProductCardData[] {
  const { gender, note, occasion, collection, minPrice, maxPrice, sale, q } =
    filters;
  const terms = q ? searchTerms(q) : [];

  const matches = products.filter(
    (p) =>
      // Unisex scents show under Men and Women too.
      (!gender || p.gender === gender || p.gender === "unisex") &&
      (!note || p.notes.some((n) => n.slug === note)) &&
      (!occasion || p.occasions.includes(occasion)) &&
      (!collection || p.collectionSlugs.includes(collection)) &&
      (minPrice === undefined || p.price >= minPrice) &&
      (maxPrice === undefined || p.price <= maxPrice) &&
      (!sale || p.onSale) &&
      terms.every((t) => haystack(p).includes(t)),
  );

  const sort = filters.sort ?? (q ? undefined : "featured");
  const sorted = sort
    ? matches.sort(compare[sort])
    : matches.sort((a, b) => searchRank(b, terms) - searchRank(a, terms));
  // Sold-out products go last, keeping the chosen order otherwise.
  return sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock));
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

function searchTerms(q: string): string[] {
  return normalize(q).split(/\s+/).filter(Boolean);
}

function normalize(text: string): string {
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
