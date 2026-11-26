import type { HomeConfig } from "./schema";

// Home page copy (labels from the Figma exports). Products, prices, collections,
// banners and reviews come from Supabase; only fixed marketing text lives here.
export const homeConfig = {
  collections: {
    eyebrow: "Shop by Collection",
    title: "Find Your Signature Scent",
    viewAll: { label: "View All Collections", href: "/collections" },
    // The first collection (by sort order) is the large card; the next four
    // are the small ones.
    flagshipEyebrow: "Flagship",
  },

  trending: {
    eyebrow: "Trending Now",
    title: "Curated Top Trending",
    viewAll: { label: "View All Products", href: "/shop?sort=trending" },
    tabs: [
      { label: "For Him", gender: "men" },
      { label: "For Her", gender: "women" },
      { label: "Unisex", gender: "unisex" },
      { label: "Attar Oils", collection: "attar-oils" },
    ],
  },

  discoveryPromo: {
    eyebrow: "Best for First-Timers",
    // Name and price come from this product.
    productSlug: "attar-discovery-set",
    text: "Try 5 signature attars in 3ml roll-ons. Find your favourite before you commit.",
    ctaLabel: "Shop the Set",
  },

  helpPromo: {
    eyebrow: "Personal Help",
    title: "Not sure what to pick?",
    text: "Chat with us on WhatsApp. We reply fast, 10am–10pm, every day.",
    ctaLabel: "Chat on WhatsApp",
  },

  budget: {
    eyebrow: "Affordable Luxury",
    title: "Shop by Budget",
    tiers: [
      { kind: "under", amount: 1500, text: "Everyday attars" },
      { kind: "under", amount: 3000, text: "Best-value perfumes" },
      { kind: "under", amount: 5000, text: "Premium oud blends" },
      { kind: "from", amount: 5000, text: "Luxury & gift sets" },
    ],
  },

  featuredCollection: {
    eyebrow: "Featured Collection",
    collectionSlug: "oud",
    title: "The Oud Edit",
    text: "Rich oud, smoky amber and warm woods — our most-loved blends in one place.",
    ctaLabel: "Explore the Edit",
  },

  whyAyad: {
    // The heading shows on mobile only, as in the design.
    eyebrow: "Why AYAD",
    title: "Luxury, Without the Price Tag",
    items: [
      {
        icon: "drop",
        title: "Premium Oils",
        text: "Rich, concentrated, real notes",
      },
      { icon: "clock", title: "Long Lasting", text: "8–12 hours on skin" },
      { icon: "cash", title: "Cash on Delivery", text: "Pay when it arrives" },
      {
        icon: "truck",
        title: "Islandwide Delivery",
        text: "Colombo 1–2 days, others 2–4",
      },
    ],
  },

  orderSteps: {
    eyebrow: "Easy Checkout",
    title: "Order in 3 Steps — No Account Needed",
    steps: [
      {
        title: "Choose your scent",
        text: "Browse, filter by notes or budget, and add to cart.",
      },
      {
        title: "Enter delivery details",
        text: "Just your name, phone and address. No sign-up.",
      },
      {
        title: "Pay on delivery",
        text: "Cash on Delivery islandwide, or pay by bank transfer.",
      },
    ],
  },

  trackOrder: {
    eyebrow: "No Login Needed",
    title: "Track Your Order",
    text: "Enter your Order ID and the phone number you used at checkout to see where your perfume is right now.",
    formTitle: "Where is my order?",
    statuses: ["Confirmed", "Packed", "Dispatched", "Delivered"],
  },

  reviews: {
    eyebrow: "Reviews",
    title: "Let Customers Speak For Us",
  },

  newsletter: {
    title: "Get offers & new scents first",
    text: "Just your email. No account needed. Unsubscribe anytime.",
  },
} as const satisfies HomeConfig;
