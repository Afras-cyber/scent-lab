import { collectionsConfig } from "./collections.config";
import { commerceConfig } from "./commerce.config";
import { featuresConfig } from "./features.config";
import { homeConfig } from "./home.config";
import { navigationConfig } from "./navigation.config";
import { productConfig } from "./product.config";
import { validateConfig } from "./schema";
import { searchConfig } from "./search.config";
import { seoConfig } from "./seo.config";
import { shopConfig } from "./shop.config";
import { siteConfig } from "./site.config";
import { whatsappConfig } from "./whatsapp.config";

// Relative imports only: next.config.ts loads this file outside the app bundle.

export const allConfigs = {
  site: siteConfig,
  commerce: commerceConfig,
  whatsapp: whatsappConfig,
  navigation: navigationConfig,
  seo: seoConfig,
  features: featuresConfig,
  home: homeConfig,
  shop: shopConfig,
  search: searchConfig,
  collections: collectionsConfig,
  product: productConfig,
};

/** Throws when any config is invalid, or (strict) still has placeholders. */
export function assertConfigReady({ strict }: { strict: boolean }) {
  const problems = validateConfig(allConfigs, { strict });
  if (problems.length > 0) {
    throw new Error(
      `src/config is not ready${strict ? " for production" : ""}:\n${problems.map((p) => `  - ${p}`).join("\n")}` +
        (strict
          ? "\n\nSet ALLOW_CONFIG_PLACEHOLDERS=true to build anyway (CI and previews only)."
          : ""),
    );
  }
}
