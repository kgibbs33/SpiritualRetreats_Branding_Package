import { createClient } from "@supabase/supabase-js";

import { getSupabaseSecretKey } from "@/lib/supabase/env-admin";
import { getSupabaseUrl } from "@/lib/supabase/env-public";

/**
 * Admin client with secret / service-role key.
 * Use only in API routes / server-side for bypassing RLS.
 */
export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey());
}
