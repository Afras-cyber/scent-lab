import {
  shopFiltersToSearch,
  type ListFilterKey,
  type ShopFilters,
} from "@/features/catalog/schemas";

/** `/shop` URL for `filters`. */
export function shopHref(filters: ShopFilters): string {
  return `/shop${shopFiltersToSearch(filters)}`;
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

/** Clears every filter but keeps the sort order. */
export function clearedFilters(filters: ShopFilters): ShopFilters {
  return { sort: filters.sort };
}

/** The filters without sort and page, as a comparable string. */
export function filtersKey(filters: ShopFilters): string {
  return shopFiltersToSearch({ ...filters, sort: undefined, page: undefined });
}
