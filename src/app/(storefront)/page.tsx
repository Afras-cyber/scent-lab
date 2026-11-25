import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { commerceConfig, siteConfig } from "@/config";
import { formatLKR } from "@/lib/format";

// Phase 0 placeholder that exercises the theme tokens. Phase 1 replaces it
// with the Home sections from the Figma exports.
export default function HomePage() {
  return (
    <div className="container-page flex flex-col gap-12 py-16">
      <SectionHeading eyebrow="Coming soon" title={siteConfig.tagline} />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col justify-between gap-8 rounded-[20px] bg-brand-gradient p-8 text-brand-foreground">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold tracking-[0.12em] text-gold uppercase">
              Featured
            </span>
            <h3 className="text-3xl text-brand-foreground">The Oud Edit</h3>
            <p className="max-w-sm text-brand-foreground/80">
              {siteConfig.description}
            </p>
          </div>
          <Button asChild variant="light" className="self-start">
            <Link href="/collections/oud">Explore the Edit</Link>
          </Button>
        </section>

        <section className="flex items-center gap-6 rounded-[20px] bg-card p-8 text-card-foreground shadow-sm">
          <Image
            src="/images/collections/Bottle.png"
            alt=""
            width={70}
            height={98}
            className="shrink-0"
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl">Free island-wide delivery</h3>
            <p className="text-muted-foreground">
              On orders over{" "}
              {formatLKR(commerceConfig.freeDeliveryThresholdLkr)}. Cash on
              Delivery or bank transfer.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button variant="gold">Shop All</Button>
              <Button variant="outline">Track Order</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
