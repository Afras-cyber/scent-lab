import { Suspense } from "react";

import { BudgetTiles } from "@/components/home/budget-tiles";
import { CollectionBento } from "@/components/home/collection-bento";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { Hero } from "@/components/home/hero";
import { Newsletter } from "@/components/home/newsletter";
import { OrderSteps } from "@/components/home/order-steps";
import { PromoRow } from "@/components/home/promo-row";
import { Reviews } from "@/components/home/reviews";
import { TrackOrderCard } from "@/components/home/track-order-card";
import { Trending } from "@/components/home/trending";
import { WhyAyad } from "@/components/home/why-ayad";
import { cn } from "@/lib/utils";

/** Placeholder while a catalog section streams in. */
function SectionFallback({ className }: { className?: string }) {
  return (
    <div className={cn("container-page py-12 lg:py-[72px]", className)}>
      <div className="h-80 animate-pulse rounded-[20px] bg-muted lg:h-[420px]" />
    </div>
  );
}

// Sections from the "AYAD Home" Figma frames, top to bottom. Catalog sections
// read cached Supabase data; the rest are static copy from homeConfig.
export default function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="aspect-[390/172] animate-pulse bg-muted md:aspect-[1440/548]" />
        }
      >
        <Hero />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CollectionBento />
      </Suspense>
      <Suspense fallback={<SectionFallback className="bg-card" />}>
        <Trending />
        <PromoRow />
      </Suspense>
      <BudgetTiles />
      <Suspense fallback={<SectionFallback className="bg-card" />}>
        <FeaturedCollection />
      </Suspense>
      <WhyAyad />
      <OrderSteps />
      <TrackOrderCard />
      <Suspense fallback={<SectionFallback />}>
        <Reviews />
      </Suspense>
      <Newsletter />
    </>
  );
}
