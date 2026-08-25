import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile, type ProfileRow } from "@/lib/supabase/profile";
import type { UserRole } from "@/types";
import { getDashboardPath } from "@/lib/routes";

export type Profile = ProfileRow;

export { getDashboardPath };

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return ensureUserProfile(supabase, user);
}

export type { UserRole };
