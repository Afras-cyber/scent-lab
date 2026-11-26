import { z } from "zod";

export const SHOP_SORTS = [
  "featured",
  "trending",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
] as const;
export type ShopSort = (typeof SHOP_SORTS)[number];

export const GENDERS = ["men", "women", "unisex"] as const;

const slug = z
  .string()
  .max(60)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const size = z.string().regex(/^\d{1,4}ml$/);
const rupees = z.coerce.number().int().min(0).max(10_000_000);
const flag = z.literal("true").transform(() => true as const);

// Multi-select fields are comma lists in the URL (`?note=oud,amber`); repeated
// keys and single values parse too. Invalid items are dropped one by one.
const LIST_FIELDS = {
  gender: z.enum(GENDERS),
  note: slug,
  collection: slug,
  size,
} as const;

// One schema per field, so a bad value drops only that filter instead of
// failing the whole page.
const SCALAR_FIELDS = {
  occasion: slug,
  minPrice: rupees,
  maxPrice: rupees,
  sale: flag,
  inStock: flag,
  sort: z.enum(SHOP_SORTS),
  page: z.coerce.number().int().min(1).max(1000),
  q: z.string().trim().min(1).max(80),
} as const;

type ListFields = typeof LIST_FIELDS;
type ScalarFields = typeof SCALAR_FIELDS;
export type ListFilterKey = keyof ListFields;

export type ShopFilters = {
  [K in keyof ListFields]?: z.output<ListFields[K]>[];
} & {
  [K in keyof ScalarFields]?: z.output<ScalarFields[K]>;
};

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const MAX_LIST_ITEMS = 20;

function listItems(raw: string | string[] | undefined): string[] {
  const values = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
  return values.flatMap((v) => v.split(",")).map((v) => v.trim());
}

/** Parses `/shop` search params. Unknown keys and invalid values are dropped. */
export function parseShopFilters(params: SearchParamsRecord): ShopFilters {
  const filters: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(LIST_FIELDS)) {
    const items = [
      ...new Set(
        listItems(params[key]).flatMap((item) => {
          const parsed = schema.safeParse(item);
          return parsed.success ? [parsed.data] : [];
        }),
      ),
    ].slice(0, MAX_LIST_ITEMS);
    if (items.length > 0) filters[key] = items;
  }

  for (const [key, schema] of Object.entries(SCALAR_FIELDS)) {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined || value === "") continue;
    const parsed = schema.safeParse(value);
    if (parsed.success) filters[key] = parsed.data;
  }
  return filters as ShopFilters;
}

/** Builds a query string from filters, leaving out defaults. */
export function shopFiltersToSearch(filters: ShopFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(","));
      continue;
    }
    if (key === "page" && value === 1) continue;
    if (key === "sort" && value === "featured") continue;
    params.set(key, String(value));
  }
  // Keep commas readable in shareable links.
  const search = params.toString().replaceAll("%2C", ",");
  return search ? `?${search}` : "";
}

/** Number of active filters (each list item counts), ignoring sort and page. */
export function countActiveFilters(filters: ShopFilters): number {
  let count = 0;
  for (const key of Object.keys(LIST_FIELDS) as ListFilterKey[]) {
    count += filters[key]?.length ?? 0;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    count += 1;
  }
  if (filters.sale) count += 1;
  if (filters.inStock) count += 1;
  if (filters.occasion) count += 1;
  if (filters.q) count += 1;
  return count;
}
