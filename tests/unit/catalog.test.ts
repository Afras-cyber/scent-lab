import { describe, expect, it, vi } from "vitest";

import {
  catalogSizes,
  facetCounts,
  filterProducts,
  paginate,
  priceBounds,
} from "@/features/catalog/filter";
import { parseSizes, toProductCard } from "@/features/catalog/mappers";
import {
  countActiveFilters,
  parseShopFilters,
  shopFiltersToSearch,
} from "@/features/catalog/schemas";
import type { ProductCardData, ProductRow } from "@/features/catalog/types";
import { resolveImagePath } from "@/lib/images";

vi.mock("@/lib/public-env", () => ({
  publicEnv: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321/" },
}));

function row(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "p1",
    slug: "oud-royale",
    name: "Oud Royale",
    short_description: "Smoky oud",
    gender: "unisex",
    occasions: ["party"],
    is_featured: false,
    rating_avg: 4.5,
    rating_count: 2,
    created_at: "2026-11-01T00:00:00Z",
    product_variants: [
      {
        id: "v12",
        label: "12ml",
        price_lkr: 2490,
        compare_at_lkr: 2990,
        stock: 25,
        sort_order: 2,
      },
      {
        id: "v6",
        label: "6ml",
        price_lkr: 1490,
        compare_at_lkr: null,
        stock: 40,
        sort_order: 1,
      },
    ],
    product_images: [],
    product_notes: [
      { sort_order: 2, notes: { slug: "leather", name: "Leather" } },
      { sort_order: 1, notes: { slug: "oud", name: "Oud" } },
    ],
    product_collections: [
      { collections: { slug: "oud", name: "Oud" } },
      { collections: null },
    ],
    ...overrides,
  };
}

function card(overrides: Partial<ProductCardData> = {}): ProductCardData {
  return { ...toProductCard(row())!, ...overrides };
}

describe("resolveImagePath", () => {
  it("keeps public files and builds bucket URLs", () => {
    expect(resolveImagePath("/images/a.png")).toBe("/images/a.png");
    expect(resolveImagePath("oud/a b.webp")).toBe(
      "http://127.0.0.1:54321/storage/v1/object/public/products/oud/a%20b.webp",
    );
    expect(resolveImagePath(null)).toBe("/images/products/product_image.png");
  });
});

describe("toProductCard", () => {
  it("uses the cheapest buyable variant and sorts notes", () => {
    const c = toProductCard(row())!;
    expect(c).toMatchObject({
      defaultVariantId: "v6",
      price: 1490,
      compareAt: null,
      variantCount: 2,
      onSale: true,
      inStock: true,
      lowStock: false,
      collectionSlugs: ["oud"],
    });
    expect(c.notes.map((n) => n.slug)).toEqual(["oud", "leather"]);
    expect(c.sizes).toEqual(["6ml", "12ml"]);
    expect(c.image.src).toBe("/images/products/product_image.png");
  });

  it("skips sold-out variants for the price and flags low stock", () => {
    const c = toProductCard(
      row({
        product_variants: [
          {
            id: "a",
            label: "6ml",
            price_lkr: 990,
            compare_at_lkr: null,
            stock: 0,
            sort_order: 1,
          },
          {
            id: "b",
            label: "12ml",
            price_lkr: 1990,
            compare_at_lkr: null,
            stock: 2,
            sort_order: 2,
          },
        ],
      }),
    )!;
    expect(c).toMatchObject({
      defaultVariantId: "b",
      price: 1990,
      inStock: true,
      lowStock: true,
    });
  });

  it("marks products with no stock as sold out and hides products with no variants", () => {
    const soldOut = toProductCard(
      row({
        product_variants: [
          {
            id: "a",
            label: "6ml",
            price_lkr: 990,
            compare_at_lkr: null,
            stock: 0,
            sort_order: 1,
          },
        ],
      }),
    )!;
    expect(soldOut).toMatchObject({ inStock: false, lowStock: false });
    expect(toProductCard(row({ product_variants: [] }))).toBeNull();
  });
});

describe("parseSizes", () => {
  it.each([
    ["12ml attar", ["12ml"]],
    ["50 ML spray", ["50ml"]],
    ["5 × 3ml", ["3ml"]],
    ["12ml + 50ml", ["12ml", "50ml"]],
    ["06ml", ["6ml"]],
    ["Gift box", []],
  ])("%s → %j", (label, expected) => {
    expect(parseSizes(label)).toEqual(expected);
  });
});

describe("parseShopFilters", () => {
  it("keeps valid values and drops invalid ones", () => {
    expect(
      parseShopFilters({
        gender: "men,robots",
        note: ["oud,rose", "rose", "Bad!"],
        size: "12ml,big",
        maxPrice: "3000",
        minPrice: "-5",
        sale: "yes",
        inStock: "true",
        sort: "price-asc",
        page: "0",
        collection: "Bad Slug!",
        other: "x",
      }),
    ).toEqual({
      gender: ["men"],
      note: ["oud", "rose"],
      size: ["12ml"],
      maxPrice: 3000,
      inStock: true,
      sort: "price-asc",
    });
  });

  it("round-trips through the query string without defaults", () => {
    const filters = parseShopFilters({
      sale: "true",
      page: "2",
      sort: "featured",
      note: "oud,amber",
    });
    expect(filters).toEqual({
      note: ["oud", "amber"],
      sale: true,
      page: 2,
      sort: "featured",
    });
    expect(shopFiltersToSearch(filters)).toBe(
      "?note=oud,amber&sale=true&page=2",
    );
    expect(shopFiltersToSearch({ note: [] })).toBe("");
    expect(shopFiltersToSearch({})).toBe("");
  });

  it("counts active filters, ignoring sort and page", () => {
    expect(
      countActiveFilters({
        gender: ["men"],
        note: ["oud", "amber"],
        minPrice: 500,
        maxPrice: 3000,
        sale: true,
        sort: "rating",
        page: 3,
      }),
    ).toBe(5);
  });
});

describe("filterProducts", () => {
  const products = [
    card({
      id: "a",
      name: "Oud Royale",
      gender: "unisex",
      price: 1490,
      isFeatured: true,
    }),
    card({
      id: "b",
      name: "White Musk",
      shortDescription: "Soft clean musk",
      gender: "women",
      price: 990,
      onSale: false,
      notes: [{ slug: "musk", name: "Musk" }],
      collectionSlugs: ["musk-amber"],
      occasions: ["office"],
    }),
    card({
      id: "c",
      name: "Oud Noir",
      gender: "men",
      price: 3980,
      inStock: false,
    }),
    card({
      id: "d",
      name: "Royal Spray",
      gender: "men",
      price: 3290,
      ratingAvg: 5,
      sizes: ["50ml"],
    }),
  ];
  const ids = (list: ProductCardData[]) => list.map((p) => p.id);

  it("shows unisex under men and women", () => {
    expect(ids(filterProducts(products, { gender: ["women"] }))).toEqual([
      "a",
      "b",
    ]);
  });

  it("filters by note, collection, occasion, price and sale", () => {
    expect(ids(filterProducts(products, { note: ["musk"] }))).toEqual(["b"]);
    expect(
      ids(filterProducts(products, { collection: ["musk-amber"] })),
    ).toEqual(["b"]);
    expect(ids(filterProducts(products, { occasion: "office" }))).toEqual([
      "b",
    ]);
    expect(
      ids(filterProducts(products, { maxPrice: 1500, sort: "price-asc" })),
    ).toEqual(["b", "a"]);
    expect(ids(filterProducts(products, { minPrice: 3000 }))).toEqual([
      "d",
      "c",
    ]);
    expect(ids(filterProducts(products, { sale: true }))).not.toContain("b");
  });

  it("matches any option within a facet and every facet across them", () => {
    expect(
      ids(
        filterProducts(products, { note: ["musk", "oud"], sort: "price-asc" }),
      ),
    ).toEqual(["b", "a", "d", "c"]);
    expect(
      ids(filterProducts(products, { note: ["musk", "oud"], gender: ["men"] })),
    ).toEqual(["a", "d", "c"]); // a is unisex
  });

  it("filters by size and stock", () => {
    expect(ids(filterProducts(products, { size: ["50ml"] }))).toEqual(["d"]);
    expect(ids(filterProducts(products, { inStock: true }))).not.toContain("c");
  });

  it("sorts and puts sold-out products last", () => {
    expect(ids(filterProducts(products, { sort: "price-desc" }))).toEqual([
      "d",
      "a",
      "b",
      "c",
    ]);
  });

  it("searches across name and notes, name matches first", () => {
    expect(ids(filterProducts(products, { q: "oud" }))).toEqual([
      "a",
      "d",
      "c",
    ]);
    expect(ids(filterProducts(products, { q: "MUSK" }))).toEqual(["b"]);
    expect(filterProducts(products, { q: "vanilla" })).toEqual([]);
  });
});

describe("facetCounts", () => {
  const products = [
    card({ id: "a", gender: "unisex", sizes: ["6ml"] }),
    card({
      id: "b",
      gender: "women",
      notes: [{ slug: "musk", name: "Musk" }],
      sizes: ["12ml"],
    }),
    card({ id: "c", gender: "men", sizes: ["12ml"] }),
  ];

  it("counts each option against the other active filters", () => {
    const counts = facetCounts(products, { gender: ["men"] });
    // The gender facet ignores its own selection; unisex counts for all.
    expect(counts.gender).toEqual({ men: 2, women: 2, unisex: 1 });
    // Other facets only count products matching Men (a and c).
    expect(counts.note).toEqual({ oud: 2, leather: 2 });
    expect(counts.size).toEqual({ "6ml": 1, "12ml": 1 });
  });
});

describe("priceBounds and catalogSizes", () => {
  it("widens to whole hundreds and sorts sizes numerically", () => {
    const products = [
      card({ price: 990, sizes: ["12ml", "100ml"] }),
      card({ price: 4510, sizes: ["3ml", "12ml"] }),
    ];
    expect(priceBounds(products)).toEqual({ min: 900, max: 4600 });
    expect(priceBounds([])).toEqual({ min: 0, max: 0 });
    expect(catalogSizes(products)).toEqual(["3ml", "12ml", "100ml"]);
  });
});

describe("paginate", () => {
  it("clamps the page", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    expect(paginate(items, 3, 12)).toMatchObject({
      items: [24],
      page: 3,
      pageCount: 3,
      total: 25,
    });
    expect(paginate(items, 9, 12).page).toBe(3);
    expect(paginate([], 1, 12)).toMatchObject({
      items: [],
      page: 1,
      pageCount: 1,
    });
  });
});
