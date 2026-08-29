import {
  allStreetsInState,
  getStateByLabel,
} from "@/lib/nigeria-locations";

export { distanceKm, estimateDeliveryFee } from "@/lib/geo";

export type ServiceCity = string;

export type CityPoint = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
};

export type CityConfig = {
  id: string;
  label: string;
  center: { lat: number; lng: number };
  zoom: number;
  hubs: CityPoint[];
};

/** Legacy shortcuts — full nationwide list lives in nigeria-locations. */
export const SERVICE_CITIES: CityConfig[] = [
  "Lagos",
  "FCT (Abuja)",
  "Rivers",
].map((label) => {
  const state = getStateByLabel(label);
  return {
    id: state.label,
    label: state.label,
    center: state.center,
    zoom: 11,
    hubs: allStreetsInState(state),
  };
});

export function getCityConfig(city: string): CityConfig {
  const state = getStateByLabel(city);
  return {
    id: state.label,
    label: state.label,
    center: state.center,
    zoom: 11,
    hubs: allStreetsInState(state),
  };
}
