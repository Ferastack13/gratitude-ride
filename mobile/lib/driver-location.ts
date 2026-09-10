import * as Location from "expo-location";
import { distanceKm } from "@/lib/geo";
import { updateRiderLocation } from "@/lib/ride-matching";

/** Min time between Supabase writes (ms). */
export const DRIVER_LOCATION_MIN_INTERVAL_MS = 8_000;
/** Min movement before a write (meters). */
export const DRIVER_LOCATION_MIN_DISTANCE_M = 25;
/** Treat location as stale after this age. */
export const DRIVER_LOCATION_STALE_MS = 90_000;

export type DriverLiveLocation = {
  lat: number;
  lng: number;
  updatedAt: string | null;
};

export function isDriverLocationStale(
  updatedAt: string | null | undefined,
  now = Date.now()
) {
  if (!updatedAt) return true;
  return now - new Date(updatedAt).getTime() > DRIVER_LOCATION_STALE_MS;
}

export function formatLocationAge(updatedAt: string | null | undefined) {
  if (!updatedAt) return "Waiting for driver’s location…";
  const sec = Math.max(
    0,
    Math.round((Date.now() - new Date(updatedAt).getTime()) / 1000)
  );
  if (sec < 8) return "Live now";
  if (sec < 60) return `Updated ${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `Updated ${min}m ago`;
}

/**
 * Watch real device GPS and persist to `riders.current_lat/lng`.
 * Throttles writes by time + distance. Caller must stop on cleanup.
 */
export async function startDriverLocationPublisher(
  riderId: string,
  onUpdate?: (coords: { lat: number; lng: number }) => void
): Promise<{ stop: () => void } | { error: string }> {
  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const asked = await Location.requestForegroundPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") {
    return {
      error:
        "Location permission is required to share your position with passengers.",
    };
  }

  let lastWrite: { lat: number; lng: number; at: number } | null = null;
  let stopped = false;

  const maybeWrite = async (lat: number, lng: number) => {
    if (stopped) return;
    onUpdate?.({ lat, lng });

    const now = Date.now();
    if (lastWrite) {
      const movedM = distanceKm(lastWrite, { lat, lng }) * 1000;
      const elapsed = now - lastWrite.at;
      if (
        elapsed < DRIVER_LOCATION_MIN_INTERVAL_MS &&
        movedM < DRIVER_LOCATION_MIN_DISTANCE_M
      ) {
        return;
      }
    }

    lastWrite = { lat, lng, at: now };
    try {
      await updateRiderLocation(riderId, { lat, lng });
    } catch {
      // non-fatal — next tick retries
    }
  };

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await maybeWrite(pos.coords.latitude, pos.coords.longitude);
  } catch {
    // watch may still recover
  }

  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: DRIVER_LOCATION_MIN_INTERVAL_MS,
      distanceInterval: DRIVER_LOCATION_MIN_DISTANCE_M,
    },
    (loc) => {
      void maybeWrite(loc.coords.latitude, loc.coords.longitude);
    }
  );

  return {
    stop: () => {
      stopped = true;
      sub.remove();
    },
  };
}
