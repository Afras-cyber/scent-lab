"use client";

import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { shopConfig } from "@/config";
import { SHOP_SORTS, type ShopSort } from "@/features/catalog/schemas";
import { cn } from "@/lib/utils";

import type { ListingScope } from "./shop-href";
import { useShopNavigation } from "./shop-navigation";

// Menu order from the design: Recommended first.
const SORT_ORDER = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "trending",
  "rating",
] as const satisfies readonly ShopSort[];

export function sortLabel(sort: ShopSort | undefined, scope?: ListingScope) {
  const value = sort ?? "featured";
  // The default sort keeps no URL param; on /search it means best match.
  if (value === "featured" && scope?.defaultSortLabel) {
    return scope.defaultSortLabel;
  }
  return shopConfig.sortLabels[value];
}

function useSort() {
  const { filters, update, scope } = useShopNavigation();
  const current = filters.sort ?? "featured";
  const label = (sort: ShopSort) => sortLabel(sort, scope);
  const select = (value: string) => {
    if (!(SHOP_SORTS as readonly string[]).includes(value)) return;
    update({ sort: value === "featured" ? undefined : (value as ShopSort) });
  };
  return { current, select, label };
}

/** Desktop "Sort: Recommended" dropdown. */
export function SortDropdown() {
  const { current, select, label } = useSort();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="inline-flex h-12 items-center gap-2 rounded-full border bg-card px-5 text-sm text-heading transition-colors hover:bg-muted data-[state=open]:bg-muted">
        <ArrowUpDown className="size-4" aria-hidden />
        <span className="text-muted-foreground">Sort:</span>
        <span className="font-semibold">{label(current)}</span>
        <ChevronDown className="size-4" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-2xl border bg-popover p-1.5 text-popover-foreground shadow-lg data-[state=open]:animate-fade-in"
        >
          <DropdownMenu.RadioGroup value={current} onValueChange={select}>
            {SORT_ORDER.map((sort) => (
              <DropdownMenu.RadioItem
                key={sort}
                value={sort}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm outline-none data-highlighted:bg-muted data-[state=checked]:font-semibold data-[state=checked]:text-heading"
              >
                {label(sort)}
                <DropdownMenu.ItemIndicator>
                  <Check className="size-4" aria-hidden />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Mobile sort sheet body: a radio list that applies on tap. */
export function SortOptions({ onSelect }: { onSelect: () => void }) {
  const { current, select, label } = useSort();

  return (
    <ul role="radiogroup" aria-label="Sort by" className="flex flex-col">
      {SORT_ORDER.map((sort) => {
        const checked = sort === current;
        return (
          <li key={sort} className="border-b last:border-b-0">
            <button
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => {
                select(sort);
                onSelect();
              }}
              className="flex w-full items-center justify-between py-5 text-left text-base text-heading"
            >
              <span className={cn(checked && "font-semibold")}>
                {label(sort)}
              </span>
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full border-2",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input",
                )}
                aria-hidden
              >
                {checked && <Check className="size-4" strokeWidth={3} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
