/** TanStack Query keys for search. */
export const searchKeys = {
  all: ["search"] as const,
  results: (q: string, collection?: string) =>
    [...searchKeys.all, "results", q, collection ?? null] as const,
};
