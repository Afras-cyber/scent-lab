import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  CollectionHero,
  CollectionHeroSkeleton,
} from "@/components/collections/collection-hero";
import { collectionHref } from "@/components/collections/collection-href";
import { CollectionPills } from "@/components/collections/collection-pills";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ShopResults } from "@/components/shop/shop-results";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import type { ListingScope } from "@/components/shop/shop-href";
import { collectionsConfig, siteConfig } from "@/config";
import { collectionStats } from "@/features/catalog/filter";
import {
  getCatalog,
  getCollectionBySlug,
  listCollections,
} from "@/features/catalog/queries";
import { fillMessage } from "@/lib/whatsapp/link";

export async function generateStaticParams() {
  const collections = await listCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  const description =
    collection.description ?? `${collection.name} from ${siteConfig.name}.`;
  return {
    title: collection.name,
    description,
    alternates: { canonical: collectionHref(slug) },
    openGraph: {
      title: collection.name,
      description,
      images: collection.image ? [collection.image] : undefined,
    },
  };
}

export default function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[slug]">) {
  return (
    <div className="container-page flex flex-col gap-5 pt-4 pb-16 lg:gap-8 lg:pt-6 lg:pb-24">
      <Suspense
        fallback={
          <>
            <CollectionHeroSkeleton />
            <ShopSkeleton heading={null} />
          </>
        }
      >
        <CollectionContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

type Props = Pick<PageProps<"/collections/[slug]">, "params" | "searchParams">;

// The hero comes from the cached catalog, so known slugs are in the static
// shell; the filtered listing renders per request in its own Suspense.
async function CollectionContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const [collection, collections, catalog] = await Promise.all([
    getCollectionBySlug(slug),
    listCollections(),
    getCatalog(),
  ]);
  if (!collection) notFound();

  const scope: ListingScope = {
    path: collectionHref(slug),
    locked: { collection: [slug] },
    hideType: true,
  };
  const heading = (
    <h2 className="text-2xl leading-tight font-semibold lg:text-[32px]">
      {fillMessage(collectionsConfig.detail.listingTitle, {
        name: collection.name,
      })}
    </h2>
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: collectionsConfig.index.eyebrow, href: "/collections" },
          { label: collection.name },
        ]}
        className="max-lg:hidden"
      />
      <CollectionHero
        collection={collection}
        stats={collectionStats(catalog).get(slug)}
      />
      <Suspense fallback={<ShopSkeleton heading={heading} />}>
        <ShopResults
          searchParams={searchParams}
          scope={scope}
          heading={heading}
          pills={<CollectionPills collections={collections} current={slug} />}
        />
      </Suspense>
    </>
  );
}
