import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import {
  SearchHeading,
  SearchPageResults,
} from "@/components/search/search-page-results";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { searchConfig } from "@/config";
import { parseShopFilters } from "@/features/catalog/schemas";

export async function generateMetadata({
  searchParams,
}: PageProps<"/search">): Promise<Metadata> {
  const { q } = parseShopFilters(await searchParams);
  return {
    title: q ? `${searchConfig.page.title}: ${q}` : searchConfig.page.title,
    description: searchConfig.page.description,
    // Result pages are endless and thin; keep them out of search engines.
    robots: { index: false, follow: true },
  };
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container-page flex flex-col gap-5 pt-4 pb-16 lg:gap-8 lg:pt-6 lg:pb-24">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: searchConfig.page.title },
        ]}
        className="max-lg:hidden"
      />
      <Suspense
        fallback={<ShopSkeleton heading={<SearchHeading query={null} />} />}
      >
        <SearchPageResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
