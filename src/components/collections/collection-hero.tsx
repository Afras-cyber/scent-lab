import { Banknote, Droplet, Tag } from "lucide-react";
import Image from "next/image";

import { collectionsConfig } from "@/config";
import type { CollectionStats } from "@/features/catalog/filter";
import type { CatalogCollection } from "@/features/catalog/types";
import { formatLKR } from "@/lib/format";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/images";

import { collectionCountLabel } from "./collection-href";

/**
 * Dark green banner at the top of a collection page: pill label, serif name,
 * description, facts and the collection's bottle on a gold ring.
 */
export function CollectionHero({
  collection,
  stats,
}: {
  collection: CatalogCollection;
  stats: CollectionStats | undefined;
}) {
  const facts = [
    stats && {
      icon: Droplet,
      label: collectionCountLabel(collection.slug, stats.count),
    },
    stats && { icon: Tag, label: `From ${formatLKR(stats.minPrice)}` },
    { icon: Banknote, label: "Cash on Delivery" },
  ].filter((fact) => !!fact);

  return (
    <section className="relative overflow-hidden rounded-[20px] bg-brand-gradient text-brand-foreground">
      {/* Soft gold glow behind the bottle. */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/15 blur-3xl lg:size-[420px]"
        aria-hidden
      />
      <div className="relative grid grid-cols-[1fr_auto] items-center gap-4 p-6 lg:gap-10 lg:px-14 lg:py-12">
        <div className="flex min-w-0 flex-col items-start gap-3 lg:gap-4">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
            {collectionsConfig.detail.eyebrow}
          </span>
          <h1 className="text-[30px] leading-tight font-semibold text-brand-foreground lg:text-[52px]">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="max-w-xl text-[15px] text-brand-foreground/80 lg:text-lg">
              {collection.description}
            </p>
          )}
          <ul className="mt-1 flex flex-wrap gap-2 max-sm:-mr-24">
            {facts.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-medium lg:h-9 lg:px-4 lg:text-sm"
              >
                <Icon className="size-3.5 text-gold lg:size-4" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative flex size-24 items-center justify-center self-start sm:self-center lg:size-56">
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
            className="relative h-20 w-auto object-contain drop-shadow-xl lg:h-44"
          />
        </div>
      </div>
    </section>
  );
}

/** Same footprint as the hero while the collection loads. */
export function CollectionHeroSkeleton() {
  return (
    <div
      className="h-[214px] animate-pulse rounded-[20px] bg-brand-gradient lg:mt-[29px] lg:h-[304px]"
      role="status"
      aria-label="Loading collection"
    />
  );
}
