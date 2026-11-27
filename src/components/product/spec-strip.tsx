import { productConfig } from "@/config";
import type { ProductDetail } from "@/features/catalog/types";

import { labelize } from "./scent-profile";

const copy = productConfig.specs;

/** Longevity / Projection / Best for / Season card under the gallery. */
export function SpecStrip({ product }: { product: ProductDetail }) {
  const { profile } = product;
  const specs = [
    { label: copy.longevity, value: profile.longevity },
    {
      label: copy.projection,
      value:
        profile.projection === null
          ? null
          : productConfig.scentProfile.levels[profile.projection - 1]!,
    },
    {
      label: copy.bestFor,
      value: product.occasions.slice(0, 2).map(labelize).join(" · "),
    },
    { label: copy.season, value: profile.seasons.map(labelize).join(" · ") },
  ].filter((s) => s.value);

  if (specs.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-4 rounded-[20px] border bg-card p-4 sm:grid-cols-4 lg:p-5">
      {specs.map((s) => (
        <div key={s.label} className="flex flex-col gap-1 text-center">
          <dt className="text-xs text-muted-foreground">{s.label}</dt>
          <dd className="text-sm font-semibold text-heading">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
