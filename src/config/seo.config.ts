import type { SeoConfig } from "./schema";

export const seoConfig = {
  titleTemplate: "%s · AYAD",
  defaultTitle: "AYAD — Oud, Attar & Arabic Perfumes in Sri Lanka",
  ogImage: {
    path: "/images/banners/home_banner_desktop.png",
    width: 1440,
    height: 548,
    alt: "AYAD perfumes and attars",
  },
  twitterHandle: "",
  noIndexPaths: ["/admin", "/api", "/checkout", "/cart", "/order-success"],
} as const satisfies SeoConfig;
