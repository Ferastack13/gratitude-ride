import * as Location from "expo-location";
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

/** Request permission and resolve the device GPS into a readable place. Never invents a city. */
export async function resolveCurrentLocation(): Promise<DeviceLocationResult> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    let status = current.status;

    if (status === "undetermined") {
      const asked = await Location.requestForegroundPermissionsAsync();
      status = asked.status;
    }

    if (status !== "granted") {
      return {
        ok: false,
        permission: status === "denied" ? "denied" : "undetermined",
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
    const place: LivePlace = reversed ?? {
      id: `gps-${coords.lat.toFixed(5)}-${coords.lng.toFixed(5)}`,
      title: "Current location",
      subtitle: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
      address: "Current location",
      lat: coords.lat,
      lng: coords.lng,
    };

    if (!reversed) {
      place.title = "Current location";
    } else if (
      !place.title.toLowerCase().includes("current") &&
      place.title.length > 0
    ) {
      // Keep resolved street name; UI can still label the row as "Current location"
    }

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
