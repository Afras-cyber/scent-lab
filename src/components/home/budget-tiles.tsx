import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { homeConfig } from "@/config";
import { shopFiltersToSearch } from "@/features/catalog/schemas";
import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

/** "Shop by Budget": price tiers linking to /shop with a price filter. */
export function BudgetTiles() {
  const { eyebrow, title, tiers } = homeConfig.budget;

  return (
    <section className="py-12 lg:py-[72px]">
      <div className="container-page flex flex-col gap-6 lg:gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
          {tiers.map((tier, i) => {
            // The last tier is the dark "luxury" card.
            const dark = i === tiers.length - 1;
            const filters =
              tier.kind === "under"
                ? { maxPrice: tier.amount }
                : { minPrice: tier.amount };
            return (
              <li key={`${tier.kind}-${tier.amount}`}>
                <Link
                  href={`/shop${shopFiltersToSearch(filters)}`}
                  className={cn(
                    "group flex h-full flex-col rounded-[20px] p-4.5 shadow-sm transition-shadow hover:shadow-md lg:min-h-[272px] lg:p-7",
                    dark
                      ? "bg-brand-gradient text-brand-foreground"
                      : "bg-card text-card-foreground",
                  )}
                >
                  <span className="text-xs opacity-80 lg:text-sm">
                    {tier.kind === "under" ? "Under" : "From"}
                  </span>
                  <span
                    className={cn(
                      "mt-1 font-serif text-2xl font-semibold lg:mt-2 lg:text-4xl",
                      dark ? "text-brand-foreground" : "text-heading",
                    )}
                  >
                    {formatLKR(tier.amount)}
                  </span>
                  <span className="mt-1 hidden text-sm opacity-80 lg:block">
                    {tier.text}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold lg:mt-auto lg:text-sm">
                    Shop<span className="max-lg:hidden"> now</span>
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1 lg:size-4"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
