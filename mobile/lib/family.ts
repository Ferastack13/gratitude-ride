import { addInboxMessage } from "@/lib/inbox";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";

export const FAMILY_MEMBER_LIMIT = 10;
const PENDING_CODE_KEY = "gr.family.pendingCode";
const SEEN_ACCEPTED_KEY = "gr.family.seenAccepted";

export type FamilyInviteStatus = "pending" | "accepted" | "cancelled";
export type FamilyMember = Tables<"family_invites">;

export type FamilyInvitePreview = {
  invitee_name: string;
  inviter_name: string;
  status: string;
};

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "GR";
  for (let i = 0; i < 5; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function nigeriaWhatsAppNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return `234${d.slice(1)}`;
  if (d.length === 10) return `234${d}`;
  return d;
}

export function familyInviteLink(code: string) {
  const app = Linking.createURL("family/join", { queryParams: { code } });
  const scheme = `gratituderide://family/join?code=${encodeURIComponent(code)}`;
  return { app, scheme, code };
}

export function familyInviteMessage(input: {
  inviteeName: string;
  inviterName: string;
  code: string;
}) {
  const { app, scheme } = familyInviteLink(input.code);
  const first = input.inviterName.split(" ")[0] || "your family";
  return (
    `Hi ${input.inviteeName} — ${first} invited you to the Gratitude Ride family profile.\n\n` +
    `They can cover your trips once you join.\n\n` +
    `Join here:\n${app}\n\n` +
    `If the link doesn’t open, open Gratitude Ride and enter family code ${input.code}\n\n` +
    `(App link: ${scheme})`
  );
}

export async function stashPendingFamilyCode(code: string) {
  const clean = code.trim().toUpperCase();
  if (!clean) return;
  await AsyncStorage.setItem(PENDING_CODE_KEY, clean);
}

export async function readPendingFamilyCode() {
  return (await AsyncStorage.getItem(PENDING_CODE_KEY))?.trim().toUpperCase() ?? null;
}

export async function clearPendingFamilyCode() {
  await AsyncStorage.removeItem(PENDING_CODE_KEY);
}

export async function getFamilyMembers(inviterId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from("family_invites")
    .select(
      "id, inviter_id, invitee_name, invitee_phone, code, status, accepted_by, accepted_at, created_at, updated_at"
    )
    .eq("inviter_id", inviterId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function inviteFamilyMember(input: {
  name: string;
  phone: string;
  inviterId: string;
}): Promise<{ ok: true; member: FamilyMember } | { ok: false; message: string }> {
  const name = input.name.trim();
  const phone = input.phone.replace(/\s+/g, "").trim();
  if (name.length < 2) {
    return { ok: false, message: "Enter the family member’s full name." };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Enter a valid phone number." };
  }

  let existing: FamilyMember[] = [];
  try {
    existing = await getFamilyMembers(input.inviterId);
  } catch {
    return { ok: false, message: "Couldn’t load your family list. Check your connection." };
  }

  if (existing.length >= FAMILY_MEMBER_LIMIT) {
    return { ok: false, message: "You can add up to 10 people on a Family profile." };
  }
  if (existing.some((m) => (m.invitee_phone ?? "") === phone)) {
    return { ok: false, message: "That number is already invited." };
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const code = makeCode();
    const { data, error } = await supabase
      .from("family_invites")
      .insert({
        inviter_id: input.inviterId,
        invitee_name: name,
        invitee_phone: phone,
        code,
        status: "pending",
      })
      .select(
        "id, inviter_id, invitee_name, invitee_phone, code, status, accepted_by, accepted_at, created_at, updated_at"
      )
      .single();

    if (!error && data) return { ok: true, member: data };
    if (error?.code === "23505") continue;
    return {
      ok: false,
      message: error?.message ?? "Couldn’t send invite. Try again.",
    };
  }

  return { ok: false, message: "Couldn’t create an invite code. Try again." };
}

export async function uninviteFamilyMember(id: string) {
  const { error } = await supabase
    .from("family_invites")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function peekFamilyInvite(
  code: string
): Promise<FamilyInvitePreview | null> {
  const { data, error } = await supabase.rpc("peek_family_invite", {
    p_code: code.trim().toUpperCase(),
  });
  if (error || !data?.length) return null;
  return data[0];
}

export async function acceptFamilyInvite(code: string): Promise<{
  ok: boolean;
  already?: boolean;
  message?: string;
}> {
  const { data, error } = await supabase.rpc("accept_family_invite", {
    p_code: code.trim().toUpperCase(),
  });
  if (error) {
    return { ok: false, message: error.message.replace(/^.*error: /i, "") };
  }
  const payload = data as { ok?: boolean; already?: boolean } | null;
  return { ok: Boolean(payload?.ok), already: Boolean(payload?.already) };
}

/** After signup/login, join the family from a stored invite code. */
export async function consumePendingFamilyInvite(): Promise<{
  joined: boolean;
  already?: boolean;
  message?: string;
} | null> {
  const code = await readPendingFamilyCode();
  if (!code) return null;
  const res = await acceptFamilyInvite(code);
  if (res.ok) {
    await clearPendingFamilyCode();
    await addInboxMessage({
      category: "updates",
      title: res.already ? "You’re in the family" : "You joined a family",
      body: res.already
        ? "This Gratitude family invite was already accepted on your account."
        : "You’re now on a family profile. They can cover your trips.",
    }).catch(() => undefined);
  }
  return {
    joined: Boolean(res.ok),
    already: res.already,
    message: res.message,
  };
}

export async function notifyInviterOfNewJoins(members: FamilyMember[]) {
  const accepted = members.filter((m) => m.status === "accepted");
  if (!accepted.length) return;
  let seen: string[] = [];
  try {
    const raw = await AsyncStorage.getItem(SEEN_ACCEPTED_KEY);
    seen = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    seen = [];
  }
  const fresh = accepted.filter((m) => !seen.includes(m.id));
  for (const m of fresh) {
    await addInboxMessage({
      id: `fam-join-${m.id}`,
      category: "updates",
      title: `${m.invitee_name} joined your family`,
      body: "They accepted your Gratitude family invite. You can cover their trips.",
    }).catch(() => undefined);
  }
  await AsyncStorage.setItem(
    SEEN_ACCEPTED_KEY,
    JSON.stringify(accepted.map((m) => m.id))
  );
}

export function qrImageUrl(code: string) {
  const { app } = familyInviteLink(code);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(app)}`;
}
