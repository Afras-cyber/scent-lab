import type { ReactNode } from "react";

import { shopConfig } from "@/config";

/** Title and subtitle, with the count and sort on the right (`aside`). */
export function ShopHeading({ aside }: { aside?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-tight font-semibold lg:text-5xl">
          <span className="lg:hidden">{shopConfig.breadcrumb}</span>
          <span className="max-lg:hidden">{shopConfig.title}</span>
        </h1>
        <p className="text-[15px] text-muted-foreground max-lg:hidden">
          {shopConfig.description}
        </p>
      </div>
      {aside}
    </div>
  );
}
