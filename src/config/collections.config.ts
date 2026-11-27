import type { CollectionsConfig } from "./schema";

// /collections and /collections/[slug] copy. Names, descriptions and images
// come from the `collections` table.
export const collectionsConfig = {
  index: {
    title: "Perfume collections",
    description:
      "Oud, attar oils, spray perfumes, musk & amber and gift sets. Cash on Delivery islandwide.",
    eyebrow: "Collections",
    heading: "Shop by collection",
    flagshipEyebrow: "Signature",
    exploreLabel: "Explore",
  },
  detail: {
    eyebrow: "Collection",
    allLabel: "All perfumes",
    // Heading above the filters and grid.
    listingTitle: "Shop {name}",
  },
  units: {
    "attar-oils": { one: "attar", other: "attars" },
    "gift-sets": { one: "gift set", other: "gift sets" },
    "discovery-sets": { one: "set", other: "sets" },
  },
  defaultUnit: { one: "perfume", other: "perfumes" },
} as const satisfies CollectionsConfig;
