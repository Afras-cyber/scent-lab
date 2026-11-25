import { z } from "zod";

// Shared by `env.ts` (server), `public-env.ts` (browser) and next.config.ts
// (build-time check). Variables marked "later" are optional until the phase
// that uses them; make them required when that feature ships.

const secret = z.string().min(32, "Use at least 32 random characters");

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // later: Phase 2 (checkout)
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

export const serverEnvSchema = publicEnvSchema.extend({
  // Bypasses RLS. Server only, never NEXT_PUBLIC.
  SUPABASE_SECRET_KEY: z.string().min(1),

  // later: Phase 4 (admin auth)
  AUTH_SECRET: secret.optional(),
  AUTH_URL: z.url().optional(),

  // later: Phase 2 (abuse protection)
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),

  // later: Phase 3B (WhatsApp Cloud API)
  WHATSAPP_PHONE_NUMBER_ID: z.string().regex(/^\d+$/).optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().regex(/^\d+$/).optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: secret.optional(),
  CRON_SECRET: secret.optional(),
  INVOICE_LINK_SECRET: secret.optional(),

  // later: Phase 1 (on-demand revalidation)
  REVALIDATE_SECRET: secret.optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Treats `KEY=` (empty) as unset, so optional variables can stay blank in .env files. */
function dropEmpty(source: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== ""));
}

export function parseServerEnv(source: Record<string, string | undefined>) {
  return serverEnvSchema.safeParse(dropEmpty(source));
}

export function parsePublicEnv(source: Record<string, string | undefined>) {
  return publicEnvSchema.safeParse(dropEmpty(source));
}

export function formatEnvIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
}
