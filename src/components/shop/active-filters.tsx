import { X } from "lucide-react";
import Link from "next/link";

import { shopConfig } from "@/config";
import type { ListFilterKey, ShopFilters } from "@/features/catalog/schemas";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  clearedFilters,
  patchFilters,
  scopeHref,
  toggleItem,
  type ListingScope,
} from "./shop-href";

type Chip = { key: string; label: string; href: string };

function priceLabel(min?: number, max?: number) {
  if (min !== undefined && max !== undefined) {
    return `${formatLKR(min)} – ${formatLKR(max)}`;
  }
  if (max !== undefined) return `Under ${formatLKR(max)}`;
  return `From ${formatLKR(min!)}`;
}

/** One removable chip per active filter value, in URL order. */
export function activeChips(
  scope: ListingScope,
  filters: ShopFilters,
  names: { collections: Map<string, string>; notes: Map<string, string> },
): Chip[] {
  const chips: Chip[] = [];
  const without = (patch: Partial<ShopFilters>) =>
    scopeHref(scope, patchFilters(filters, patch));
  const list = (key: ListFilterKey, label: (v: string) => string) => {
    for (const value of filters[key] ?? []) {
      chips.push({
        key: `${key}:${value}`,
        label: label(value),
        href: without(toggleItem(filters, key, value)),
      });
    }
  };

  list("gender", (g) => shopConfig.genderLabels[g as "men"] ?? g);
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    chips.push({
      key: "price",
      label: priceLabel(filters.minPrice, filters.maxPrice),
      href: without({ minPrice: undefined, maxPrice: undefined }),
    });
  }
  list("collection", (c) => names.collections.get(c) ?? c);
  list("note", (n) => names.notes.get(n) ?? n);
  list("size", (s) => s);
  if (filters.inStock) {
    chips.push({
      key: "inStock",
      label: "In stock",
      href: without({ inStock: undefined }),
    });
  }
  if (filters.sale) {
    chips.push({
      key: "sale",
      label: "On sale",
      href: without({ sale: undefined }),
    });
  }
  if (filters.occasion) {
    chips.push({
      key: "occasion",
      label: filters.occasion.replaceAll("-", " "),
      href: without({ occasion: undefined }),
    });
  }
  if (filters.q && !scope.keep?.includes("q")) {
    chips.push({
      key: "q",
      label: `“${filters.q}”`,
      href: without({ q: undefined }),
    });
  }
  return chips;
}

/** "Active: Men × Under Rs 3,000 × Oud ×  Clear all". */
export function ActiveFilters({
  scope,
  chips,
  filters,
  className,
}: {
  scope: ListingScope;
  chips: Chip[];
  filters: ShopFilters;
  className?: string;
}) {
  if (chips.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground max-lg:hidden">
        Active:
      </span>
      <ul className="contents">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={chip.href}
              scroll={false}
              aria-label={`Remove filter ${chip.label}`}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-secondary px-3 text-sm font-medium text-secondary-foreground capitalize transition-colors hover:bg-secondary/70"
            >
              {chip.label}
              <X className="size-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={scopeHref(scope, clearedFilters(filters, scope))}
        scroll={false}
        className="ml-1 text-sm font-medium text-heading hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
