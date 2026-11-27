import { collectionsConfig } from "@/config";
import { countLabel } from "@/lib/count";

export function collectionHref(slug: string) {
  return `/collections/${slug}`;
}

/** "18 perfumes", or the collection's own unit ("22 attars"). */
export function collectionCountLabel(slug: string, count: number) {
  const units: Record<string, { one: string; other: string }> =
    collectionsConfig.units;
  return countLabel(count, units[slug] ?? collectionsConfig.defaultUnit);
}
