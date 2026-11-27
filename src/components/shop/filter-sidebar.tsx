"use client";

import { SlidersHorizontal } from "lucide-react";

import { FilterPanel, type FilterOptions } from "./filter-panel";
import { clearableCount, clearedFilters } from "./shop-href";
import { useShopNavigation } from "./shop-navigation";

/** Desktop filter card on the left of the grid. */
export function FilterSidebar({ options }: { options: FilterOptions }) {
  const { filters, replace, scope } = useShopNavigation();

  return (
    <aside
      aria-label="Filters"
      className="hidden self-start rounded-[20px] bg-card p-6 shadow-sm lg:block"
    >
      <div className="mb-5 flex items-center justify-between border-b pb-5">
        <h2 className="flex items-center gap-2.5 font-sans text-lg font-semibold">
          <SlidersHorizontal className="size-[18px]" aria-hidden />
          Filters
        </h2>
        {clearableCount(filters, scope) > 0 && (
          <button
            type="button"
            onClick={() => replace(clearedFilters(filters, scope))}
            className="text-sm font-medium text-heading hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <FilterPanel options={options} variant="sidebar" />
    </aside>
  );
}
