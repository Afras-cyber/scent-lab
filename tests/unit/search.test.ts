import { describe, expect, it } from "vitest";

import {
  clearableCount,
  clearedFilters,
  scopeHref,
  type ListingScope,
} from "@/components/shop/shop-href";
import { collectionStats } from "@/features/catalog/filter";
import type {
  CatalogCollection,
  ProductCardData,
} from "@/features/catalog/types";
import { addRecent, MAX_RECENT, removeRecent } from "@/features/search/recent";
import { searchHref, searchQuerySchema } from "@/features/search/schemas";
import { highlightParts, searchCatalog } from "@/features/search/search";

function card(overrides: Partial<ProductCardData>): ProductCardData {
  return {
    id: overrides.slug ?? "p",
    slug: "p",
    name: "Product",
    shortDescription: null,
    gender: "unisex",
    occasions: [],
    isFeatured: false,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: "2026-11-01T00:00:00Z",
    image: { src: "/images/p.png", alt: "", width: null, height: null },
    defaultVariantId: "v",
    price: 1000,
    compareAt: null,
    variantCount: 1,
    onSale: false,
    inStock: true,
    lowStock: false,
    notes: [],
    collectionSlugs: [],
    sizes: ["12ml"],
    ...overrides,
  };
}

const catalog = [
  card({
    slug: "oud-royale",
    name: "Oud Royale",
    price: 1490,
    variantCount: 2,
    sizes: ["6ml", "12ml"],
    notes: [
      { slug: "oud", name: "Oud" },
      { slug: "amber", name: "Amber" },
      { slug: "musk", name: "Musk" },
      { slug: "rose", name: "Rose" },
    ],
    collectionSlugs: ["oud", "attar-oils"],
  }),
  card({
    slug: "royal-oud-spray",
    name: "Royal Oud Spray",
    price: 3290,
    notes: [{ slug: "oudh-wood", name: "Oudh wood" }],
    collectionSlugs: ["oud", "spray-perfumes"],
  }),
  card({
    slug: "white-musk",
    name: "White Musk",
    price: 990,
    notes: [{ slug: "musk", name: "Musk" }],
    collectionSlugs: ["attar-oils"],
  }),
];

const collections: CatalogCollection[] = [
  {
    id: "1",
    slug: "oud",
    name: "Oud Collection",
    description: null,
    image: null,
  },
  {
    id: "2",
    slug: "attar-oils",
    name: "Attar Oils",
    description: null,
    image: null,
  },
  {
    id: "3",
    slug: "gift-sets",
    name: "Oud Gift Sets",
    description: null,
    image: null,
  },
];

const notes = [
  { slug: "oud", name: "Oud" },
  { slug: "oudh-wood", name: "Oudh wood" },
  { slug: "amber", name: "Amber" },
  { slug: "oud-unused", name: "Oud smoke" },
];

describe("searchCatalog", () => {
  it("returns products, matching collections and used notes", () => {
    const results = searchCatalog(catalog, collections, notes, { q: "oud" }, 4);
    expect(results.total).toBe(2);
    expect(results.products.map((p) => p.slug)).toEqual([
      "oud-royale",
      "royal-oud-spray",
    ]);
    // Gift sets has no products, so it is left out.
    expect(results.collections).toEqual([
      { slug: "oud", name: "Oud Collection", count: 2 },
    ]);
    // "oud" matches "Oudh wood"; a note no product uses is left out.
    expect(results.notes.map((n) => n.slug)).toEqual(["oud", "oudh-wood"]);
  });

  it("builds compact product rows", () => {
    const [royale, spray] = searchCatalog(
      catalog,
      collections,
      notes,
      { q: "oud" },
      4,
    ).products;
    expect(royale).toMatchObject({
      notes: ["Oud", "Amber", "Musk"],
      sizeLabel: "2 sizes",
      multiVariant: true,
      price: 1490,
    });
    expect(spray).toMatchObject({ sizeLabel: "12ml", multiVariant: false });
  });

  it("limits rows but counts every match, and scopes to a collection", () => {
    const limited = searchCatalog(catalog, collections, notes, { q: "oud" }, 1);
    expect(limited.products).toHaveLength(1);
    expect(limited.total).toBe(2);

    const scoped = searchCatalog(
      catalog,
      collections,
      notes,
      { q: "oud", collection: "spray-perfumes" },
      4,
    );
    expect(scoped.products.map((p) => p.slug)).toEqual(["royal-oud-spray"]);
  });

  it("returns nothing for an empty or punctuation-only query", () => {
    expect(searchCatalog(catalog, collections, notes, { q: "!!" }, 4)).toEqual({
      products: [],
      total: 0,
      collections: [],
      notes: [],
    });
  });
});

describe("highlightParts", () => {
  it("marks every match, case-insensitively", () => {
    expect(highlightParts("Royal Oud Spray", "oud")).toEqual([
      { text: "Royal ", match: false },
      { text: "Oud", match: true },
      { text: " Spray", match: false },
    ]);
    expect(highlightParts("Oudh wood", "OUD")).toEqual([
      { text: "Oud", match: true },
      { text: "h wood", match: false },
    ]);
  });

  it("handles several words and no match", () => {
    expect(
      highlightParts("Oud Rose Attar", "rose oud").filter((p) => p.match),
    ).toEqual([
      { text: "Oud", match: true },
      { text: "Rose", match: true },
    ]);
    expect(highlightParts("Amber", "oud")).toEqual([
      { text: "Amber", match: false },
    ]);
    expect(highlightParts("Amber", "")).toEqual([
      { text: "Amber", match: false },
    ]);
  });
});

describe("recent searches", () => {
  it("puts the newest first without case-insensitive duplicates", () => {
    expect(addRecent(["amber", "Oud"], "  oud ")).toEqual(["oud", "amber"]);
    expect(addRecent(["amber"], "   ")).toEqual(["amber"]);
  });

  it("keeps at most MAX_RECENT and removes items", () => {
    const many = Array.from({ length: MAX_RECENT }, (_, i) => `q${i}`);
    const next = addRecent(many, "new");
    expect(next).toHaveLength(MAX_RECENT);
    expect(next[0]).toBe("new");
    expect(removeRecent(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("search schemas", () => {
  it("validates the API query and drops a bad collection", () => {
    expect(searchQuerySchema.safeParse({ q: "  " }).success).toBe(false);
    expect(
      searchQuerySchema.parse({ q: " oud ", collection: "Bad Slug" }),
    ).toEqual({ q: "oud", collection: undefined });
  });

  it("builds /search URLs", () => {
    expect(searchHref("white musk")).toBe("/search?q=white+musk");
    expect(searchHref("oud", "attar-oils")).toBe(
      "/search?q=oud&collection=attar-oils",
    );
  });
});

describe("listing scopes", () => {
  const collectionScope: ListingScope = {
    path: "/collections/oud",
    locked: { collection: ["oud"] },
  };
  const searchScope: ListingScope = { path: "/search", keep: ["q"] };

  it("keeps locked filters out of the URL", () => {
    expect(
      scopeHref(collectionScope, {
        collection: ["oud"],
        note: ["rose"],
        page: 2,
      }),
    ).toBe("/collections/oud?note=rose&page=2");
  });

  it("keeps the query when clearing filters on /search", () => {
    const filters = { q: "oud", note: ["amber"], sort: "newest" as const };
    expect(clearedFilters(filters, searchScope)).toEqual({
      q: "oud",
      sort: "newest",
    });
    expect(clearableCount(filters, searchScope)).toBe(1);
    expect(clearableCount({ q: "oud" }, searchScope)).toBe(0);
    expect(scopeHref(searchScope, clearedFilters(filters, searchScope))).toBe(
      "/search?q=oud&sort=newest",
    );
  });
});

describe("collectionStats", () => {
  it("counts products and finds the lowest price per collection", () => {
    const stats = collectionStats(catalog);
    expect(stats.get("oud")).toEqual({ count: 2, minPrice: 1490 });
    expect(stats.get("attar-oils")).toEqual({ count: 2, minPrice: 990 });
    expect(stats.has("gift-sets")).toBe(false);
  });
});
