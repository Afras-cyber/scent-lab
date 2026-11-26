import type { ReactNode } from "react";

import { ProductCard } from "@/components/product/product-card";
import { homeConfig } from "@/config";
import { filterProducts } from "@/features/catalog/filter";
import { listProducts } from "@/features/catalog/queries";

import { TrendingTabs } from "./trending-tabs";

const PER_TAB = 8;

/**
 * "Curated Top Trending": tabs from `homeConfig.trending.tabs`. Each card is
 * rendered once on the server; the client component only switches tabs.
 */
export async function Trending() {
  const products = await listProducts({ sort: "trending" });

  const tabs = homeConfig.trending.tabs
    .map((tab) => ({
      label: tab.label,
      ids: filterProducts(
        products,
        "gender" in tab
          ? { gender: [tab.gender], sort: "trending" }
          : { collection: [tab.collection], sort: "trending" },
      )
        .slice(0, PER_TAB)
        .map((p) => p.id),
    }))
    .filter((tab) => tab.ids.length > 0);
  if (tabs.length === 0) return null;

  const shown = new Set(tabs.flatMap((t) => t.ids));
  const cards: Record<string, ReactNode> = {};
  for (const product of products) {
    if (shown.has(product.id)) {
      cards[product.id] = <ProductCard product={product} />;
    }
  }

  return (
    <section className="bg-card py-12 lg:py-[72px]">
      <div className="container-page">
        <TrendingTabs
          eyebrow={homeConfig.trending.eyebrow}
          title={homeConfig.trending.title}
          viewAll={homeConfig.trending.viewAll}
          tabs={tabs}
          cards={cards}
        />
      </div>
    </section>
  );
}
