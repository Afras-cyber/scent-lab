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

const slug = z
  .string()
  .max(60)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const rupees = z.coerce.number().int().min(0).max(10_000_000);

// One schema per field, so a bad value drops only that filter instead of
// failing the whole page.
const fieldSchemas = {
  gender: z.enum(["men", "women", "unisex"]),
  note: slug,
  occasion: slug,
  collection: slug,
  minPrice: rupees,
  maxPrice: rupees,
  sale: z.literal("true").transform(() => true as const),
  sort: z.enum(SHOP_SORTS),
  page: z.coerce.number().int().min(1).max(1000),
  q: z.string().trim().min(1).max(80),
};

type FieldSchemas = typeof fieldSchemas;
export type ShopFilters = {
  [K in keyof FieldSchemas]?: z.output<FieldSchemas[K]>;
};

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

/** Parses `/shop` search params. Unknown keys and invalid values are dropped. */
export function parseShopFilters(params: SearchParamsRecord): ShopFilters {
  const filters: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(fieldSchemas)) {
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
    if (key === "page" && value === 1) continue;
    if (key === "sort" && value === "featured") continue;
    params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}
