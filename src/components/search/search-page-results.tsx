import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { ShopResults } from "@/components/shop/shop-results";
import type { ListingScope } from "@/components/shop/shop-href";
import { Button } from "@/components/ui/button";
import { searchConfig } from "@/config";
import { filterProducts } from "@/features/catalog/filter";
import {
  getCatalog,
  getFeaturedProducts,
  listCollections,
  listNotes,
} from "@/features/catalog/queries";
import {
  parseShopFilters,
  type SearchParamsRecord,
} from "@/features/catalog/schemas";
import { searchHref } from "@/features/search/schemas";
import { searchMatches } from "@/features/search/search";
import { fillMessage } from "@/lib/whatsapp/link";

import { SearchMatches } from "./search-matches";
import { SearchNone } from "./search-none";
import { SearchPageForm } from "./search-page-form";

export const SEARCH_SCOPE: ListingScope = {
  path: "/search",
  keep: ["q"],
  defaultSortLabel: searchConfig.page.bestMatchLabel,
};

const chipClass =
  "inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-medium text-heading transition-colors hover:bg-muted lg:h-11 lg:text-[15px]";

type Chip = { label: string } & ({ query: string } | { href: string });

function ChipLinks({
  chips,
  icon,
}: {
  chips: readonly Chip[];
  icon?: boolean;
}) {
  return chips.map((c) => (
    <Link
      key={c.label}
      href={"href" in c ? c.href : searchHref(c.query)}
      className={chipClass}
    >
      {icon && (
        <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
      )}
      {c.label}
    </Link>
  ));
}

/** Pill label and serif title at the top of /search; `null` while loading. */
export function SearchHeading({ query }: { query: string | null }) {
  const { eyebrow, resultsTitle, emptyTitle } = searchConfig.page;
  return (
    <div className="flex min-w-0 flex-col items-start gap-3">
      <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase">
        {eyebrow}
      </span>
      <h1 className="text-[28px] leading-tight font-semibold break-words lg:text-5xl">
        {query === null ? (
          <span className="block h-[1.1em] w-72 max-w-full animate-pulse rounded-full bg-muted" />
        ) : query ? (
          fillMessage(resultsTitle, { query })
        ) : (
          emptyTitle
        )}
      </h1>
    </div>
  );
}

/** Four popular perfumes under the empty and no-results states. */
async function PopularProducts() {
  const products = await getFeaturedProducts(4);
  if (products.length === 0) return null;
  return (
    <section className="flex flex-col gap-5 pt-6 lg:gap-8 lg:pt-10">
      <SectionHeading
        eyebrow={searchConfig.page.popularEyebrow}
        title={searchConfig.page.popularTitle}
      />
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <li key={product.id} className="flex [&>*]:w-full">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Everything on /search that depends on the URL. No query: popular searches.
 * A query with no match: the popup's "nothing found" state. Otherwise the
 * shop listing, scoped to /search so filters keep the query.
 */
export async function SearchPageResults({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const q = parseShopFilters(await searchParams).q ?? "";

  if (!q) {
    return (
      <div className="flex flex-col gap-5 lg:gap-6">
        <SearchHeading query="" />
        <p className="max-w-2xl text-[15px] text-muted-foreground">
          {searchConfig.page.emptyText}
        </p>
        <SearchPageForm query="" />
        <div className="flex flex-wrap gap-2.5">
          <ChipLinks chips={searchConfig.popularSearches} icon />
        </div>
        <PopularProducts />
      </div>
    );
  }

  const [catalog, collections, notes] = await Promise.all([
    getCatalog(),
    listCollections(),
    listNotes(),
  ]);

  if (filterProducts(catalog, { q }).length === 0) {
    return (
      <div className="flex flex-col gap-5 lg:gap-6">
        <SearchHeading query={q} />
        <SearchPageForm query={q} />
        <div className="rounded-[20px] bg-card px-5 py-10 shadow-sm lg:py-14">
          <SearchNone query={q} className="mx-auto max-w-[600px]">
            <ChipLinks chips={searchConfig.noResults.suggestions} />
          </SearchNone>
          <div className="mt-3 flex justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-13 w-full max-w-[600px] bg-card"
            >
              <Link href="/shop">
                {searchConfig.labels.browse}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <PopularProducts />
      </div>
    );
  }

  return (
    <ShopResults
      searchParams={searchParams}
      scope={SEARCH_SCOPE}
      heading={<SearchHeading query={q} />}
      pills={
        <div className="flex flex-col gap-4">
          <SearchPageForm query={q} />
          <SearchMatches
            query={q}
            {...searchMatches(catalog, collections, notes, q)}
          />
        </div>
      }
    />
  );
}
