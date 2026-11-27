"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";

import { catalogKeys } from "./keys";
import type { ProductDetail } from "./types";

const STALE_MS = 5 * 60 * 1000;

async function fetchProduct(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    signal,
  });
  if (!res.ok) throw new Error(`Product failed (${res.status})`);
  return res.json();
}

function productQuery(slug: string) {
  return {
    queryKey: catalogKeys.product(slug),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchProduct(slug, signal),
    staleTime: STALE_MS,
  };
}

/** Product details for the quick view; disabled while `slug` is null. */
export function useProductQuickView(slug: string | null) {
  return useQuery({ ...productQuery(slug ?? ""), enabled: slug !== null });
}

/** Warm the quick view cache, e.g. when the pointer reaches the eye button. */
export function prefetchProduct(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery(productQuery(slug));
}
