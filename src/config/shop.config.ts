import type { ShopConfig } from "./schema";

// Shop page copy and filter options (labels from the Figma exports). Notes,
// sizes, counts and price bounds come from the catalog.
export const shopConfig = {
  title: "Shop all perfumes",
  description: "Oud, attar oils, musk and amber. Cash on Delivery islandwide.",
  breadcrumb: "Shop",

  // Pills under the title. Each one replaces the current filters (sort is kept).
  quickFilters: [
    { label: "All", filters: {} },
    { label: "For Him", filters: { gender: ["men"] } },
    { label: "For Her", filters: { gender: ["women"] } },
    { label: "Unisex", filters: { gender: ["unisex"] } },
    { label: "Attar Oils", filters: { collection: ["attar-oils"] } },
    { label: "Oud", filters: { collection: ["oud"] } },
    { label: "Musk & Amber", filters: { collection: ["musk-amber"] } },
    { label: "Gift Sets", filters: { collection: ["gift-sets"] } },
    { label: "On Sale", filters: { sale: true } },
  ],

  genderLabels: { men: "Men", women: "Women", unisex: "Unisex" },

  // The "Type" filter section: collections that describe the product format.
  types: [
    { slug: "attar-oils", label: "Attar oil" },
    { slug: "spray-perfumes", label: "Spray perfume" },
    { slug: "gift-sets", label: "Gift set" },
  ],

  pricePresets: [
    { label: "Under 1,500", maxPrice: 1500 },
    { label: "Under 3,000", maxPrice: 3000 },
    { label: "Under 5,000", maxPrice: 5000 },
    { label: "5,000+", minPrice: 5000 },
  ],

  sortLabels: {
    featured: "Recommended",
    newest: "Newest first",
    "price-asc": "Price: low to high",
    "price-desc": "Price: high to low",
    // No sales data yet, so this is featured + review count, not "best selling".
    trending: "Most popular",
    rating: "Top rated",
  },

  noResults: {
    title: "No perfumes match these filters",
    text: "Try removing a filter or choose a wider price range. Or ask us on WhatsApp and we will help you find the right scent.",
    whatsappMessage: "Hello AYAD, I need help finding a scent.",
    popularTitle: "Popular collections",
    popularCollections: [
      { label: "Oud", slug: "oud" },
      { label: "Attar Oils", slug: "attar-oils" },
      { label: "Musk & Amber", slug: "musk-amber" },
      { label: "Gift Sets", slug: "gift-sets" },
    ],
  },
} as const satisfies ShopConfig;
