import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  SectionHeading,
  SectionLink,
} from "@/components/common/section-heading";
import { collectionHref } from "@/components/collections/collection-href";
import { Button } from "@/components/ui/button";
import { homeConfig } from "@/config";
import { listCollections } from "@/features/catalog/queries";
import type { CatalogCollection } from "@/features/catalog/types";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Large dark card for the first collection; desktop only. */
function FlagshipCard({ collection }: { collection: CatalogCollection }) {
  return (
    <div className="relative row-span-2 hidden flex-col gap-4 overflow-hidden rounded-[20px] bg-brand-gradient p-9 text-brand-foreground lg:flex">
      <span className="self-start rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
        {homeConfig.collections.flagshipEyebrow}
      </span>
      <h3 className="text-4xl text-brand-foreground">{collection.name}</h3>
      {collection.description && (
        <p className="max-w-xs text-brand-foreground/80">
          {collection.description}
        </p>
      )}
      <Button asChild variant="light" className="self-start">
        <Link href={collectionHref(collection.slug)}>
          Explore {collection.name.replace(/ Collection$/, "")}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
      <Image
        src={collection.image ?? FALLBACK_PRODUCT_IMAGE}
        alt=""
        width={140}
        height={196}
        className="mx-auto mt-auto h-44 w-auto object-contain"
      />
    </div>
  );
}

/** White card with the name, description and bottle (desktop: row; mobile: tile). */
function CollectionCard({
  collection,
  className,
}: {
  collection: CatalogCollection;
  className?: string;
}) {
  return (
    <Link
      href={collectionHref(collection.slug)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] bg-card shadow-sm transition-shadow hover:shadow-md lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-4 lg:p-7",
        className,
      )}
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#f3efe6] to-[#e9e2d3] lg:aspect-square lg:w-28 lg:shrink-0 lg:rounded-2xl lg:bg-secondary lg:bg-none">
        <Image
          src={collection.image ?? FALLBACK_PRODUCT_IMAGE}
          alt=""
          width={70}
          height={98}
          className="h-20 w-auto object-contain lg:h-[72px]"
        />
      </div>
      <div className="flex flex-col gap-1 p-3.5 lg:p-0">
        <h3 className="text-base lg:text-2xl">{collection.name}</h3>
        {collection.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground lg:line-clamp-2 lg:text-sm">
            {collection.description}
          </p>
        )}
        <span className="mt-1 hidden items-center gap-2 text-sm font-semibold text-heading lg:inline-flex">
          Shop now
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

/**
 * "Find Your Signature Scent". Desktop: the first collection as a large dark
 * card beside four white cards. Mobile: a 2×2 grid of the first four.
 */
export async function CollectionBento() {
  const [flagship, ...rest] = await listCollections();
  if (!flagship) return null;
  const { eyebrow, title, viewAll } = homeConfig.collections;

  return (
    <section className="py-12 lg:py-[72px]">
      <div className="container-page flex flex-col gap-6 lg:gap-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          action={
            <SectionLink href={viewAll.href} className="max-lg:hidden">
              {viewAll.label}
            </SectionLink>
          }
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_1fr] lg:grid-rows-2 lg:gap-6">
          <FlagshipCard collection={flagship} />
          {/* Mobile shows the flagship as a normal tile, then three more. */}
          <CollectionCard collection={flagship} className="lg:hidden" />
          {rest.slice(0, 4).map((c, i) => (
            <CollectionCard
              key={c.id}
              collection={c}
              className={cn(i === 3 && "max-lg:hidden")}
            />
          ))}
        </div>
        <SectionLink href={viewAll.href} className="self-center lg:hidden">
          {viewAll.label}
        </SectionLink>
      </div>
    </section>
  );
}
