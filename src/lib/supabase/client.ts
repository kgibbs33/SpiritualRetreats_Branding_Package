import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env-public";

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
