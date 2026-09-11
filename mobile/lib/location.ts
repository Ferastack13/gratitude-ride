import * as Location from "expo-location";
import { distanceKm } from "@/lib/geo";
import { reverseLivePlace, type LivePlace } from "@/lib/places";
import { Platform } from "react-native";

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

const REVERSE_MIN_DISTANCE_M = 20;
const REVERSE_MIN_INTERVAL_MS = 8_000;
const REVERSE_TIMEOUT_MS = 6_000;
/** Polling fallback — Expo watch alone is unreliable on some Android phones. */
const POLL_INTERVAL_MS = 3_000;
const WATCH_TIME_MS = 1_500;
const WATCH_DISTANCE_M = 3;

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

async function readGps(label: string) {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
    mayShowUserSettingsDialog: true,
  });
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  LOG(label, {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    accuracy: pos.coords.accuracy,
    mocked: (pos as { mocked?: boolean }).mocked,
  });
  return { lat, lng, accuracy: pos.coords.accuracy ?? null };
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

    const coords = await readGps("resolveCurrentLocation");
    const reversed = await reverseWithTimeout(coords.lat, coords.lng);
    const place = placeFromCoords(coords.lat, coords.lng, reversed);

    return {
      ok: true,
      permission: "granted",
      coords: { lat: coords.lat, lng: coords.lng },
      place,
    };
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
  onUpdate: (place: LivePlace) => void;
  onError?: (message: string) => void;
};

/**
 * Live device GPS for Passenger Home.
 * Uses watchPositionAsync AND an interval poll — watch alone fails on many Android/Expo Go devices.
 */
export async function startDeviceLocationWatch(
  handlers: DeviceLocationWatchHandlers
): Promise<{ stop: () => void } | { error: string }> {
  LOG("watch:start", { platform: Platform.OS });
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

  if (Platform.OS === "android") {
    try {
      await Location.enableNetworkProviderAsync();
      LOG("watch:networkProvider:enabled");
    } catch (e) {
      LOG("watch:networkProvider:skip", e);
    }
  }

  let stopped = false;
  let reverseInFlight = false;
  let lastEmitted: { lat: number; lng: number } | null = null;
  let lastReverse: {
    lat: number;
    lng: number;
    at: number;
    place: LivePlace;
  } | null = null;

  const emitCoords = (lat: number, lng: number, label: string) => {
    if (stopped) return;

    // Ignore tiny GPS jitter spam (< 2m) but still allow first fix.
    if (lastEmitted) {
      const movedM = distanceKm(lastEmitted, { lat, lng }) * 1000;
      if (movedM < 2 && label.startsWith("poll")) {
        return;
      }
    }
    lastEmitted = { lat, lng };

    const place = placeFromCoords(lat, lng, null);
    if (lastReverse) {
      place.title = lastReverse.place.title;
      place.address = lastReverse.place.address;
      place.subtitle = lastReverse.place.subtitle;
      place.city = lastReverse.place.city;
      place.state = lastReverse.place.state;
    }

    LOG("emit", {
      label,
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
    LOG("reverse:start", {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    });
    const reversed = await reverseWithTimeout(lat, lng);
    reverseInFlight = false;
    if (stopped) return;

    const place = placeFromCoords(lat, lng, reversed);
    lastReverse = { lat, lng, at: Date.now(), place };
    LOG("reverse:done", {
      title: place.title,
      address: place.address?.slice(0, 90),
      usedNominatim: Boolean(reversed),
    });
    handlers.onUpdate(place);
  };

  const handleFix = (lat: number, lng: number, label: string) => {
    emitCoords(lat, lng, label);
    void maybeReverse(lat, lng, label === "seed");
  };

  // A) Native watch (best effort)
  let sub: Location.LocationSubscription | null = null;
  try {
    sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: WATCH_TIME_MS,
        distanceInterval: WATCH_DISTANCE_M,
        mayShowUserSettingsDialog: true,
      },
      (loc) => {
        handleFix(
          loc.coords.latitude,
          loc.coords.longitude,
          "watchPositionAsync"
        );
      }
    );
    LOG("watchPositionAsync:subscribed");
  } catch (e) {
    LOG("watchPositionAsync:failed — will rely on polling", e);
  }

  // B) Polling fallback (critical on Android / Expo Go)
  const poll = async (label: string) => {
    if (stopped) return;
    try {
      const gps = await readGps(label);
      handleFix(gps.lat, gps.lng, label);
    } catch (e) {
      LOG(`${label}:failed`, e);
      if (label === "seed") {
        handlers.onError?.(
          "Couldn’t read your GPS. Turn on precise location and try again."
        );
      }
    }
  };

  void poll("seed");
  const timer = setInterval(() => {
    void poll("poll");
  }, POLL_INTERVAL_MS);

  return {
    stop: () => {
      LOG("watch:stop");
      stopped = true;
      clearInterval(timer);
      sub?.remove();
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
