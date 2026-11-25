import type { FeaturesConfig } from "./schema";

export const featuresConfig = {
  darkMode: true,
  reviews: true,
  newsletter: true,
  whatsappNotifications: true,
  turnstile: true,
} as const satisfies FeaturesConfig;
