import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { collectionsConfig } from "@/config";
import type { CollectionStats } from "@/features/catalog/filter";
import type { CatalogCollection } from "@/features/catalog/types";
import { formatLKR } from "@/lib/format";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/images";
import { cn } from "@/lib/utils";

import { collectionCountLabel, collectionHref } from "./collection-href";

type Props = {
  collection: CatalogCollection;
  stats: CollectionStats | undefined;
};

function Facts({
  collection,
  stats,
  className,
}: Props & { className?: string }) {
  if (!stats) return null;
  return (
    <p className={cn("text-xs lg:text-sm", className)}>
      {collectionCountLabel(collection.slug, stats.count)}
      <span className="max-lg:hidden"> · From {formatLKR(stats.minPrice)}</span>
    </p>
  );
}

/** First collection: dark gradient card, 2×2 cells on desktop. */
function FlagshipCard({ collection, stats }: Props) {
  const { flagshipEyebrow, exploreLabel } = collectionsConfig.index;
  return (
    <Link
      href={collectionHref(collection.slug)}
      className="group relative flex items-center gap-4 overflow-hidden rounded-[20px] bg-brand-gradient p-6 text-brand-foreground lg:flex-col lg:items-stretch lg:justify-between lg:gap-8 lg:p-12"
    >
      <div
        className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-gold/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex min-w-0 flex-1 flex-col items-start gap-3 lg:gap-4">
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
          {flagshipEyebrow}
        </span>
        <h2 className="text-[26px] leading-tight text-brand-foreground lg:text-[40px]">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="max-w-md text-sm text-brand-foreground/80 lg:text-base">
            {collection.description}
          </p>
        )}
        <Facts
          collection={collection}
          stats={stats}
          className="text-brand-foreground/70"
        />
        <span className="mt-1 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-brand-deep transition-colors group-hover:bg-white/90">
          {exploreLabel} {collection.name.replace(/ Collection$/, "")}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
      <div className="relative flex size-24 shrink-0 items-center justify-center lg:size-72 lg:self-center">
        <span
          className="absolute inset-0 rounded-full border border-gold/40 bg-white/5"
          aria-hidden
        />
        <Image
          src={collection.image ?? FALLBACK_PRODUCT_IMAGE}
          alt=""
          width={140}
          height={196}
          priority
          className="relative h-20 w-auto object-contain drop-shadow-xl lg:h-56"
        />
      </div>
    </Link>
  );
}

/** White collection card: bottle on a cream panel, name, text and count. */
function CollectionCard({ collection, stats }: Props) {
  return (
    <Link
      href={collectionHref(collection.slug)}
      className="group flex flex-col overflow-hidden rounded-[20px] bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#f3efe6] to-[#e9e2d3] lg:aspect-auto lg:h-40">
        <Image
          src={collection.image ?? FALLBACK_PRODUCT_IMAGE}
          alt=""
          width={90}
          height={126}
          className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 lg:h-24"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5 lg:gap-2 lg:p-6">
        <h2 className="text-base leading-snug lg:text-2xl">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground max-lg:hidden">
            {collection.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 lg:pt-3">
          <Facts
            collection={collection}
            stats={stats}
            className="text-muted-foreground"
          />
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-heading transition-colors group-hover:bg-primary group-hover:text-primary-foreground lg:size-10">
            <ArrowRight className="size-4" aria-hidden />
            <span className="sr-only">
              {collectionsConfig.index.exploreLabel} {collection.name}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Every collection: the first as a wide flagship card, then white cards. */
export function CollectionGrid({
  collections,
  stats,
}: {
  collections: CatalogCollection[];
  stats: Map<string, CollectionStats>;
}) {
  const [flagship, ...rest] = collections;
  if (!flagship) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6">
      <li className="col-span-2 flex lg:row-span-2 [&>*]:w-full">
        <FlagshipCard collection={flagship} stats={stats.get(flagship.slug)} />
      </li>
      {rest.map((c) => (
        <li key={c.id} className="flex [&>*]:w-full">
          <CollectionCard collection={c} stats={stats.get(c.slug)} />
        </li>
      ))}
    </ul>
  );
}
