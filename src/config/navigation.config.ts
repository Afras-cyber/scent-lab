import type { NavigationConfig } from "./schema";

// Header, mega menu, footer and mobile bottom nav links (labels from the
// Figma exports). Filters are URL search params on /shop.
export const navigationConfig = {
  topBar: {
    left: ["Islandwide Delivery · Free over Rs 5,000", "Cash on Delivery"],
    right: ["100% Authentic Oils", "Bank Transfer"],
  },

  mainNav: [
    { label: "New & Trending", href: "/shop?sort=trending" },
    { label: "Men", href: "/shop?gender=men" },
    { label: "Women", href: "/shop?gender=women" },
    { label: "Attar Oils", href: "/collections/attar-oils" },
    { label: "Oud", href: "/collections/oud" },
    { label: "Musk & Amber", href: "/collections/musk-amber" },
    { label: "Gift Sets", href: "/collections/gift-sets" },
    { label: "Offers", href: "/shop?sale=true", badge: "Sale" },
  ],

  megaMenu: {
    groups: [
      {
        title: "By Category",
        links: [
          { label: "Attar Oils", href: "/collections/attar-oils" },
          { label: "Spray Perfumes", href: "/collections/spray-perfumes" },
          { label: "Oud Collection", href: "/collections/oud" },
          { label: "Musk & Amber", href: "/collections/musk-amber" },
          { label: "Gift Sets", href: "/collections/gift-sets" },
          { label: "Discovery Sets", href: "/collections/discovery-sets" },
        ],
        viewAll: "/collections",
      },
      {
        title: "By Scent Notes",
        links: [
          { label: "Oud", href: "/shop?note=oud" },
          { label: "Amber", href: "/shop?note=amber" },
          { label: "Musk", href: "/shop?note=musk" },
          { label: "Rose", href: "/shop?note=rose" },
          { label: "Saffron", href: "/shop?note=saffron" },
          { label: "Sandalwood", href: "/shop?note=sandalwood" },
          { label: "Vanilla", href: "/shop?note=vanilla" },
        ],
      },
      {
        title: "By Occasion",
        links: [
          { label: "Office", href: "/shop?occasion=office" },
          { label: "Party", href: "/shop?occasion=party" },
          { label: "Wedding", href: "/shop?occasion=wedding" },
          { label: "Date Night", href: "/shop?occasion=date-night" },
          { label: "Everyday", href: "/shop?occasion=everyday" },
          { label: "Eid & Festivals", href: "/shop?occasion=festive" },
        ],
        viewAll: "/shop",
      },
      {
        title: "By Budget",
        links: [
          { label: "Under Rs 1,500", href: "/shop?maxPrice=1500" },
          { label: "Under Rs 3,000", href: "/shop?maxPrice=3000" },
          { label: "Under Rs 5,000", href: "/shop?maxPrice=5000" },
          { label: "From Rs 5,000", href: "/shop?minPrice=5000" },
          { label: "Today’s Deals", href: "/shop?sale=true" },
        ],
        viewAll: "/shop",
      },
    ],
    featured: {
      eyebrow: "Featured",
      title: "The Oud Edit",
      text: "Rich, smoky, regal.",
      cta: { label: "Shop now", href: "/collections/oud" },
    },
  },

  footer: {
    blurb:
      "Arabic-inspired perfumes and attars from Sri Lanka. Long-lasting, authentic and made affordable for everyone.",
    groups: [
      {
        title: "Shop",
        links: [
          { label: "All Perfumes", href: "/shop" },
          { label: "Oud", href: "/collections/oud" },
          { label: "Attar Oils", href: "/collections/attar-oils" },
          { label: "Musk & Amber", href: "/collections/musk-amber" },
          { label: "Gift Sets", href: "/collections/gift-sets" },
          { label: "Offers", href: "/shop?sale=true" },
        ],
      },
      {
        title: "Help",
        links: [
          { label: "Track Order", href: "/track-order" },
          { label: "Shipping & Delivery", href: "/delivery-returns" },
          { label: "Returns & Refunds", href: "/delivery-returns#returns" },
          { label: "FAQ", href: "/faq" },
          { label: "Authenticity", href: "/about#authenticity" },
        ],
      },
    ],
  },

  bottomNav: [
    { label: "Home", href: "/", icon: "home" },
    { label: "Shop", href: "/shop", icon: "shop" },
    { label: "Cart", href: "/cart", icon: "cart" },
    { label: "WhatsApp", icon: "whatsapp" }, // opens wa.me from siteConfig
    { label: "Track", href: "/track-order", icon: "track" },
  ],
} as const satisfies NavigationConfig;
