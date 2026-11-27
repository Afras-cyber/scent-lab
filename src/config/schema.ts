import { z } from "zod";

// Zod schemas for every file in src/config. Config files use
// `as const satisfies <Type>` for autocomplete; `validateConfig()` re-checks
// the values at build time, and in strict mode rejects leftover placeholders.

const url = z.url({ protocol: /^https$/ });
const optionalUrl = z.union([z.literal(""), url]);
const href = z
  .string()
  .regex(/^\/(?!\/)/, "Internal links must start with a single /");

const link = z.object({
  label: z.string().min(1),
  href,
});

const linkGroup = z.object({
  title: z.string().min(1),
  links: z.array(link).min(1).readonly(),
  viewAll: href.optional(),
});

export const siteConfigSchema = z.object({
  name: z.string().min(1),
  legalName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(50).max(200),
  url,
  domain: z.string().min(1),
  language: z.string().length(2),
  locale: z.string().min(2),
  timezone: z.string().min(1),
  currency: z.object({
    code: z.literal("LKR"),
    symbol: z.string().min(1),
    decimals: z.literal(0),
  }),
  brand: z.object({
    logoText: z.string().min(1),
    logoLetterSpacing: z.string().regex(/^\d*\.?\d+em$/),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  contact: z.object({
    phoneDisplay: z.string().min(1),
    phoneE164: z
      .string()
      .regex(/^\+94\d{9}$/, "Use E.164, for example +94771234567"),
    whatsapp: z.object({
      display: z.string().min(1),
      number: z
        .string()
        .regex(/^94\d{9}$/, "Digits only, country code first, no +"),
      defaultMessage: z.string().min(1),
    }),
    email: z.email(),
    hours: z.string().min(1),
    address: z.object({
      line1: z.string().min(1),
      city: z.string().min(1),
      district: z.string().min(1),
      country: z.string().min(1),
    }),
  }),
  social: z.object({
    instagram: optionalUrl,
    facebook: optionalUrl,
    tiktok: optionalUrl,
  }),
});

export const paymentMethodSchema = z.enum(["cod", "bank_transfer"]);

export const commerceConfigSchema = z.object({
  orderCodePrefix: z.string().regex(/^[A-Z]{2,5}$/),
  invoicePrefix: z.string().regex(/^[A-Z]{2,5}$/),
  receiptPrefix: z.string().regex(/^[A-Z]{2,5}$/),
  maxQtyPerLine: z.int().min(1).max(20),
  maxLinesPerOrder: z.int().min(1).max(50),
  freeDeliveryThresholdLkr: z.int().nonnegative(),
  lowStockThreshold: z.int().min(1),
  productsPerPage: z.int().min(4).max(48),
  paymentMethods: z.array(paymentMethodSchema).min(1).readonly(),
  bankTransfer: z.object({
    bankName: z.string(),
    accountName: z.string(),
    accountNumber: z.string(),
    branch: z.string(),
  }),
  deliveryEstimate: z.object({
    colombo: z.string().min(1),
    other: z.string().min(1),
  }),
});

// Prefilled texts for customer-to-shop wa.me links. `{token}` values are
// filled in when the link is built; the general help text is
// `site.contact.whatsapp.defaultMessage`.
const waMessage = z.string().min(1).max(1000);

export const whatsappConfigSchema = z.object({
  messages: z.object({
    product: waMessage, // {product}, {size}, {url}
    productOrder: waMessage, // {qty}, {product}, {size}, {total}, {url}
    share: waMessage, // {product}, {url}
    orderPlaced: waMessage, // {orderCode}, {total}
    orderHelp: waMessage, // {orderCode}
    notifyStock: waMessage, // {product}, {url}
    search: waMessage, // {query}
  }),
});

const topBarItem = z.object({
  label: z.string().min(1),
  short: z.string().min(1).optional(),
  icon: z.enum(["truck", "cash", "shield", "bank"]),
});

export const navigationConfigSchema = z.object({
  // Desktop: `left` at the start, `center` in the middle, then the phone and
  // Track Order. Mobile shows `left` only, using `short` when set.
  topBar: z.object({
    left: z.array(topBarItem).min(1).readonly(),
    center: z.array(topBarItem).readonly(),
  }),
  // WhatsApp call-to-action labels in the nav row and the floating button.
  whatsappCta: z.object({
    nav: z.string().min(1),
    float: z.string().min(1),
  }),
  mainNav: z
    .array(link.extend({ badge: z.string().optional() }))
    .min(1)
    .readonly(),
  megaMenu: z.object({
    groups: z.array(linkGroup).min(1).readonly(),
    featured: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      text: z.string().min(1),
      cta: link,
    }),
  }),
  footer: z.object({
    blurb: z.string().min(1),
    groups: z.array(linkGroup).min(1).readonly(),
  }),
  bottomNav: z
    .array(
      z.object({
        label: z.string().min(1),
        // Omitted for the WhatsApp item, which links to wa.me.
        href: href.optional(),
        icon: z.enum(["home", "shop", "cart", "whatsapp", "track"]),
      }),
    )
    .length(5)
    .readonly(),
});

export const seoConfigSchema = z.object({
  titleTemplate: z.string().includes("%s"),
  defaultTitle: z.string().min(1).max(70),
  ogImage: z.object({
    path: href,
    width: z.int().positive(),
    height: z.int().positive(),
    alt: z.string().min(1),
  }),
  twitterHandle: z.string(),
  noIndexPaths: z.array(href).readonly(),
});

export const featuresConfigSchema = z.object({
  darkMode: z.boolean(),
  reviews: z.boolean(),
  newsletter: z.boolean(),
  turnstile: z.boolean(),
});

const slugRef = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const sectionHeading = {
  eyebrow: z.string().min(1),
  title: z.string().min(1),
};

export const homeConfigSchema = z.object({
  collections: z.object({
    ...sectionHeading,
    viewAll: link,
    flagshipEyebrow: z.string().min(1),
  }),
  trending: z.object({
    ...sectionHeading,
    viewAll: link,
    // Each tab filters by gender or by collection slug.
    tabs: z
      .array(
        z.union([
          z.object({
            label: z.string().min(1),
            gender: z.enum(["men", "women", "unisex"]),
          }),
          z.object({ label: z.string().min(1), collection: slugRef }),
        ]),
      )
      .min(1)
      .readonly(),
  }),
  discoveryPromo: z.object({
    eyebrow: z.string().min(1),
    productSlug: slugRef,
    text: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  helpPromo: z.object({
    ...sectionHeading,
    text: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  budget: z.object({
    ...sectionHeading,
    tiers: z
      .array(
        z.object({
          kind: z.enum(["under", "from"]),
          amount: z.int().positive(),
          text: z.string().min(1),
        }),
      )
      .min(1)
      .readonly(),
  }),
  featuredCollection: z.object({
    ...sectionHeading,
    collectionSlug: slugRef,
    text: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  whyAyad: z.object({
    ...sectionHeading,
    items: z
      .array(
        z.object({
          icon: z.enum(["drop", "clock", "cash", "truck"]),
          title: z.string().min(1),
          text: z.string().min(1),
        }),
      )
      .min(1)
      .readonly(),
  }),
  orderSteps: z.object({
    ...sectionHeading,
    steps: z
      .array(z.object({ title: z.string().min(1), text: z.string().min(1) }))
      .min(1)
      .readonly(),
  }),
  trackOrder: z.object({
    ...sectionHeading,
    text: z.string().min(1),
    formTitle: z.string().min(1),
    statuses: z.array(z.string().min(1)).min(1).readonly(),
  }),
  reviews: z.object(sectionHeading),
  newsletter: z.object({
    title: z.string().min(1),
    text: z.string().min(1),
  }),
});

const genderEnum = z.enum(["men", "women", "unisex"]);
const sortEnum = z.enum([
  "featured",
  "trending",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
]);

export const shopConfigSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  breadcrumb: z.string().min(1),
  quickFilters: z
    .array(
      z.object({
        label: z.string().min(1),
        filters: z.object({
          gender: z.array(genderEnum).readonly().optional(),
          collection: z.array(slugRef).readonly().optional(),
          sale: z.literal(true).optional(),
        }),
      }),
    )
    .min(1)
    .readonly(),
  genderLabels: z.record(genderEnum, z.string().min(1)),
  types: z
    .array(z.object({ slug: slugRef, label: z.string().min(1) }))
    .readonly(),
  pricePresets: z
    .array(
      z.object({
        label: z.string().min(1),
        minPrice: z.int().positive().optional(),
        maxPrice: z.int().positive().optional(),
      }),
    )
    .readonly(),
  sortLabels: z.record(sortEnum, z.string().min(1)),
  noResults: z.object({
    title: z.string().min(1),
    text: z.string().min(1),
    whatsappMessage: z.string().min(1).max(1000),
    popularTitle: z.string().min(1),
    popularCollections: z
      .array(z.object({ label: z.string().min(1), slug: slugRef }))
      .readonly(),
  }),
});

// A chip that either fills the search field (`query`) or opens a page (`href`).
const searchChip = z.union([
  z.object({ label: z.string().min(1), query: z.string().min(1).max(80) }),
  z.object({ label: z.string().min(1), href }),
]);
const countUnit = z.object({
  one: z.string().min(1),
  other: z.string().min(1),
});

export const searchConfigSchema = z.object({
  placeholder: z.object({
    desktop: z.string().min(1),
    mobile: z.string().min(1),
  }),
  maxProducts: z.int().min(1).max(10),
  labels: z.object({
    recent: z.string().min(1),
    popular: z.string().min(1),
    quickLinks: z.string().min(1),
    perfumes: z.string().min(1),
    collections: z.string().min(1),
    notes: z.string().min(1),
    browse: z.string().min(1),
    seeAll: z.string().min(1), // {count}
  }),
  popularSearches: z.array(searchChip).readonly(),
  quickLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        href,
        // Counted with the shop filter, e.g. "18 perfumes".
        filters: z.object({
          gender: z.array(genderEnum).readonly().optional(),
          collection: z.array(slugRef).readonly().optional(),
        }),
        unit: countUnit.optional(),
      }),
    )
    .readonly(),
  noResults: z.object({
    title: z.string().min(1), // {query}
    text: z.string().min(1),
    suggestions: z.array(searchChip).readonly(),
    whatsappLabel: z.string().min(1),
  }),
  page: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    eyebrow: z.string().min(1),
    resultsTitle: z.string().min(1), // {query}
    emptyTitle: z.string().min(1),
    emptyText: z.string().min(1),
    bestMatchLabel: z.string().min(1),
    popularEyebrow: z.string().min(1),
    popularTitle: z.string().min(1),
  }),
});

export const collectionsConfigSchema = z.object({
  index: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    eyebrow: z.string().min(1),
    heading: z.string().min(1),
    flagshipEyebrow: z.string().min(1),
    exploreLabel: z.string().min(1),
  }),
  detail: z.object({
    eyebrow: z.string().min(1),
    allLabel: z.string().min(1),
    listingTitle: z.string().min(1), // {name}
  }),
  // "22 attars" instead of "22 perfumes" for some collections.
  units: z.record(slugRef, countUnit),
  defaultUnit: countUnit,
});

const textItem = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

export const productConfigSchema = z.object({
  buyBox: z.object({
    verifiedBuyers: z.string().min(1),
    inStock: z.string().min(1),
    inStockNote: z.string().min(1),
    lowStock: z.string().includes("{count}"),
    lowStockNote: z.string().min(1),
    outOfStock: z.string().min(1),
    outOfStockNote: z.string().min(1),
    size: z.string().min(1),
    soldOut: z.string().min(1),
    save: z.string().includes("{percent}"),
    quantity: z.string().min(1),
    addToCart: z.string().min(1),
    cartSoon: z.string().min(1),
    orderWhatsapp: z.string().min(1),
    orderWhatsappNote: z.string().min(1),
    notifyWhatsapp: z.string().min(1),
    notifyWhatsappNote: z.string().min(1),
    share: z.string().min(1),
    shareWhatsapp: z.string().min(1),
    copyLink: z.string().min(1),
    linkCopied: z.string().min(1),
  }),
  trustBadges: z
    .array(
      z.object({
        icon: z.enum(["cash", "truck", "shield", "clock"]),
        label: z.string().min(1),
      }),
    )
    .min(1)
    .max(4)
    .readonly(),
  delivery: z.object({
    title: z.string().min(1),
    placeholder: z.string().min(1),
    check: z.string().min(1),
    result: z.string().min(1), // {district}, {fee}, {days}
    free: z.string().includes("{threshold}"),
  }),
  specs: z.object({
    longevity: z.string().min(1),
    projection: z.string().min(1),
    bestFor: z.string().min(1),
    season: z.string().min(1),
  }),
  scentProfile: z.object({
    ...sectionHeading,
    pyramidTitle: z.string().min(1),
    tiers: z.object({
      top: z.string().min(1),
      heart: z.string().min(1),
      base: z.string().min(1),
    }),
    performanceTitle: z.string().min(1),
    metrics: z.object({
      longevity: z.string().min(1),
      projection: z.string().min(1),
      sweetness: z.string().min(1),
      freshness: z.string().min(1),
    }),
    levels: z.array(z.string().min(1)).length(5).readonly(),
    bestFor: z.string().min(1),
  }),
  details: z.object({
    description: z.string().min(1),
    sections: z.array(textItem).readonly(),
    faqTitle: z.string().min(1),
    faq: z
      .array(
        z.object({ question: z.string().min(1), answer: z.string().min(1) }),
      )
      .readonly(),
  }),
  reviews: z.object({
    ...sectionHeading,
    empty: z.string().min(1),
    writeReview: z.string().min(1),
    writeReviewMessage: waMessage, // {product}
  }),
  related: z.object(sectionHeading),
  quickView: z.object({
    viewDetails: z.string().min(1),
    error: z.string().min(1),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type CommerceConfig = z.infer<typeof commerceConfigSchema>;
export type WhatsappConfig = z.infer<typeof whatsappConfigSchema>;
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
export type SeoConfig = z.infer<typeof seoConfigSchema>;
export type FeaturesConfig = z.infer<typeof featuresConfigSchema>;
export type HomeConfig = z.infer<typeof homeConfigSchema>;
export type ShopConfig = z.infer<typeof shopConfigSchema>;
export type SearchConfig = z.infer<typeof searchConfigSchema>;
export type CollectionsConfig = z.infer<typeof collectionsConfigSchema>;
export type ProductConfig = z.infer<typeof productConfigSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

// --- Placeholder detection -------------------------------------------------

/**
 * Dummy values that pass format checks but must not ship: the spec's sample
 * number, and the mock address and bank details used until the client
 * supplies real ones (marked `// MOCK` in the config files).
 */
const KNOWN_PLACEHOLDER_VALUES = new Set([
  "94767760000",
  "+94767760000",
  "No. 1, Sample Road",
  "Sample Bank PLC",
  "0000 0000 0000",
]);

const PLACEHOLDER_PATTERN = /TODO|\*{3,}/;

/** Returns the dotted paths of every string that still holds a placeholder. */
export function findPlaceholders(value: unknown, path = ""): string[] {
  if (typeof value === "string") {
    return PLACEHOLDER_PATTERN.test(value) ||
      KNOWN_PLACEHOLDER_VALUES.has(value)
      ? [path]
      : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => findPlaceholders(item, `${path}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, v]) =>
      findPlaceholders(v, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

type ConfigBundle = {
  site: unknown;
  commerce: unknown;
  whatsapp: unknown;
  navigation: unknown;
  seo: unknown;
  features: unknown;
  home: unknown;
  shop: unknown;
  search: unknown;
  collections: unknown;
  product: unknown;
};

const schemas = {
  site: siteConfigSchema,
  commerce: commerceConfigSchema,
  whatsapp: whatsappConfigSchema,
  navigation: navigationConfigSchema,
  seo: seoConfigSchema,
  features: featuresConfigSchema,
  home: homeConfigSchema,
  shop: shopConfigSchema,
  search: searchConfigSchema,
  collections: collectionsConfigSchema,
  product: productConfigSchema,
} as const;

/**
 * Validates every config. Returns a list of human-readable problems (empty
 * when everything is fine). With `strict`, placeholders and missing launch
 * values (bank details, WhatsApp number, mock values) are problems too.
 */
export function validateConfig(
  configs: ConfigBundle,
  { strict }: { strict: boolean },
): string[] {
  const problems: string[] = [];

  for (const key of Object.keys(schemas) as (keyof typeof schemas)[]) {
    const result = schemas[key].safeParse(configs[key]);
    if (!result.success) {
      for (const issue of result.error.issues) {
        problems.push(`${key}.${issue.path.join(".")}: ${issue.message}`);
      }
    }
  }

  if (strict) {
    for (const key of Object.keys(schemas) as (keyof typeof schemas)[]) {
      for (const path of findPlaceholders(configs[key])) {
        problems.push(
          `${key}.${path}: placeholder value must be replaced before launch`,
        );
      }
    }

    const commerce = commerceConfigSchema.safeParse(configs.commerce);
    if (
      commerce.success &&
      commerce.data.paymentMethods.includes("bank_transfer")
    ) {
      for (const [field, value] of Object.entries(commerce.data.bankTransfer)) {
        if (!value)
          problems.push(
            `commerce.bankTransfer.${field}: required for bank transfer`,
          );
      }
    }
  }

  return problems;
}
