import Link from "next/link";

import { collectionsConfig } from "@/config";
import type { CatalogCollection } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

import { collectionHref } from "./collection-href";

const pillClass =
  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors lg:h-11 lg:px-5 lg:text-[15px]";

/** "All perfumes / Oud Collection / Attar Oils / …" row on collection pages. */
export function CollectionPills({
  collections,
  current,
}: {
  collections: CatalogCollection[];
  current: string;
}) {
  return (
    <nav aria-label="Collections" className="-mx-5 lg:mx-0">
      <ul className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 lg:flex-wrap lg:gap-3 lg:overflow-visible lg:px-0">
        <li className="shrink-0">
          <Link
            href="/shop"
            className={cn(pillClass, "bg-card text-heading hover:bg-muted")}
          >
            {collectionsConfig.detail.allLabel}
          </Link>
        </li>
        {collections.map((c) => {
          const active = c.slug === current;
          return (
            <li key={c.slug} className="shrink-0">
              <Link
                href={collectionHref(c.slug)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  pillClass,
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-heading hover:bg-muted",
                )}
              >
                {c.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
