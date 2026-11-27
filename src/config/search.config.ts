import type { SearchConfig } from "./schema";

// Search popup and /search page copy (labels from the Figma "Search popup"
// exports). Results, counts and notes come from the catalog.
export const searchConfig = {
  placeholder: {
    desktop: "Search perfumes, collections, scent notes…",
    mobile: "Search oud, musk, attar…",
  },
  // Perfume rows in the popup; "See all" opens /search with the rest.
  maxProducts: 4,

  labels: {
    recent: "Recent searches",
    popular: "Popular searches",
    quickLinks: "Quick links",
    perfumes: "Perfumes",
    collections: "Collections",
    notes: "Scent notes",
    browse: "Browse the shop",
    seeAll: "See all {count} results",
  },

  popularSearches: [
    { label: "Oud Royale", query: "Oud Royale" },
    { label: "Saffron", query: "saffron" },
    { label: "Gift sets", href: "/collections/gift-sets" },
    { label: "Under Rs 3,000", href: "/shop?maxPrice=3000" },
    { label: "Rose attar", query: "rose attar" },
  ],

  quickLinks: [
    {
      label: "For Him",
      href: "/shop?gender=men",
      filters: { gender: ["men"] },
    },
    {
      label: "For Her",
      href: "/shop?gender=women",
      filters: { gender: ["women"] },
    },
    {
      label: "Attar Oils",
      href: "/collections/attar-oils",
      filters: { collection: ["attar-oils"] },
      unit: { one: "attar", other: "attars" },
    },
    {
      label: "Oud Collection",
      href: "/collections/oud",
      filters: { collection: ["oud"] },
    },
  ],

  noResults: {
    title: "Nothing found for “{query}”",
    text: "Check the spelling, or try a scent note like oud, amber or musk.",
    suggestions: [
      { label: "Oud", query: "oud" },
      { label: "Amber", query: "amber" },
      { label: "Musk", query: "musk" },
      { label: "Attar oils", href: "/collections/attar-oils" },
      { label: "Gift sets", href: "/collections/gift-sets" },
    ],
    whatsappLabel: "Ask us on WhatsApp",
  },

  page: {
    title: "Search",
    description: "Search AYAD perfumes, attar oils, collections and notes.",
    eyebrow: "Search",
    resultsTitle: "Results for “{query}”",
    emptyTitle: "What are you looking for?",
    emptyText:
      "Search by perfume name, scent note or collection, or start from a popular search.",
    // Label of the default sort on /search (relevance instead of featured).
    bestMatchLabel: "Best match",
    // Products under the empty and no-results states.
    popularEyebrow: "Popular right now",
    popularTitle: "Customer favourites",
  },
} as const satisfies SearchConfig;
