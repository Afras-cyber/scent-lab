import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ShopHeading } from "./shop-heading";

function Bar({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-muted", className)} />;
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border bg-card p-3 lg:p-3.5">
      <div className="aspect-[280/232] rounded-[14px] bg-muted" />
      <div className="flex flex-col items-center gap-2 py-1">
        <Bar className="h-2.5 w-2/5" />
        <Bar className="h-4 w-3/5" />
        <Bar className="h-2.5 w-2/5" />
        <Bar className="h-4 w-1/2" />
      </div>
      <Bar className="h-10 w-full lg:h-11" />
    </div>
  );
}

/** Loading state for a product listing (design: "Loading skeleton"). */
export function ShopSkeleton({
  heading = <ShopHeading />,
}: {
  heading?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {heading}
      <div
        className="flex animate-pulse flex-col gap-6"
        role="status"
        aria-label="Loading perfumes"
      >
        <div className="flex gap-2 overflow-hidden lg:gap-3">
          {Array.from({ length: 9 }, (_, i) => (
            <Bar key={i} className="h-10 w-24 shrink-0 lg:h-11" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:hidden">
          <Bar className="h-12" />
          <Bar className="h-12" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[288px_1fr]">
          <div className="hidden h-[640px] rounded-[20px] bg-card lg:block" />
          <div className="flex flex-col gap-5">
            <Bar className="h-3 w-32" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
