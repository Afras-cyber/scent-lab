import { productConfig } from "@/config";
import { longevityShare } from "@/features/catalog/mappers";
import type { NoteTier, ProductDetail } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

const copy = productConfig.scentProfile;

const tierStyles: Record<NoteTier, string> = {
  top: "bg-[#e0c97a] text-brand-deep",
  heart: "bg-[#8aa79d] text-white",
  base: "bg-brand-mid text-white",
};

/** Occasion or season slug as a label: "date-night" → "Date night". */
export function labelize(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

/** Notes pyramid and performance bars (Figma "Scent profile"). */
export function ScentProfile({ product }: { product: ProductDetail }) {
  const { profile } = product;
  const tiers = (["top", "heart", "base"] as const).filter(
    (t) => profile.pyramid[t].length > 0,
  );
  const bars = [
    {
      label: copy.metrics.longevity,
      share: longevityShare(profile.longevity),
      value: profile.longevity,
    },
    ...(["projection", "sweetness", "freshness"] as const).map((key) => {
      const level = profile[key];
      return {
        label: copy.metrics[key],
        share: level === null ? null : level / 5,
        value: level === null ? null : copy.levels[level - 1]!,
      };
    }),
  ].filter((bar) => bar.share !== null);
  const bestFor = [...product.occasions, ...profile.seasons].map(labelize);

  if (tiers.length === 0 && bars.length === 0) return null;

  return (
    <section
      aria-labelledby="scent-profile"
      className="container-page flex flex-col gap-6 lg:gap-8"
    >
      <div className="flex flex-col items-start gap-3">
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-secondary-foreground uppercase">
          {copy.eyebrow}
        </span>
        <h2 id="scent-profile" className="text-3xl font-semibold md:text-4xl">
          {copy.title}
        </h2>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
        {tiers.length > 0 && (
          <div className="flex flex-col gap-4 rounded-[20px] bg-card p-5 shadow-sm lg:p-7">
            <h3 className="text-xl font-semibold">{copy.pyramidTitle}</h3>
            <ul className="flex flex-col gap-3">
              {tiers.map((tier) => (
                <li
                  key={tier}
                  className="flex items-center gap-4 rounded-2xl bg-muted p-3"
                >
                  <span
                    className={cn(
                      "inline-flex h-10 w-16 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold tracking-[0.1em] uppercase",
                      tierStyles[tier],
                    )}
                  >
                    {copy.tiers[tier]}
                  </span>
                  <span className="font-medium text-heading">
                    {profile.pyramid[tier].map((n) => n.name).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
            {profile.story && (
              <p className="text-sm leading-relaxed text-foreground/85">
                {profile.story}
              </p>
            )}
          </div>
        )}

        {bars.length > 0 && (
          <div className="flex flex-col gap-4 rounded-[20px] bg-card p-5 shadow-sm lg:p-7">
            <h3 className="text-xl font-semibold">{copy.performanceTitle}</h3>
            <dl className="flex flex-col gap-4">
              {bars.map((bar) => (
                <div key={bar.label} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <dt className="font-medium text-heading">{bar.label}</dt>
                    <dd className="text-muted-foreground">{bar.value}</dd>
                  </div>
                  <span
                    className="block h-1.5 overflow-hidden rounded-full bg-secondary"
                    aria-hidden
                  >
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-brand-mid to-gold"
                      style={{ width: `${bar.share! * 100}%` }}
                    />
                  </span>
                </div>
              ))}
            </dl>
            {bestFor.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <p className="text-sm font-medium text-heading">
                  {copy.bestFor}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {bestFor.map((label) => (
                    <li
                      key={label}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium tracking-wide text-secondary-foreground"
                    >
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
