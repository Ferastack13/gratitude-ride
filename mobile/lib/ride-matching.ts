import { distanceKm } from "@/lib/geo";
import type { Delivery } from "@/lib/deliveries";
import { supabase } from "@/lib/supabase";

/** Demo/assignment radius — nearby pending pickups for an online driver. */
export const DRIVER_MATCH_RADIUS_KM = 25;

export type LatLng = { lat: number; lng: number };

export function isWithinRadius(
  from: LatLng,
  to: LatLng,
  radiusKm = DRIVER_MATCH_RADIUS_KM
) {
  return distanceKm(from, to) <= radiusKm;
}

/** Filter pending deliveries by pickup proximity to the driver. */
export function filterNearbyPending(
  rows: Delivery[],
  driver: LatLng | null,
  declinedIds: Set<string>,
  radiusKm = DRIVER_MATCH_RADIUS_KM
): Delivery[] {
  return rows.filter((row) => {
    if (declinedIds.has(row.id)) return false;
    if (row.status !== "pending" || row.rider_id) return false;
    if (row.pickup_lat == null || row.pickup_lng == null) return false;
    // Without driver GPS we still show requests that have coords (better than Lagos city lock).
    if (!driver) return true;
    return isWithinRadius(
      driver,
      { lat: Number(row.pickup_lat), lng: Number(row.pickup_lng) },
      radiusKm
    );
  });
}

export async function updateRiderLocation(riderId: string, coords: LatLng) {
  const { error } = await supabase
    .from("riders")
    .update({
      current_lat: coords.lat,
      current_lng: coords.lng,
      location_updated_at: new Date().toISOString(),
    } as never)
    .eq("id", riderId);
  if (error) throw error;
}

/** Atomic accept — first valid driver wins (DB function). */
export async function acceptDeliveryAtomic(deliveryId: string): Promise<Delivery> {
  const { data, error } = await supabase.rpc("accept_delivery", {
    p_delivery_id: deliveryId,
  });
  if (error) throw error;
  return data as Delivery;
}

/** Persist decline for this rider only — ride stays pending for others. */
export async function declineDeliveryForRider(
  deliveryId: string,
  riderId: string
) {
  const { error } = await supabase.from("delivery_declines").upsert(
    {
      delivery_id: deliveryId,
      rider_id: riderId,
    } as never,
    { onConflict: "delivery_id,rider_id" }
  );
  if (error) throw error;
}

export async function loadMyDeclinedDeliveryIds(riderId: string) {
  const { data, error } = await supabase
    .from("delivery_declines")
    .select("delivery_id")
    .eq("rider_id", riderId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.delivery_id as string));
}

export async function cancelPendingDelivery(trackingId: string) {
  const { data, error } = await supabase.rpc("cancel_pending_delivery", {
    p_tracking_id: trackingId,
  });
  if (error) throw error;
  return data as Delivery;
}

export function rideTypeFromNotes(notes: string | null | undefined) {
  const n = (notes ?? "").toLowerCase();
  if (n.includes("express")) return "Express";
  if (n.includes("comfort")) return "Comfort";
  if (n.includes("standard")) return "Standard";
  return "Ride";
}
