import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
};

function roleFromMetadata(user: User): UserRole {
  const role = user.user_metadata?.role;
  if (role === "rider" || role === "admin" || role === "client") {
    return role;
  }
  return "client";
}

function referralCodeFromId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/**
 * Load the public.users profile, creating it from auth metadata when missing.
 * Fixes login → dashboard bounce when the handle_new_user trigger was never applied.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
): Promise<ProfileRow | null> {
  const { data: existing } = await supabase
    .from("users")
    .select("id, email, full_name, phone, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing as ProfileRow;
  }

  const role = roleFromMetadata(user);
  const fullName =
    String(user.user_metadata?.full_name || "").trim() ||
    user.email?.split("@")[0] ||
    "User";
  const phone = String(user.user_metadata?.phone || "").trim() || null;

  const { data: created, error } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email ?? `${user.id}@users.local`,
        full_name: fullName,
        phone,
        role,
      },
      { onConflict: "id" }
    )
    .select("id, email, full_name, phone, role, avatar_url")
    .maybeSingle();

  if (error) {
    console.error("ensureUserProfile users upsert failed:", error.message);
    // Fall back so auth can still complete when RLS blocks insert
    return {
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      phone,
      role,
      avatar_url: null,
    };
  }

  if (role === "rider") {
    const vehicleType =
      String(user.user_metadata?.vehicle_type || "").trim() || "Motorcycle";
    const { error: riderError } = await supabase.from("riders").upsert(
      {
        user_id: user.id,
        vehicle_type: vehicleType,
      },
      { onConflict: "user_id" }
    );
    if (riderError) {
      console.error("ensureUserProfile riders upsert failed:", riderError.message);
    }
  } else if (role === "client") {
    const { error: clientError } = await supabase.from("clients").upsert(
      {
        user_id: user.id,
        referral_code: referralCodeFromId(user.id),
      },
      { onConflict: "user_id" }
    );
    if (clientError) {
      console.error("ensureUserProfile clients upsert failed:", clientError.message);
    }
  }

  return (created as ProfileRow) ?? {
    id: user.id,
    email: user.email ?? "",
    full_name: fullName,
    phone,
    role,
    avatar_url: null,
  };
}
