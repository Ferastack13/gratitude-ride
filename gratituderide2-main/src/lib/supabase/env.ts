export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (
    !url ||
    !anonKey ||
    url.includes("your_supabase") ||
    anonKey.includes("your_supabase")
  ) {
    return {
      url: null,
      anonKey: null,
      error:
        "Supabase is not configured. Copy .env.local.example to .env.local and add your project URL and anon key.",
    } as const;
  }

  return { url, anonKey, error: null } as const;
}
