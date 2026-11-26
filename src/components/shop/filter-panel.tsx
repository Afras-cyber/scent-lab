"use client";

import { shopConfig } from "@/config";
import type { FacetCounts } from "@/features/catalog/filter";
import { GENDERS } from "@/features/catalog/schemas";
import type { CatalogNote } from "@/features/catalog/types";

import {
  FilterCheckbox,
  FilterPill,
  FilterSection,
  FilterSwitch,
} from "./filter-controls";
import { PriceRange } from "./price-range";
import { toggleItem } from "./shop-href";
import { useShopNavigation } from "./shop-navigation";

export type FilterOptions = {
  counts: FacetCounts;
  notes: CatalogNote[];
  sizes: string[];
  priceBounds: { min: number; max: number };
};

/**
 * Filter sections from the design. `sidebar` (desktop) uses checkboxes with
 * counts for For and Type; `sheet` (mobile) uses pills and shows how many
 * options each section has selected.
 */
export function FilterPanel({
  options,
  variant,
}: {
  options: FilterOptions;
  variant: "sidebar" | "sheet";
}) {
  const { filters, update } = useShopNavigation();
  const { counts, notes, sizes, priceBounds } = options;
  const sheet = variant === "sheet";
  const priceSelected =
    filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0;

  const genderOptions = GENDERS.map((g) => ({
    value: g,
    label: shopConfig.genderLabels[g],
    count: counts.gender[g] ?? 0,
  }));
  const typeOptions = shopConfig.types.map((t) => ({
    value: t.slug,
    label: t.label,
    count: counts.collection[t.slug] ?? 0,
  }));

  return (
    <div className="flex flex-col">
      <FilterSection
        title="For"
        selected={filters.gender?.length}
        showCount={sheet}
      >
        <OptionList
          sheet={sheet}
          options={genderOptions}
          selected={filters.gender ?? []}
          onToggle={(v) => update(toggleItem(filters, "gender", v))}
          grid
        />
      </FilterSection>

      <FilterSection
        title={sheet ? "Price" : "Price (Rs)"}
        selected={priceSelected}
        showCount={sheet}
      >
        <PriceRange bounds={priceBounds} />
      </FilterSection>

      <FilterSection
        title="Type"
        selected={
          filters.collection?.filter((c) =>
            typeOptions.some((t) => t.value === c),
          ).length
        }
        showCount={sheet}
      >
        <OptionList
          sheet={sheet}
          options={typeOptions}
          selected={filters.collection ?? []}
          onToggle={(v) => update(toggleItem(filters, "collection", v))}
        />
      </FilterSection>

      {notes.length > 0 && (
        <FilterSection
          title="Scent notes"
          selected={filters.note?.length}
          showCount={sheet}
        >
          <div className="flex flex-wrap gap-2">
            {notes.map((note) => {
              const active = filters.note?.includes(note.slug) ?? false;
              return (
                <FilterPill
                  key={note.slug}
                  active={active}
                  disabled={!active && !counts.note[note.slug]}
                  onClick={() => update(toggleItem(filters, "note", note.slug))}
                >
                  {note.name}
                </FilterPill>
              );
            })}
          </div>
        </FilterSection>
      )}

      {sizes.length > 0 && (
        <FilterSection
          title="Size"
          selected={filters.size?.length}
          showCount={sheet}
        >
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = filters.size?.includes(size) ?? false;
              return (
                <FilterPill
                  key={size}
                  active={active}
                  disabled={!active && !counts.size[size]}
                  onClick={() => update(toggleItem(filters, "size", size))}
                >
                  {size}
                </FilterPill>
              );
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection
        title="Availability"
        selected={(filters.inStock ? 1 : 0) + (filters.sale ? 1 : 0)}
        showCount={sheet}
      >
        <div className="flex flex-col gap-4">
          <FilterSwitch
            label="In stock only"
            checked={filters.inStock ?? false}
            onCheckedChange={() =>
              update({ inStock: filters.inStock ? undefined : true })
            }
          />
          <FilterSwitch
            label="On sale"
            checked={filters.sale ?? false}
            onCheckedChange={() =>
              update({ sale: filters.sale ? undefined : true })
            }
          />
        </div>
      </FilterSection>
    </div>
  );
}

/** Checkboxes with counts (sidebar) or pills (sheet). */
function OptionList({
  sheet,
  options,
  selected,
  onToggle,
  grid = false,
}: {
  sheet: boolean;
  options: { value: string; label: string; count: number }[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  grid?: boolean;
}) {
  if (sheet) {
    return (
      <div className={grid ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-2"}>
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <FilterPill
              key={o.value}
              active={active}
              disabled={!active && o.count === 0}
              onClick={() => onToggle(o.value)}
              className={grid ? "h-11 text-sm" : undefined}
            >
              {o.label}
            </FilterPill>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <FilterCheckbox
          key={o.value}
          label={o.label}
          count={o.count}
          checked={selected.includes(o.value)}
          onCheckedChange={() => onToggle(o.value)}
        />
      ))}
    </div>
  );
}
