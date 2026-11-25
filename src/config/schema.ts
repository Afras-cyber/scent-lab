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

export const notificationEventSchema = z.enum([
  "order_placed",
  "payment_received",
  "order_dispatched",
  "order_delivered",
  "order_cancelled",
]);

const notificationEventConfig = z.object({
  enabled: z.boolean(),
  template: z
    .string()
    .regex(/^[a-z0-9_]+$/, "WhatsApp template names are lowercase snake_case"),
  attach: z.enum(["invoice", "receipt"]).nullable(),
});

export const notificationsConfigSchema = z.object({
  provider: z.literal("whatsapp-cloud"),
  graphApiVersion: z.string().regex(/^v\d+\.\d+$/),
  language: z.string().min(2),
  events: z.record(notificationEventSchema, notificationEventConfig),
  retry: z
    .object({
      maxAttempts: z.int().min(1).max(10),
      backoffSeconds: z.array(z.int().positive()).readonly(),
    })
    .refine((r) => r.backoffSeconds.length >= r.maxAttempts, {
      message: "backoffSeconds needs one entry per attempt",
    }),
  optIn: z.object({
    required: z.literal(true),
    checkboxDefaultChecked: z.literal(false),
  }),
  pdf: z.object({
    paper: z.literal("A4"),
    showTaxLine: z.boolean(),
  }),
});

export const navigationConfigSchema = z.object({
  topBar: z.object({
    left: z.array(z.string().min(1)).readonly(),
    right: z.array(z.string().min(1)).readonly(),
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
  whatsappNotifications: z.boolean(),
  turnstile: z.boolean(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type CommerceConfig = z.infer<typeof commerceConfigSchema>;
export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>;
export type NavigationConfig = z.infer<typeof navigationConfigSchema>;
export type SeoConfig = z.infer<typeof seoConfigSchema>;
export type FeaturesConfig = z.infer<typeof featuresConfigSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;

// --- Placeholder detection -------------------------------------------------

/** Dummy values from the spec that pass format checks but must not ship. */
const KNOWN_PLACEHOLDER_VALUES = new Set(["94767760000", "+94767760000"]);

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
  notifications: unknown;
  navigation: unknown;
  seo: unknown;
  features: unknown;
};

const schemas = {
  site: siteConfigSchema,
  commerce: commerceConfigSchema,
  notifications: notificationsConfigSchema,
  navigation: navigationConfigSchema,
  seo: seoConfigSchema,
  features: featuresConfigSchema,
} as const;

/**
 * Validates every config. Returns a list of human-readable problems (empty
 * when everything is fine). With `strict`, placeholders and missing launch
 * values (bank details, WhatsApp number) are problems too.
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
