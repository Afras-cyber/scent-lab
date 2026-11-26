import { formatLKR } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Whole-percent discount, e.g. 19 for Rs 3,490 down from Rs 4,290. */
export function discountPercent(price: number, compareAt: number | null) {
  if (compareAt === null || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Price, struck-through compare-at price and a `-19%` pill when on sale. */
export function Price({
  price,
  compareAt,
  from = false,
  className,
}: {
  price: number;
  compareAt: number | null;
  /** Prefix "From" when the product has several sizes. */
  from?: boolean;
  className?: string;
}) {
  const discount = discountPercent(price, compareAt);
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      <span className="text-xl font-bold text-heading">
        {from && (
          <span className="mr-1 text-sm font-medium text-muted-foreground">
            From
          </span>
        )}
        {formatLKR(price)}
      </span>
      {discount > 0 && (
        <>
          <s className="text-[13px] text-muted-foreground">
            <span className="sr-only">Was </span>
            {formatLKR(compareAt!)}
          </s>
          <span className="rounded-md bg-gold/20 px-1.5 py-0.5 text-[11px] font-semibold text-heading">
            -{discount}%
          </span>
        </>
      )}
    </p>
  );
}
