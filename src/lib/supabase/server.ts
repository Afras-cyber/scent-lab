import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

// Customers have no Supabase session, so this client reads no cookies. That
// keeps catalog reads usable inside "use cache" functions. RLS applies.

/** Server client with the publishable key, for public catalog reads. */
export function createSupabaseServerClient() {
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
