"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  use,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";

import type { ShopFilters } from "@/features/catalog/schemas";
import { cn } from "@/lib/utils";

import {
  patchFilters,
  scopeHref,
  SHOP_SCOPE,
  type ListingScope,
} from "./shop-href";

type ShopNavigation = {
  /** Current filters, updated immediately while the next page loads. */
  filters: ShopFilters;
  /** Applies `patch` (page resets to 1) and navigates to the new URL. */
  update: (patch: Partial<ShopFilters>) => void;
  /** Replaces all filters, e.g. Clear all. */
  replace: (filters: ShopFilters) => void;
  pending: boolean;
  /** The page the listing lives on (path, locked and kept filters). */
  scope: ListingScope;
};

const ShopNavigationContext = createContext<ShopNavigation | null>(null);

/**
 * Filters live in the URL. Controls call `update`, which pushes the new URL in
 * a transition; the server re-renders the results. `useOptimistic` keeps the
 * controls in sync with fast clicks before the server responds.
 */
export function ShopNavigationProvider({
  filters,
  scope = SHOP_SCOPE,
  children,
}: {
  filters: ShopFilters;
  scope?: ListingScope;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(filters);

  function replace(next: ShopFilters) {
    startTransition(() => {
      setOptimistic(next);
      router.push(scopeHref(scope, next), { scroll: false });
    });
  }

  return (
    <ShopNavigationContext
      value={{
        filters: optimistic,
        update: (patch) => replace(patchFilters(optimistic, patch)),
        replace,
        pending,
        scope,
      }}
    >
      {children}
    </ShopNavigationContext>
  );
}

export function useShopNavigation(): ShopNavigation {
  const value = use(ShopNavigationContext);
  if (!value) {
    throw new Error("useShopNavigation must be used in ShopNavigationProvider");
  }
  return value;
}

/** Dims the results while a filter change is loading. */
export function ResultsArea({ children }: { children: ReactNode }) {
  const { pending } = useShopNavigation();
  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-200", pending && "opacity-50")}
    >
      {children}
    </div>
  );
}
