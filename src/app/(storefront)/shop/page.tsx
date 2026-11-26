import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ShopResults } from "@/components/shop/shop-results";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { shopConfig } from "@/config";

export const metadata: Metadata = {
  title: shopConfig.title,
  description: shopConfig.description,
  alternates: { canonical: "/shop" },
};

// Filters are URL search params, so everything below the breadcrumb renders
// per request inside Suspense; the breadcrumb and skeleton are the static shell.
export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="container-page flex flex-col gap-5 pt-4 pb-16 lg:gap-8 lg:pt-6 lg:pb-24">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: shopConfig.breadcrumb }]}
        className="max-lg:hidden"
      />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
