"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/public-env";
import type { Database } from "@/types/database.types";

let supabaseClient: SupabaseClient<Database> | undefined;

/** Browser client with the publishable key. RLS limits it to the public catalog. */
export function getSupabaseBrowserClient() {
  supabaseClient ??= createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return supabaseClient;
}
