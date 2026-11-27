import { shopConfig } from "@/config";

/** /shop title and subtitle (the count and sort sit next to it). */
export function ShopHeading() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[32px] leading-tight font-semibold lg:text-5xl">
        <span className="lg:hidden">{shopConfig.breadcrumb}</span>
        <span className="max-lg:hidden">{shopConfig.title}</span>
      </h1>
      <p className="text-[15px] text-muted-foreground max-lg:hidden">
        {shopConfig.description}
      </p>
    </div>
  );
}
