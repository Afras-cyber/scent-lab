"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { searchKeys } from "./keys";
import { MIN_QUERY_LENGTH } from "./schemas";
import type { SearchResults } from "./search";

const DEBOUNCE_MS = 200;

async function fetchSearch(
  q: string,
  collection: string | undefined,
  signal: AbortSignal,
): Promise<SearchResults> {
  const params = new URLSearchParams({ q });
  if (collection) params.set("collection", collection);
  const res = await fetch(`/api/search?${params}`, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  return res.json();
}

/**
 * Popup results for `query`, debounced. Earlier results stay on screen while
 * the next query loads, so only the first search shows the skeleton.
 */
export function useSearchResults(query: string, collection?: string) {
  const q = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const enabled = q.length >= MIN_QUERY_LENGTH;
  const result = useQuery({
    queryKey: searchKeys.results(q, collection),
    queryFn: ({ signal }) => fetchSearch(q, collection, signal),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
  return {
    ...result,
    /** The query the shown results belong to (lags while typing). */
    settledQuery: q,
    enabled,
  };
}
