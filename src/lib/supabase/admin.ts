import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Secret-key client that bypasses RLS. Use it only in server code that has
 * already checked its caller: checkout and track-order actions, the
 * notification worker, and admin actions after `requireAdmin()`.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
