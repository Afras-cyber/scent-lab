import { formatEnvIssues, parsePublicEnv } from "./env-schema";

// Each NEXT_PUBLIC_ variable is referenced by its full name so Next.js can
// inline it into the browser bundle.
const parsed = parsePublicEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

if (!parsed.success) {
  throw new Error(
    `Invalid public environment variables:\n${formatEnvIssues(parsed.error)}`,
  );
}

/** Validated NEXT_PUBLIC_ variables. Safe to import from client components. */
export const publicEnv = parsed.data;
