import type { LivePlace } from "@/lib/places";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "gr.driver.working.area";

/** Popular hubs so drivers can set a map area without GPS. */
export const DRIVER_AREA_SHORTCUTS: LivePlace[] = [
  {
    id: "hub-lagos-ikeja",
    title: "Ikeja",
    subtitle: "Lagos",
    address: "Ikeja, Lagos, Nigeria",
    lat: 6.6018,
    lng: 3.3515,
    city: "Ikeja",
    state: "Lagos",
  },
  {
    id: "hub-lagos-vi",
    title: "Victoria Island",
    subtitle: "Lagos",
    address: "Victoria Island, Lagos, Nigeria",
    lat: 6.4281,
    lng: 3.4219,
    city: "Victoria Island",
    state: "Lagos",
  },
  {
    id: "hub-lagos-lekki",
    title: "Lekki",
    subtitle: "Lagos",
    address: "Lekki, Lagos, Nigeria",
    lat: 6.4474,
    lng: 3.5309,
    city: "Lekki",
    state: "Lagos",
  },
  {
    id: "hub-abuja-cbd",
    title: "Central Area",
    subtitle: "Abuja",
    address: "Central Business District, Abuja, Nigeria",
    lat: 9.0579,
    lng: 7.4951,
    city: "Abuja",
    state: "FCT",
  },
  {
    id: "hub-ph-town",
    title: "Port Harcourt",
    subtitle: "Rivers",
    address: "Port Harcourt, Rivers, Nigeria",
    lat: 4.8156,
    lng: 7.0498,
    city: "Port Harcourt",
    state: "Rivers",
  },
  {
    id: "hub-ibadan",
    title: "Ibadan",
    subtitle: "Oyo",
    address: "Ibadan, Oyo, Nigeria",
    lat: 7.3775,
    lng: 3.947,
    city: "Ibadan",
    state: "Oyo",
  },
];

export async function getDriverWorkingArea(): Promise<LivePlace | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const place = JSON.parse(raw) as LivePlace;
    if (
      !place ||
      !Number.isFinite(place.lat) ||
      !Number.isFinite(place.lng)
    ) {
      return null;
    }
    return place;
  } catch {
    return null;
  }
}

export async function setDriverWorkingArea(place: LivePlace): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(place));
}

export async function clearDriverWorkingArea(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
