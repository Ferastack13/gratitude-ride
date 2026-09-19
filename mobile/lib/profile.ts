import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export type UserProfile = Tables<"users">;

const AVATAR_BUCKET = "avatars";

function fallbackName(user: User) {
  return (
    String(user.user_metadata?.full_name || "").trim() ||
    user.email?.split("@")[0] ||
    "Passenger"
  );
}

function roleFromUser(user: User): UserProfile["role"] {
  const role = user.user_metadata?.role;
  if (role === "rider" || role === "admin" || role === "client") return role;
  return "client";
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, full_name, phone, role, avatar_url, created_at, updated_at"
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createProfile(
  user: User,
  input?: { full_name?: string; phone?: string | null; email?: string }
): Promise<UserProfile> {
  const row = {
    id: user.id,
    email: (input?.email ?? user.email ?? `${user.id}@users.local`).trim(),
    full_name: (input?.full_name ?? fallbackName(user)).trim() || fallbackName(user),
    phone: input?.phone?.trim() || String(user.user_metadata?.phone || "").trim() || null,
    role: roleFromUser(user),
    avatar_url: null,
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(row, { onConflict: "id" })
    .select(
      "id, email, full_name, phone, role, avatar_url, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Couldn’t create your profile.");
  }
  return data;
}

export async function updateProfile(
  userId: string,
  patch: { full_name: string; phone: string | null; email?: string; avatar_url?: string | null }
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: patch.full_name,
      phone: patch.phone,
      ...(patch.email ? { email: patch.email } : {}),
      ...(patch.avatar_url !== undefined ? { avatar_url: patch.avatar_url } : {}),
    })
    .eq("id", userId)
    .select(
      "id, email, full_name, phone, role, avatar_url, created_at, updated_at"
    )
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Couldn’t update your profile.");
  }
  return data;
}

export async function ensureProfile(user: User): Promise<UserProfile> {
  const existing = await getProfile(user.id);
  if (existing) return existing;
  return createProfile(user);
}

export function avatarObjectPath(userId: string) {
  return `${userId}/avatar.jpg`;
}

export function publicAvatarUrl(path: string) {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function uploadAvatar(userId: string, localUri: string) {
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error("Couldn’t read that photo.");
  }
  const bytes = await response.arrayBuffer();
  const path = avatarObjectPath(userId);
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const avatar_url = publicAvatarUrl(path);
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url })
    .eq("id", userId);
  if (updateError) throw new Error(updateError.message);

  await supabase.auth.updateUser({ data: { avatar_url } });
  return avatar_url;
}

export async function deleteAvatar(userId: string) {
  const path = avatarObjectPath(userId);
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  const { error } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  await supabase.auth.updateUser({ data: { avatar_url: null } });
}

export async function deleteProfile(userId: string) {
  await supabase.storage.from(AVATAR_BUCKET).remove([avatarObjectPath(userId)]);
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    const { error: clearError } = await supabase
      .from("users")
      .update({
        full_name: "Passenger",
        phone: null,
        avatar_url: null,
      })
      .eq("id", userId);
    if (clearError) throw new Error(error.message);
  }
}
