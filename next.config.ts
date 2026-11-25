import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { assertConfigReady } from "./src/config/check";
import { formatEnvIssues, parseServerEnv } from "./src/lib/env-schema";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
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
