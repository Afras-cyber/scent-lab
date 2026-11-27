import { z } from "zod";

/** Query of `GET /api/search`. Same limits as the shop's `q` and slugs. */
export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  collection: z
    .string()
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .optional()
    .catch(undefined),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** Popup queries start at this many characters. */
export const MIN_QUERY_LENGTH = 2;

/** `/search` URL for a query, optionally limited to one collection. */
export function searchHref(q: string, collection?: string): string {
  const params = new URLSearchParams({ q: q.trim() });
  if (collection) params.set("collection", collection);
  return `/search?${params}`;
}
