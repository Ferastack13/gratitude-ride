import { supabase } from "@/lib/supabase";
import type { DeliveryStatus } from "@/lib/format";
import type { Tables } from "@/types/database";

export type Delivery = Tables<"deliveries">;

export const STATUS_FLOW: DeliveryStatus[] = [
  "pending",
  "accepted",
  "picked_up",
  "in_transit",
  "delivered",
];

export const TIMELINE_LABELS: Record<DeliveryStatus, string> = {
  pending: "Order placed",
  accepted: "Rider assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function buildTimeline(status: DeliveryStatus) {
  if (status === "cancelled") {
    return [
      { key: "pending", label: TIMELINE_LABELS.pending, done: true, active: false },
      { key: "cancelled", label: TIMELINE_LABELS.cancelled, done: true, active: true },
    ];
  }

  const activeIndex = STATUS_FLOW.indexOf(status);
  return STATUS_FLOW.map((key, index) => ({
    key,
    label: TIMELINE_LABELS[key],
    done: index < activeIndex,
    active: index === activeIndex,
  }));
}

export function nextStatus(status: DeliveryStatus): DeliveryStatus | null {
  const index = STATUS_FLOW.indexOf(status);
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function randomReferralCode() {
  return `GR${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function ensureClientId(userId: string) {
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("clients")
    .insert({ user_id: userId, referral_code: randomReferralCode() })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function ensureRiderId(userId: string, vehicleType = "motorcycle") {
  const { data: existing } = await supabase
    .from("riders")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("riders")
    .insert({ user_id: userId, vehicle_type: vehicleType })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function createTrackingId() {
  const { data, error } = await supabase.rpc("generate_tracking_id");
  if (!error && data) return data;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "GR";
  for (let i = 0; i < 6; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}
