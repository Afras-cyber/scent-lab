import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { assertConfigReady } from "./src/config/check";
import { formatEnvIssues, parseServerEnv } from "./src/lib/env-schema";

// Product images that are not in public/ live in the public `products` bucket
// (see resolveImagePath in src/lib/images.ts).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  images: {
    remotePatterns: supabaseUrl
      ? [
          new URL(
            `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/products/**`,
          ),
        ]
      : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default function config(phase: string): NextConfig {
  // `next typegen` also loads the config in the build phase, so check the CLI
  // command too.
  if (phase === PHASE_PRODUCTION_BUILD && process.argv.includes("build")) {
    // Fail the build on missing secrets or leftover config placeholders.
    if (process.env.SKIP_ENV_VALIDATION !== "true") {
      const env = parseServerEnv(process.env);
      if (!env.success) {
        throw new Error(
          `Invalid environment variables:\n${formatEnvIssues(env.error)}`,
        );
      }
    }
    assertConfigReady({
      strict: process.env.ALLOW_CONFIG_PLACEHOLDERS !== "true",
    });
  }
  return nextConfig;
}
