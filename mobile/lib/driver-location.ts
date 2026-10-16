import * as Location from "expo-location";
import { distanceKm } from "@/lib/geo";
import { updateRiderLocation } from "@/lib/ride-matching";
import { Platform } from "react-native";

/** Min time between Supabase writes (ms). */
export const DRIVER_LOCATION_MIN_INTERVAL_MS = 8_000;
/** Min movement before a write (meters). */
export const DRIVER_LOCATION_MIN_DISTANCE_M = 25;
/** Treat location as stale after this age. */
export const DRIVER_LOCATION_STALE_MS = 90_000;
/**
 * Polling fallback — Expo docs: watchPositionAsync only fires in foreground,
 * and on many Android/Expo Go devices watch alone never delivers fixes.
 * Match passenger `startDeviceLocationWatch` reliability.
 */
const DRIVER_POLL_INTERVAL_MS = 5_000;
const DRIVER_WATCH_TIME_MS = 2_000;
const DRIVER_WATCH_DISTANCE_M = 5;

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

async function readGpsFix(): Promise<{ lat: number; lng: number } | null> {
  try {
    const last = await Location.getLastKnownPositionAsync({
      maxAge: 15_000,
      requiredAccuracy: 100,
    });
    if (last?.coords) {
      return {
        lat: last.coords.latitude,
        lng: last.coords.longitude,
      };
    }
  } catch {
    // fall through
  }
  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      mayShowUserSettingsDialog: true,
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Watch real device GPS and persist to `riders.current_lat/lng`.
 * Uses watchPositionAsync AND interval poll (Expo + Android best practice).
 * Foreground only in Expo Go — background needs a custom build +
 * `startLocationUpdatesAsync`.
 * Throttles Supabase writes by time + distance. Caller must stop on cleanup.
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

  const servicesOn = await Location.hasServicesEnabledAsync();
  if (!servicesOn) {
    if (Platform.OS === "android") {
      try {
        await Location.enableNetworkProviderAsync();
      } catch {
        return {
          error:
            "Turn on GPS / location services so passengers can see you on the map.",
        };
      }
    } else {
      return {
        error:
          "Turn on GPS / location services so passengers can see you on the map.",
      };
    }
  }

  if (Platform.OS === "android") {
    try {
      await Location.enableNetworkProviderAsync();
    } catch {
      // user may dismiss; polling may still work with coarse GPS
    }
  }

  let lastWrite: { lat: number; lng: number; at: number } | null = null;
  let stopped = false;

  const maybeWrite = async (lat: number; lng: number) => {
    if (stopped) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
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

  // Seed from last-known / current so Track isn't blank for the first poll cycle.
  const seed = await readGpsFix();
  if (seed) await maybeWrite(seed.lat, seed.lng);

  let sub: Location.LocationSubscription | null = null;
  try {
    sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: DRIVER_WATCH_TIME_MS,
        distanceInterval: DRIVER_WATCH_DISTANCE_M,
        mayShowUserSettingsDialog: true,
      },
      (loc) => {
        void maybeWrite(loc.coords.latitude, loc.coords.longitude);
      }
    );
  } catch {
    // poll fallback covers this
  }

  const timer = setInterval(() => {
    void (async () => {
      if (stopped) return;
      const fix = await readGpsFix();
      if (fix) await maybeWrite(fix.lat, fix.lng);
    })();
  }, DRIVER_POLL_INTERVAL_MS);

  return {
    stop: () => {
      stopped = true;
      clearInterval(timer);
      sub?.remove();
    },
  };
}
