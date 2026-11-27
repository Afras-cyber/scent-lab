import { filterProducts, normalize, searchTerms } from "../catalog/filter";
import type {
  CatalogCollection,
  CatalogNote,
  ProductCardData,
} from "../catalog/types";

// Instant search for the header popup and the /search page. Products reuse
// the shop filter (same matching and relevance rank); collections and notes
// match on their name.

/** One perfume row in the search popup. */
export type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  image: { src: string; alt: string };
  /** Up to three note names, e.g. ["Oud", "Amber", "Musk"]. */
  notes: string[];
  /** "3 sizes", or the single size ("12ml"). */
  sizeLabel: string | null;
  price: number;
  /** More than one variant: the row links to the product to choose a size. */
  multiVariant: boolean;
  inStock: boolean;
};

export type SearchCollection = { slug: string; name: string; count: number };

export type SearchResults = {
  products: SearchProduct[];
  /** Every matching product, not just the rows shown. */
  total: number;
  collections: SearchCollection[];
  notes: CatalogNote[];
};

export const EMPTY_RESULTS: SearchResults = {
  products: [],
  total: 0,
  collections: [],
  notes: [],
};

const MAX_COLLECTIONS = 3;
const MAX_NOTES = 6;

function toSearchProduct(p: ProductCardData): SearchProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: { src: p.image.src, alt: p.image.alt },
    notes: p.notes.slice(0, 3).map((n) => n.name),
    sizeLabel:
      p.variantCount > 1 ? `${p.variantCount} sizes` : (p.sizes[0] ?? null),
    price: p.price,
    multiVariant: p.variantCount > 1,
    inStock: p.inStock,
  };
}

function nameMatches(name: string, terms: string[]) {
  const text = normalize(name);
  return terms.some((t) => text.includes(t));
}

/** Matching collections and notes for `q`, used by the popup and /search. */
export function searchMatches(
  catalog: readonly ProductCardData[],
  collections: readonly CatalogCollection[],
  notes: readonly CatalogNote[],
  q: string,
): Pick<SearchResults, "collections" | "notes"> {
  const terms = searchTerms(q);
  if (terms.length === 0) return { collections: [], notes: [] };

  const counts = new Map<string, number>();
  const usedNotes = new Set<string>();
  for (const p of catalog) {
    p.collectionSlugs.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
    p.notes.forEach((n) => usedNotes.add(n.slug));
  }

  return {
    collections: collections
      .filter((c) => counts.has(c.slug) && nameMatches(c.name, terms))
      .slice(0, MAX_COLLECTIONS)
      .map((c) => ({ slug: c.slug, name: c.name, count: counts.get(c.slug)! })),
    notes: notes
      .filter((n) => usedNotes.has(n.slug) && nameMatches(n.name, terms))
      .slice(0, MAX_NOTES),
  };
}

export function searchCatalog(
  catalog: readonly ProductCardData[],
  collections: readonly CatalogCollection[],
  notes: readonly CatalogNote[],
  { q, collection }: { q: string; collection?: string },
  limit: number,
): SearchResults {
  if (searchTerms(q).length === 0) return EMPTY_RESULTS;
  const products = filterProducts(catalog, {
    q,
    collection: collection ? [collection] : undefined,
  });
  return {
    products: products.slice(0, limit).map(toSearchProduct),
    total: products.length,
    ...searchMatches(catalog, collections, notes, q),
  };
}

export type HighlightPart = { text: string; match: boolean };

/** Splits `text` into the parts that match a word of `q` and the rest. */
export function highlightParts(text: string, q: string): HighlightPart[] {
  // Terms are normalized to [a-z0-9], so they are safe inside a RegExp.
  const terms = searchTerms(q).sort((a, b) => b.length - a.length);
  if (terms.length === 0) return [{ text, match: false }];
  // With a capturing group, split puts the matches at the odd indexes.
  return text
    .split(new RegExp(`(${terms.join("|")})`, "i"))
    .map((part, i) => ({ text: part, match: i % 2 === 1 }))
    .filter((part) => part.text !== "");
}
