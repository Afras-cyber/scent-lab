import {
  countActiveFilters,
  shopFiltersToSearch,
  type ListFilterKey,
  type ShopFilters,
} from "@/features/catalog/schemas";

/**
 * Which page a product listing lives on. `/shop`, a collection and `/search`
 * share the same filters, sort and grid; the scope sets the URL path, filters
 * fixed by the page (`locked`, never in the URL) and filters that survive
 * "Clear all" (`keep`, e.g. the search query).
 */
export type ListingScope = {
  path: string;
  locked?: ShopFilters;
  keep?: (keyof ShopFilters)[];
  /** Hide the "Type" facet (collection pages: the type is the collection). */
  hideType?: boolean;
  /** Label of the default sort, when it isn't "Recommended". */
  defaultSortLabel?: string;
};

export const SHOP_SCOPE: ListingScope = { path: "/shop" };

/** `filters` without the keys the scope locks. */
export function withoutLocked(
  filters: ShopFilters,
  scope: ListingScope,
): ShopFilters {
  const result: Record<string, unknown> = { ...filters };
  for (const key of Object.keys(scope.locked ?? {})) delete result[key];
  return result as ShopFilters;
}

/** URL of `filters` on the scope's page. */
export function scopeHref(scope: ListingScope, filters: ShopFilters): string {
  return `${scope.path}${shopFiltersToSearch(withoutLocked(filters, scope))}`;
}

/** `/shop` URL for `filters`. */
export function shopHref(filters: ShopFilters): string {
  return scopeHref(SHOP_SCOPE, filters);
}

/** `filters` with `patch` applied and the page reset to 1. */
export function patchFilters(
  filters: ShopFilters,
  patch: Partial<ShopFilters>,
): ShopFilters {
  return { ...filters, ...patch, page: undefined };
}

/** Adds `value` to a multi-select filter, or removes it if already there. */
export function toggleItem(
  filters: ShopFilters,
  key: ListFilterKey,
  value: string,
): Partial<ShopFilters> {
  const list: string[] = filters[key] ?? [];
  const next = list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
  return { [key]: next.length > 0 ? next : undefined };
}

/** Clears every filter but keeps the sort order and the scope's kept keys. */
export function clearedFilters(
  filters: ShopFilters,
  scope: ListingScope = SHOP_SCOPE,
): ShopFilters {
  // Kept keys first, so the URL reads /search?q=oud&sort=newest.
  const cleared: Record<string, unknown> = {};
  for (const key of scope.keep ?? []) cleared[key] = filters[key];
  cleared.sort = filters.sort;
  return cleared as ShopFilters;
}

/** Active filters that "Clear all" would remove. */
export function clearableCount(
  filters: ShopFilters,
  scope: ListingScope = SHOP_SCOPE,
): number {
  const clearable: Record<string, unknown> = { ...filters };
  for (const key of scope.keep ?? []) delete clearable[key];
  return countActiveFilters(clearable as ShopFilters);
}

/** The filters without sort and page, as a comparable string. */
export function filtersKey(filters: ShopFilters): string {
  return shopFiltersToSearch({ ...filters, sort: undefined, page: undefined });
}
