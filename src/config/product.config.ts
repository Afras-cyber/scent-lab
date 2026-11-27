import type { ProductConfig } from "./schema";

// Product page and quick view copy (labels from the Figma "Product page" and
// "Buy box states" exports). Names, prices, notes and the scent profile come
// from the catalog.
export const productConfig = {
  buyBox: {
    verifiedBuyers: "Verified buyers",
    inStock: "In stock",
    inStockNote: "Ready to ship",
    lowStock: "Only {count} left",
    lowStockNote: "Order soon",
    outOfStock: "Out of stock",
    outOfStockNote: "Back soon",
    size: "Size",
    soldOut: "Sold out",
    save: "Save {percent}%",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    // Shown under the disabled Add to Cart until the cart ships (Phase 2).
    cartSoon: "Cart checkout is coming soon. Order on WhatsApp for now.",
    orderWhatsapp: "Order via WhatsApp",
    orderWhatsappNote:
      "Opens WhatsApp with your order details. Replies are quick.",
    notifyWhatsapp: "Notify me on WhatsApp",
    notifyWhatsappNote: "We will message you on WhatsApp as soon as it's back.",
    share: "Share:",
    shareWhatsapp: "Share on WhatsApp",
    copyLink: "Copy link",
    linkCopied: "Link copied",
  },

  trustBadges: [
    { icon: "cash", label: "Cash on Delivery" },
    { icon: "truck", label: "Islandwide" },
    { icon: "shield", label: "100% Authentic" },
    { icon: "clock", label: "Long Lasting" },
  ],

  delivery: {
    title: "Check delivery to your district",
    placeholder: "Select district",
    check: "Check",
    // {district}, {fee}, {days}
    result: "Delivery to {district}: {fee} · {days}",
    // {threshold}
    free: "Free delivery on orders over {threshold}.",
  },

  specs: {
    longevity: "Longevity",
    projection: "Projection",
    bestFor: "Best for",
    season: "Season",
  },

  scentProfile: {
    eyebrow: "The scent",
    title: "Scent profile",
    pyramidTitle: "Notes pyramid",
    tiers: { top: "Top", heart: "Heart", base: "Base" },
    performanceTitle: "Performance",
    metrics: {
      longevity: "Longevity",
      projection: "Projection",
      sweetness: "Sweetness",
      freshness: "Freshness",
    },
    // Labels for levels 1 to 5.
    levels: ["Very low", "Low", "Moderate", "Strong", "Very strong"],
    bestFor: "Best for",
  },

  details: {
    description: "Description",
    sections: [
      {
        title: "Delivery & returns",
        text: "We deliver islandwide in 1–4 days. Pay by Cash on Delivery or bank transfer. If your bottle arrives damaged or wrong, message us on WhatsApp within 48 hours and we will replace it.",
      },
      {
        title: "Authenticity guarantee",
        text: "Every bottle is filled and sealed by AYAD in Sri Lanka from the same oils we test ourselves. No copies, no watered-down blends.",
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        question: "How long does it last?",
        answer:
          "Attar oils usually last 8–12 hours on skin; sprays 6–8 hours. Apply to pulse points for the longest wear.",
      },
      {
        question: "Is it alcohol free?",
        answer:
          "Our attar oils are alcohol free. Eau de Parfum sprays contain perfumer's alcohol.",
      },
      {
        question: "Can I try before buying a big bottle?",
        answer:
          "Yes. Pick the smallest size, or a Discovery Set with several scents.",
      },
    ],
  },

  reviews: {
    eyebrow: "Reviews",
    title: "Customer reviews",
    empty: "No reviews yet. Bought this scent? Tell us what you think.",
    // Opens WhatsApp until review submission is built.
    writeReview: "Write a review",
    writeReviewMessage: "Hello AYAD, I'd like to leave a review for {product}.",
  },

  related: {
    eyebrow: "You may also like",
    title: "Pairs well with",
  },

  quickView: {
    viewDetails: "View full details",
    error: "This product could not be loaded.",
  },
} as const satisfies ProductConfig;
