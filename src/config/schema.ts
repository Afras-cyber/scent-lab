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
    orderPlaced: waMessage, // {orderCode}, {total}
    orderHelp: waMessage, // {orderCode}
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

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type CommerceConfig = z.infer<typeof commerceConfigSchema>;
export type WhatsappConfig = z.infer<typeof whatsappConfigSchema>;
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
export type SeoConfig = z.infer<typeof seoConfigSchema>;
export type FeaturesConfig = z.infer<typeof featuresConfigSchema>;
export type HomeConfig = z.infer<typeof homeConfigSchema>;
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
};

const schemas = {
  site: siteConfigSchema,
  commerce: commerceConfigSchema,
  whatsapp: whatsappConfigSchema,
  navigation: navigationConfigSchema,
  seo: seoConfigSchema,
  features: featuresConfigSchema,
  home: homeConfigSchema,
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
