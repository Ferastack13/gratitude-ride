import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey, error } = getSupabaseEnv();
  if (!url || !anonKey) {
    throw new Error(error ?? "Supabase is not configured.");
  }

  return createBrowserClient(url, anonKey);
}
