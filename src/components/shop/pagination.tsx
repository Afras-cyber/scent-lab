import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import type { ShopFilters } from "@/features/catalog/schemas";
import { cn } from "@/lib/utils";

import { scopeHref, type ListingScope } from "./shop-href";

/**
 * Page numbers to show: always the first and last, the current page and its
 * neighbours; gaps become "…". With 7 pages or fewer, every page.
 */
export function pageItems(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  // Keep 5 numbered slots near the ends so the bar doesn't jump.
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) {
    [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
  }
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

const itemClass =
  "inline-flex size-11 items-center justify-center rounded-full border bg-card text-sm font-medium text-heading transition-colors";

export function Pagination({
  scope,
  filters,
  page,
  pageCount,
}: {
  scope: ListingScope;
  filters: ShopFilters;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  const href = (p: number) => scopeHref(scope, { ...filters, page: p });

  const arrow = (target: number, label: string, Icon: typeof ChevronLeft) =>
    target < 1 || target > pageCount ? (
      <span className={cn(itemClass, "opacity-40")} aria-hidden>
        <Icon className="size-4" />
      </span>
    ) : (
      <Link
        href={href(target)}
        aria-label={label}
        rel={target < page ? "prev" : "next"}
        className={cn(itemClass, "hover:bg-muted")}
      >
        <Icon className="size-4" aria-hidden />
      </Link>
    );

  return (
    <nav aria-label="Pagination" className="flex justify-center">
      <ul className="flex items-center gap-2">
        <li>{arrow(page - 1, "Previous page", ChevronLeft)}</li>
        {pageItems(page, pageCount).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`}>
              <span className={itemClass} aria-hidden>
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  itemClass,
                  item === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}
        <li>{arrow(page + 1, "Next page", ChevronRight)}</li>
      </ul>
    </nav>
  );
}
