/** TanStack Query keys for the catalog. */
export const catalogKeys = {
  all: ["catalog"] as const,
  product: (slug: string) => [...catalogKeys.all, "product", slug] as const,
};
