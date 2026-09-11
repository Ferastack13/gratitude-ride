import * as Location from "expo-location";
import { distanceKm } from "@/lib/geo";
import { reverseLivePlace, type LivePlace } from "@/lib/places";

export type LocationPermission = "granted" | "denied" | "undetermined";

export type DeviceLocationResult =
  | {
      ok: true;
      permission: "granted";
      coords: { lat: number; lng: number };
      place: LivePlace;
    }
  | {
      ok: false;
      permission: LocationPermission;
      reason: "permission" | "unavailable" | "timeout";
      message: string;
    };

/** Min movement before reverse-geocode (Nominatim rate limits). */
const REVERSE_MIN_DISTANCE_M = 35;
/** Min time between reverse-geocode calls. */
const REVERSE_MIN_INTERVAL_MS = 12_000;
/** GPS watch cadence. */
const WATCH_TIME_MS = 4_000;
const WATCH_DISTANCE_M = 12;

function placeFromCoords(
  lat: number,
  lng: number,
  reversed: LivePlace | null
): LivePlace {
  if (reversed) {
    return { ...reversed, lat, lng };
  }
  return {
    id: `gps-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    title: "Current location",
    subtitle: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    address: "Current location",
    lat,
    lng,
  };
}

async function ensureForegroundPermission(): Promise<LocationPermission> {
  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;
  if (status === "undetermined") {
    const asked = await Location.requestForegroundPermissionsAsync();
    status = asked.status;
  }
  if (status === "granted") return "granted";
  return status === "denied" ? "denied" : "undetermined";
}

/** Request permission and resolve the device GPS into a readable place. Never invents a city. */
export async function resolveCurrentLocation(): Promise<DeviceLocationResult> {
  try {
    const permission = await ensureForegroundPermission();

    if (permission !== "granted") {
      return {
        ok: false,
        permission,
        reason: "permission",
        message:
          "Location permission is off. Enable it to use your current position, or search for pickup manually.",
      };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };

    const reversed = await reverseLivePlace(coords.lat, coords.lng);
    const place = placeFromCoords(coords.lat, coords.lng, reversed);

    return { ok: true, permission: "granted", coords, place };
  } catch {
    return {
      ok: false,
      permission: "granted",
      reason: "unavailable",
      message:
        "Couldn’t read your GPS. Search for your pickup location instead.",
    };
  }
}

export type DeviceLocationWatchHandlers = {
  /** Called on every meaningful GPS update (coords always fresh). */
  onUpdate: (place: LivePlace) => void;
  onError?: (message: string) => void;
};

/**
 * Continuously watch device GPS while Home (or caller) is active.
 * Updates coords immediately; reverse-geocodes on a throttle so the street label stays fresh
 * without hammering Nominatim.
 */
export async function startDeviceLocationWatch(
  handlers: DeviceLocationWatchHandlers
): Promise<{ stop: () => void } | { error: string }> {
  const permission = await ensureForegroundPermission();
  if (permission !== "granted") {
    return {
      error:
        "Location permission is off. Enable it to use your current position, or search for pickup manually.",
    };
  }

  let stopped = false;
  let lastReverse: {
    lat: number;
    lng: number;
    at: number;
    place: LivePlace;
  } | null = null;

  const publish = async (lat: number, lng: number, forceReverse: boolean) => {
    if (stopped) return;

    const now = Date.now();
    let shouldReverse = forceReverse || !lastReverse;
    if (lastReverse && !forceReverse) {
      const movedM = distanceKm(lastReverse, { lat, lng }) * 1000;
      const elapsed = now - lastReverse.at;
      shouldReverse =
        movedM >= REVERSE_MIN_DISTANCE_M ||
        elapsed >= REVERSE_MIN_INTERVAL_MS;
    }

    if (!shouldReverse && lastReverse) {
      handlers.onUpdate({
        ...lastReverse.place,
        lat,
        lng,
        id: `gps-${lat.toFixed(5)}-${lng.toFixed(5)}`,
      });
      return;
    }

    let reversed: LivePlace | null = null;
    try {
      reversed = await reverseLivePlace(lat, lng);
    } catch {
      reversed = lastReverse?.place ?? null;
    }
    if (stopped) return;

    const place = placeFromCoords(lat, lng, reversed);
    lastReverse = { lat, lng, at: now, place };
    handlers.onUpdate(place);
  };

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await publish(pos.coords.latitude, pos.coords.longitude, true);
  } catch {
    handlers.onError?.(
      "Couldn’t read your GPS. Search for your pickup location instead."
    );
  }

  let sub: Location.LocationSubscription;
  try {
    sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: WATCH_TIME_MS,
        distanceInterval: WATCH_DISTANCE_M,
      },
      (loc) => {
        void publish(loc.coords.latitude, loc.coords.longitude, false);
      }
    );
  } catch {
    return {
      error:
        "Couldn’t start live location. Search for your pickup location instead.",
    };
  }

  return {
    stop: () => {
      stopped = true;
      sub.remove();
    },
  };
}

export function placeParams(
  place: LivePlace,
  prefix: "pickup" | "dropoff"
): Record<string, string> {
  return {
    [`${prefix}Lat`]: String(place.lat),
    [`${prefix}Lng`]: String(place.lng),
    [`${prefix}Title`]: place.title,
    [`${prefix}Address`]: place.address,
    [`${prefix}City`]: place.city || place.state || "Nigeria",
  };
}
