import { Banknote, Clock, Droplet, Truck } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { homeConfig } from "@/config";

const icons = { drop: Droplet, clock: Clock, cash: Banknote, truck: Truck };

/**
 * Four selling points. Desktop: one white strip with dividers, no heading.
 * Mobile: a heading and a 2×2 grid of cards.
 */
export function WhyAyad() {
  const { eyebrow, title, items } = homeConfig.whyAyad;

  return (
    <section className="pt-12 lg:pt-[72px]">
      <div className="container-page flex flex-col gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} className="lg:hidden" />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-0 lg:rounded-[20px] lg:bg-card lg:px-10 lg:py-8 lg:shadow-sm">
          {items.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li
                key={item.title}
                className="flex flex-col gap-3 rounded-[20px] bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:gap-4 lg:rounded-none lg:border-l lg:bg-transparent lg:p-0 lg:pl-8 lg:shadow-none lg:first:border-l-0 lg:first:pl-0"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground lg:size-[52px]">
                  <Icon className="size-[18px] lg:size-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-heading lg:text-base">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground lg:text-sm">
                    {item.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
