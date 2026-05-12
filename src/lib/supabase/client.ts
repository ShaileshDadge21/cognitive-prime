import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, integrationStatus } from "@/lib/config/env";
import type { Database } from "@/types/database";

const isBrowser = typeof window !== "undefined";

let client: SupabaseClient<Database> | undefined;

export function getSupabaseClient() {
  if (!integrationStatus.supabaseConfigured || !env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        autoRefreshToken: isBrowser,
        detectSessionInUrl: isBrowser,
        persistSession: isBrowser,
        flowType: "pkce", // Use PKCE flow for better security in browser environments
      },
      db: {
        schema: "public",
      },
    });
  }

  return client;
}

export function isSupabaseConfigured() {
  return integrationStatus.supabaseConfigured;
}
