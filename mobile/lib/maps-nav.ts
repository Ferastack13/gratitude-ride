import { Linking, Platform } from "react-native";

/**
 * Normalize NG mobile numbers for dialing / WhatsApp.
 * Examples: 09161346887 → 2349161346887, +2349161346887 → 2349161346887
 */
export function normalizeNgPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0") && digits.length >= 10) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

/** Open Google Maps / Apple Maps turn-by-turn to a lat/lng stop. */
export function openMapsDirections(opts: {
  lat: number;
  lng: number;
  label?: string;
}) {
  const { lat, lng, label } = opts;
  const q = encodeURIComponent(label || `${lat},${lng}`);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&q=${q}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  return Linking.openURL(url);
}

/**
 * Opens turn-by-turn navigation outside the app:
 * - Waze if installed
 * - else Google Maps (Android) / Apple Maps (iOS)
 * Destination = pickup or drop-off coordinates from the trip.
 */
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
      return "waze";
    }
  } catch {
    // fall through
  }
  await openMapsDirections({ lat, lng, label });
  return Platform.OS === "ios" ? "apple-maps" : "google-maps";
}

export function openPhoneCall(phone: string) {
  const e164 = normalizeNgPhone(phone);
  return Linking.openURL(`tel:+${e164}`);
}

export function openSms(phone: string, body?: string) {
  const e164 = normalizeNgPhone(phone);
  const text = body ? `?body=${encodeURIComponent(body)}` : "";
  return Linking.openURL(`sms:+${e164}${text}`);
}

export function openWhatsApp(phone: string, message?: string) {
  const e164 = normalizeNgPhone(phone);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return Linking.openURL(`https://wa.me/${e164}${text}`);
}
