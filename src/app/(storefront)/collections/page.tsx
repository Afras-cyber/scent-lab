import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CollectionGrid } from "@/components/collections/collection-grid";
import { collectionsConfig } from "@/config";
import { collectionStats } from "@/features/catalog/filter";
import { getCatalog, listCollections } from "@/features/catalog/queries";

const { title, description, eyebrow, heading } = collectionsConfig.index;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const [collections, catalog] = await Promise.all([
    listCollections(),
    getCatalog(),
  ]);

  return (
    <div className="container-page flex flex-col gap-6 pt-4 pb-16 lg:gap-10 lg:pt-6 lg:pb-24">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: eyebrow }]}
        className="max-lg:hidden"
      />
      <div className="flex flex-col items-start gap-3">
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase">
          {eyebrow}
        </span>
        <h1 className="text-[32px] leading-tight font-semibold lg:text-5xl">
          {heading}
        </h1>
        <p className="max-w-2xl text-[15px] text-muted-foreground">
          {description}
        </p>
      </div>
      <CollectionGrid
        collections={collections}
        stats={collectionStats(catalog)}
      />
    </div>
  );
}
