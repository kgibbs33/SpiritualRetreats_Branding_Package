import { createClient } from "@supabase/supabase-js";

import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env-public";

/**
 * Anonymous Supabase client for server-side **public** reads (publishable key).
 * Does not call `cookies()` — safe inside `unstable_cache` and other static
 * cache scopes (Next.js App Router).
 *
 * Use [`createClient`](./server.ts) from `./server` when the request needs
 * cookie-backed session / user-specific RLS.
 */
export function createPublicSupabaseClient() {
  return createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
