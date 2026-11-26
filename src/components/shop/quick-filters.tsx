import Link from "next/link";

import { shopConfig } from "@/config";
import type { ShopFilters } from "@/features/catalog/schemas";
import { cn } from "@/lib/utils";

import { filtersKey, shopHref } from "./shop-href";

/** "All / For Him / … / On Sale" pills. Each replaces the filters, keeping the sort. */
export function QuickFilters({ filters }: { filters: ShopFilters }) {
  const current = filtersKey(filters);

  return (
    <nav aria-label="Quick filters" className="-mx-5 lg:mx-0">
      <ul className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 lg:flex-wrap lg:gap-3 lg:overflow-visible lg:px-0">
        {shopConfig.quickFilters.map((quick) => {
          // Config arrays are readonly; nothing mutates them.
          const target = {
            ...quick.filters,
            sort: filters.sort,
          } as ShopFilters;
          const active = filtersKey(target) === current;
          return (
            <li key={quick.label} className="shrink-0">
              <Link
                href={shopHref(target)}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors lg:h-11 lg:px-5 lg:text-[15px]",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-heading hover:bg-muted",
                )}
              >
                {quick.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
