import { LayoutGrid } from "lucide-react";
import Link from "next/link";

import { collectionHref } from "@/components/collections/collection-href";
import { searchConfig } from "@/config";
import type { SearchResults } from "@/features/search/search";

import { Highlight } from "./highlight";

const chipClass =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors lg:h-11 lg:text-[15px]";

/** Collections and notes whose name matches the query, above the grid. */
export function SearchMatches({
  query,
  collections,
  notes,
}: Pick<SearchResults, "collections" | "notes"> & { query: string }) {
  if (collections.length + notes.length === 0) return null;
  return (
    <nav aria-label="Matching collections and notes" className="-mx-5 lg:mx-0">
      <ul className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-5 lg:flex-wrap lg:gap-3 lg:overflow-visible lg:px-0">
        {collections.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={collectionHref(c.slug)}
              className={`${chipClass} bg-primary text-primary-foreground hover:bg-primary/90`}
            >
              <LayoutGrid className="size-4" aria-hidden />
              {c.name}
            </Link>
          </li>
        ))}
        {notes.map((n) => (
          <li key={n.slug} className="shrink-0">
            <Link
              href={`/shop?note=${n.slug}`}
              aria-label={`${searchConfig.labels.notes}: ${n.name}`}
              className={`${chipClass} bg-secondary text-secondary-foreground hover:bg-secondary/70`}
            >
              <Highlight text={n.name} query={query} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
