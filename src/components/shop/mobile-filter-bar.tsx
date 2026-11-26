"use client";

import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countActiveFilters } from "@/features/catalog/schemas";

import { FilterPanel, type FilterOptions } from "./filter-panel";
import { clearedFilters } from "./shop-href";
import { useShopNavigation } from "./shop-navigation";
import { sortLabel, SortOptions } from "./sort-menu";

const triggerClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold text-heading";

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
      {count}
    </span>
  );
}

/** Bottom sheet frame: drag handle, title, scrolling body, optional footer. */
function BottomSheet({
  title,
  description,
  badge,
  footer,
  children,
}: {
  title: string;
  description: string;
  badge?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SheetContent
      side="bottom"
      className="max-h-[88dvh] overflow-hidden bg-card lg:hidden"
    >
      <span
        className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-input"
        aria-hidden
      />
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <SheetTitle className="font-sans text-xl font-semibold">
          {title}
        </SheetTitle>
        {badge}
      </div>
      <SheetDescription className="sr-only">{description}</SheetDescription>
      <div className="flex-1 overflow-y-auto border-t px-5 py-5">
        {children}
      </div>
      {footer && (
        <div className="flex gap-3 border-t bg-card px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </SheetContent>
  );
}

/** Mobile Filter and Sort buttons with their bottom sheets. */
export function MobileFilterBar({
  options,
  total,
}: {
  options: FilterOptions;
  total: number;
}) {
  const { filters, replace } = useShopNavigation();
  const [sortOpen, setSortOpen] = useState(false);
  const active = countActiveFilters(filters);

  return (
    <div className="grid grid-cols-2 gap-3 lg:hidden">
      <Sheet>
        <SheetTrigger className={triggerClass}>
          <SlidersHorizontal className="size-4" aria-hidden />
          Filter
          <CountBadge count={active} />
        </SheetTrigger>
        <BottomSheet
          title="Filters"
          description="Narrow the perfumes by gender, price, type, notes, size and availability."
          badge={<CountBadge count={active} />}
          footer={
            <>
              <Button
                variant="outline"
                size="lg"
                className="h-13 bg-card px-6"
                disabled={active === 0}
                onClick={() => replace(clearedFilters(filters))}
              >
                Clear all
              </Button>
              <SheetClose asChild>
                <Button size="lg" className="h-13 flex-1">
                  Show {total} {total === 1 ? "result" : "results"}
                </Button>
              </SheetClose>
            </>
          }
        >
          <FilterPanel options={options} variant="sheet" />
        </BottomSheet>
      </Sheet>

      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetTrigger className={triggerClass}>
          <ArrowUpDown className="size-4" aria-hidden />
          Sort
          <span className="truncate text-xs font-normal text-muted-foreground">
            {sortLabel(filters.sort)}
          </span>
        </SheetTrigger>
        <BottomSheet
          title="Sort by"
          description="Choose how perfumes are ordered."
        >
          <SortOptions onSelect={() => setSortOpen(false)} />
        </BottomSheet>
      </Sheet>
    </div>
  );
}
