import { ProductCard } from "@/components/product/product-card";
import { commerceConfig } from "@/config";
import {
  catalogSizes,
  facetCounts,
  filterProducts,
  paginate,
  priceBounds,
} from "@/features/catalog/filter";
import {
  getCatalog,
  listCollections,
  listNotes,
} from "@/features/catalog/queries";
import {
  parseShopFilters,
  type SearchParamsRecord,
} from "@/features/catalog/schemas";

import { ActiveFilters, activeChips } from "./active-filters";
import type { FilterOptions } from "./filter-panel";
import { FilterSidebar } from "./filter-sidebar";
import { MobileFilterBar } from "./mobile-filter-bar";
import { NoResults } from "./no-results";
import { Pagination } from "./pagination";
import { QuickFilters } from "./quick-filters";
import { ShopHeading } from "./shop-heading";
import { ResultsArea, ShopNavigationProvider } from "./shop-navigation";
import { SortDropdown } from "./sort-menu";

const numberFormat = new Intl.NumberFormat("en-LK");

/**
 * Everything on /shop that depends on the URL: counts, filters, the grid and
 * pagination. Filtering runs in memory on the cached catalog.
 */
export async function ShopResults({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const filters = parseShopFilters(await searchParams);
  const [catalog, notes, collections] = await Promise.all([
    getCatalog(),
    listNotes(),
    listCollections(),
  ]);

  const results = filterProducts(catalog, filters);
  const { items, page, pageCount, total } = paginate(
    results,
    filters.page,
    commerceConfig.productsPerPage,
  );
  const counts = facetCounts(catalog, filters);
  // Only notes some product has, plus any selected one (so it can be removed).
  const usedNotes = new Set(catalog.flatMap((p) => p.notes.map((n) => n.slug)));
  const options: FilterOptions = {
    counts,
    notes: notes.filter(
      (n) => usedNotes.has(n.slug) || filters.note?.includes(n.slug),
    ),
    sizes: catalogSizes(catalog),
    priceBounds: priceBounds(catalog),
  };
  const chips = activeChips(filters, {
    collections: new Map(collections.map((c) => [c.slug, c.name])),
    notes: new Map(notes.map((n) => [n.slug, n.name])),
  });

  const perPage = commerceConfig.productsPerPage;
  const first = (page - 1) * perPage + 1;
  const last = first + items.length - 1;
  const countLabel = `${numberFormat.format(total)} ${total === 1 ? "perfume" : "perfumes"}`;

  return (
    <ShopNavigationProvider filters={filters}>
      <div className="flex flex-col gap-5 lg:gap-6">
        <ShopHeading
          aside={
            <div className="flex items-center gap-4 max-lg:pb-1.5">
              <p
                className="text-sm text-muted-foreground lg:text-[15px]"
                aria-live="polite"
              >
                {countLabel}
              </p>
              <div className="hidden lg:block">
                <SortDropdown />
              </div>
            </div>
          }
        />

        <QuickFilters filters={filters} />
        <MobileFilterBar options={options} total={total} />

        <div className="grid gap-6 lg:grid-cols-[288px_1fr]">
          <FilterSidebar options={options} />

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <ActiveFilters
                chips={chips}
                filters={filters}
                className="lg:order-2 lg:justify-end"
              />
              {total > 0 && (
                <p className="text-sm text-muted-foreground lg:order-1 lg:text-[15px]">
                  Showing {first}–{last} of {numberFormat.format(total)}
                </p>
              )}
            </div>

            <ResultsArea>
              {items.length > 0 ? (
                <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                  {items.map((product, i) => (
                    <li key={product.id} className="flex [&>*]:w-full">
                      <ProductCard product={product} eager={i < 4} />
                    </li>
                  ))}
                </ul>
              ) : (
                <NoResults filters={filters} />
              )}
            </ResultsArea>

            <div className="pt-4">
              <Pagination filters={filters} page={page} pageCount={pageCount} />
            </div>
          </div>
        </div>
      </div>
    </ShopNavigationProvider>
  );
}
