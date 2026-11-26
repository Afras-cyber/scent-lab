"use server";

import { featuresConfig } from "@/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { subscribeSchema, type SubscribeState } from "./schemas";

// Postgres unique_violation: the email is already subscribed.
const UNIQUE_VIOLATION = "23505";

/**
 * Adds an email to `newsletter_subscribers` (no anon access, so this uses the
 * secret key). A filled `company` field is the honeypot: bots get a fake
 * success. Rate limiting and Turnstile come with checkout (spec §15).
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  if (!featuresConfig.newsletter) {
    return { status: "error", message: "Sign-ups are closed right now." };
  }
  if (formData.get("company")) return { status: "success" };

  const parsed = subscribeSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address",
    };
  }

  const { error } = await createSupabaseAdminClient()
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email, source: "home" });
  // Already subscribed counts as success, so the form doesn't reveal who is
  // on the list. The email itself is never logged.
  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error("newsletter subscribe failed", error.code);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
  return { status: "success" };
}
