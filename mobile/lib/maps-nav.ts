import { Linking, Platform } from "react-native";

/** Open Google Maps / Apple Maps directions to a point. */
export function openMapsDirections(opts: {
  lat: number;
  lng: number;
  label?: string;
}) {
  const { lat, lng, label } = opts;
  const q = encodeURIComponent(label || `${lat},${lng}`);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${lat},${lng}&q=${q}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`;
  return Linking.openURL(url);
}

/** Prefer Waze if installed, else Google Maps. */
export async function openNavigationChooser(opts: {
  lat: number;
  lng: number;
  label?: string;
}) {
  const { lat, lng, label } = opts;
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  try {
    const can = await Linking.canOpenURL(waze);
    if (can) {
      await Linking.openURL(waze);
      return;
    }
  } catch {
    // fall through
  }
  await openMapsDirections({ lat, lng, label });
}

export function openWhatsApp(phone: string, message?: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return Linking.openURL(`https://wa.me/${digits.replace(/^\+/, "")}${text}`);
}
