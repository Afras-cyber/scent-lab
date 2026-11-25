import { describe, expect, it, vi } from "vitest";

import { filterProducts, paginate } from "@/features/catalog/filter";
import { toProductCard } from "@/features/catalog/mappers";
import {
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

describe("parseShopFilters", () => {
  it("keeps valid values and drops invalid ones", () => {
    expect(
      parseShopFilters({
        gender: "men",
        note: ["oud", "rose"],
        maxPrice: "3000",
        minPrice: "-5",
        sale: "yes",
        sort: "price-asc",
        page: "0",
        collection: "Bad Slug!",
        other: "x",
      }),
    ).toEqual({
      gender: "men",
      note: "oud",
      maxPrice: 3000,
      sort: "price-asc",
    });
  });

  it("round-trips through the query string without defaults", () => {
    const filters = parseShopFilters({
      sale: "true",
      page: "2",
      sort: "featured",
    });
    expect(filters).toEqual({ sale: true, page: 2, sort: "featured" });
    expect(shopFiltersToSearch(filters)).toBe("?sale=true&page=2");
    expect(shopFiltersToSearch({})).toBe("");
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
    }),
  ];
  const ids = (list: ProductCardData[]) => list.map((p) => p.id);

  it("shows unisex under men and women", () => {
    expect(ids(filterProducts(products, { gender: "women" }))).toEqual([
      "a",
      "b",
    ]);
  });

  it("filters by note, collection, occasion, price and sale", () => {
    expect(ids(filterProducts(products, { note: "musk" }))).toEqual(["b"]);
    expect(ids(filterProducts(products, { collection: "musk-amber" }))).toEqual(
      ["b"],
    );
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
