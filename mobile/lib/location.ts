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
const REVERSE_MIN_DISTANCE_M = 25;
/** Min time between reverse-geocode calls. */
const REVERSE_MIN_INTERVAL_MS = 10_000;
const REVERSE_TIMEOUT_MS = 6_000;
/** GPS watch cadence — keep low so small walks still fire. */
const WATCH_TIME_MS = 2_000;
const WATCH_DISTANCE_M = 5;

const LOG = (...args: unknown[]) => {
  console.log("[GR-GPS]", ...args);
};

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

async function reverseWithTimeout(
  lat: number,
  lng: number
): Promise<LivePlace | null> {
  try {
    return await Promise.race([
      reverseLivePlace(lat, lng),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), REVERSE_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return null;
  }
}

async function ensureForegroundPermission(): Promise<LocationPermission> {
  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;
  LOG("permission:current", status);
  if (status === "undetermined") {
    const asked = await Location.requestForegroundPermissionsAsync();
    status = asked.status;
    LOG("permission:requested", status);
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
    LOG("resolveCurrentLocation", coords);

    const reversed = await reverseWithTimeout(coords.lat, coords.lng);
    const place = placeFromCoords(coords.lat, coords.lng, reversed);

    return { ok: true, permission: "granted", coords, place };
  } catch (e) {
    LOG("resolveCurrentLocation:error", e);
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
 *
 * IMPORTANT: watchPositionAsync starts immediately. Reverse-geocode must NEVER
 * block starting the watch (Nominatim hangs were preventing live updates).
 */
export async function startDeviceLocationWatch(
  handlers: DeviceLocationWatchHandlers
): Promise<{ stop: () => void } | { error: string }> {
  LOG("watch:start");
  const permission = await ensureForegroundPermission();
  if (permission !== "granted") {
    LOG("watch:permission-denied", permission);
    return {
      error:
        "Location permission is off. Enable it to use your current position, or search for pickup manually.",
    };
  }

  const servicesOn = await Location.hasServicesEnabledAsync();
  LOG("watch:servicesEnabled", servicesOn);
  if (!servicesOn) {
    return {
      error:
        "Location services are turned off on this phone. Enable GPS and try again.",
    };
  }

  let stopped = false;
  let reverseInFlight = false;
  let lastReverse: {
    lat: number;
    lng: number;
    at: number;
    place: LivePlace;
  } | null = null;

  const emitCoords = (lat: number, lng: number, label: string) => {
    if (stopped) return;
    const place = placeFromCoords(
      lat,
      lng,
      lastReverse
        ? { ...lastReverse.place, lat, lng }
        : null
    );
    // Keep last known street label while moving; coords always fresh.
    if (lastReverse) {
      place.title = lastReverse.place.title;
      place.address = lastReverse.place.address;
      place.subtitle = lastReverse.place.subtitle;
      place.city = lastReverse.place.city;
      place.state = lastReverse.place.state;
    }
    LOG(label, {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      title: place.title,
    });
    handlers.onUpdate(place);
  };

  const maybeReverse = async (lat: number, lng: number, force: boolean) => {
    if (stopped || reverseInFlight) return;

    const now = Date.now();
    let shouldReverse = force || !lastReverse;
    if (lastReverse && !force) {
      const movedM = distanceKm(lastReverse, { lat, lng }) * 1000;
      const elapsed = now - lastReverse.at;
      shouldReverse =
        movedM >= REVERSE_MIN_DISTANCE_M ||
        elapsed >= REVERSE_MIN_INTERVAL_MS;
    }
    if (!shouldReverse) return;

    reverseInFlight = true;
    LOG("reverse:start", { lat, lng });
    const reversed = await reverseWithTimeout(lat, lng);
    reverseInFlight = false;
    if (stopped) return;

    const place = placeFromCoords(lat, lng, reversed);
    lastReverse = { lat, lng, at: Date.now(), place };
    LOG("reverse:done", {
      title: place.title,
      address: place.address?.slice(0, 80),
      usedNominatim: Boolean(reversed),
    });
    handlers.onUpdate(place);
  };

  // 1) Start the watch FIRST — never block on reverse-geocode.
  let sub: Location.LocationSubscription;
  try {
    sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: WATCH_TIME_MS,
        distanceInterval: WATCH_DISTANCE_M,
        mayShowUserSettingsDialog: true,
      },
      (loc) => {
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        LOG("watchPositionAsync:tick", {
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          accuracy: loc.coords.accuracy,
        });
        emitCoords(lat, lng, "state:coords");
        void maybeReverse(lat, lng, false);
      }
    );
    LOG("watchPositionAsync:subscribed");
  } catch (e) {
    LOG("watchPositionAsync:failed", e);
    return {
      error:
        "Couldn’t start live location. Search for your pickup location instead.",
    };
  }

  // 2) One-shot seed (non-blocking for the subscription above).
  void (async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (stopped) return;
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      LOG("getCurrentPositionAsync", {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      });
      emitCoords(lat, lng, "state:seed");
      await maybeReverse(lat, lng, true);
    } catch (e) {
      LOG("getCurrentPositionAsync:failed", e);
      if (!stopped) {
        handlers.onError?.(
          "Couldn’t read your GPS. Search for your pickup location instead."
        );
      }
    }
  })();

  return {
    stop: () => {
      LOG("watch:stop");
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
