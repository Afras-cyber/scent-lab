"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type ReactNode } from "react";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = { label: string; ids: string[] };

/**
 * Tab pills and the product row for the trending section. Desktop: a
 * horizontal scroller (4 cards visible) with arrow buttons. Mobile: a 2-column
 * grid of the first 4 cards and a "View All Products" link.
 */
export function TrendingTabs({
  eyebrow,
  title,
  viewAll,
  tabs,
  cards,
}: {
  eyebrow: string;
  title: string;
  viewAll: { label: string; href: string };
  tabs: Tab[];
  cards: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState(0);
  const rowRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const tab = tabs[active] ?? tabs[0]!;

  function select(index: number) {
    setActive(index);
    rowRef.current?.scrollTo({ left: 0 });
  }

  function scroll(direction: 1 | -1) {
    const row = rowRef.current;
    const card = row?.firstElementChild as HTMLElement | null;
    if (!row || !card) return;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    row.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: "smooth",
    });
  }

  const pillClass =
    "h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors";

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        action={
          <div className="flex items-center gap-2 max-lg:-mx-5 max-lg:[scrollbar-width:none] max-lg:overflow-x-auto max-lg:px-5">
            <div role="tablist" aria-label={title} className="flex gap-2">
              {tabs.map((t, i) => (
                <button
                  key={t.label}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls={`${baseId}-panel`}
                  onClick={() => select(i)}
                  className={cn(
                    pillClass,
                    i === active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-heading hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="ml-3 hidden gap-2 lg:flex">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous products"
                onClick={() => scroll(-1)}
              >
                <ChevronLeft aria-hidden />
              </Button>
              <Button
                size="icon"
                aria-label="Next products"
                onClick={() => scroll(1)}
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>
        }
      />

      <ul
        ref={rowRef}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="grid grid-cols-2 gap-3 lg:-m-2 lg:flex lg:snap-x lg:snap-mandatory lg:scroll-px-2 lg:[scrollbar-width:none] lg:gap-6 lg:overflow-x-auto lg:p-2"
      >
        {tab.ids.map((id, i) => (
          <li
            key={id}
            className={cn(
              "flex lg:w-[calc((100%-3*1.5rem)/4)] lg:shrink-0 lg:snap-start [&>*]:w-full",
              i >= 4 && "max-lg:hidden",
            )}
          >
            {cards[id]}
          </li>
        ))}
      </ul>

      <Button asChild variant="outline" className="h-12 lg:hidden">
        <Link href={viewAll.href}>
          {viewAll.label}
          <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
