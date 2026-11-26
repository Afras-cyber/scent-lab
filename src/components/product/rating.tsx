import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Five gold stars, filled to the nearest whole star. */
export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <span className={cn("flex gap-0.5 text-gold", className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("size-3", i < filled ? "fill-current" : "opacity-30")}
        />
      ))}
    </span>
  );
}

/** Stars, average and count: `★★★★★ 4.9 (156)`. Hidden with no ratings. */
export function Rating({
  average,
  count,
  className,
}: {
  average: number;
  count: number;
  className?: string;
}) {
  if (count === 0) return null;
  return (
    <p
      className={cn("flex items-center gap-1.5 text-[13px]", className)}
      aria-label={`Rated ${average.toFixed(1)} out of 5 from ${count} reviews`}
    >
      <Stars value={average} />
      <span className="font-semibold text-heading">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </p>
  );
}
