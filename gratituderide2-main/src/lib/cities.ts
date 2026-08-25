export type ServiceCity = "Lagos" | "Abuja" | "Port Harcourt";

export type CityPoint = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
};

export type CityConfig = {
  id: ServiceCity;
  label: ServiceCity;
  center: { lat: number; lng: number };
  zoom: number;
  hubs: CityPoint[];
};

export const SERVICE_CITIES: CityConfig[] = [
  {
    id: "Lagos",
    label: "Lagos",
    center: { lat: 6.5244, lng: 3.3792 },
    zoom: 11,
    hubs: [
      {
        id: "lagos-vi",
        label: "Victoria Island",
        address: "Adeola Odeku St, Victoria Island, Lagos",
        lat: 6.4281,
        lng: 3.4219,
      },
      {
        id: "lagos-lekki",
        label: "Lekki Phase 1",
        address: "Admiralty Way, Lekki Phase 1, Lagos",
        lat: 6.4474,
        lng: 3.4721,
      },
      {
        id: "lagos-ikeja",
        label: "Ikeja GRA",
        address: "Isaac John St, Ikeja GRA, Lagos",
        lat: 6.6018,
        lng: 3.3515,
      },
      {
        id: "lagos-yaba",
        label: "Yaba",
        address: "Herbert Macaulay Way, Yaba, Lagos",
        lat: 6.5095,
        lng: 3.3711,
      },
    ],
  },
  {
    id: "Abuja",
    label: "Abuja",
    center: { lat: 9.0765, lng: 7.3986 },
    zoom: 11,
    hubs: [
      {
        id: "abuja-maitama",
        label: "Maitama",
        address: "Aguiyi Ironsi St, Maitama, Abuja",
        lat: 9.0882,
        lng: 7.4922,
      },
      {
        id: "abuja-wuse",
        label: "Wuse 2",
        address: "Aminu Kano Cres, Wuse 2, Abuja",
        lat: 9.065,
        lng: 7.4648,
      },
      {
        id: "abuja-garki",
        label: "Garki",
        address: "Area 11, Garki, Abuja",
        lat: 9.035,
        lng: 7.485,
      },
      {
        id: "abuja-asokoro",
        label: "Asokoro",
        address: "Yakubu Gowon Cres, Asokoro, Abuja",
        lat: 9.0431,
        lng: 7.5142,
      },
    ],
  },
  {
    id: "Port Harcourt",
    label: "Port Harcourt",
    center: { lat: 4.8156, lng: 7.0498 },
    zoom: 12,
    hubs: [
      {
        id: "ph-gra",
        label: "PH GRA",
        address: "Tombia St, GRA Phase 2, Port Harcourt",
        lat: 4.829,
        lng: 7.013,
      },
      {
        id: "ph-trans",
        label: "Trans Amadi",
        address: "Trans Amadi Rd, Port Harcourt",
        lat: 4.8065,
        lng: 7.0338,
      },
      {
        id: "ph-rumuola",
        label: "Rumuola",
        address: "Rumuola Rd, Port Harcourt",
        lat: 4.8472,
        lng: 7.0126,
      },
      {
        id: "ph-old-gra",
        label: "Old GRA",
        address: "Force Ave, Old GRA, Port Harcourt",
        lat: 4.7875,
        lng: 7.0139,
      },
    ],
  },
];

export function getCityConfig(city: ServiceCity): CityConfig {
  return SERVICE_CITIES.find((c) => c.id === city) ?? SERVICE_CITIES[0];
}

export function estimateDeliveryFee(distanceKm: number) {
  const base = 1200;
  const perKm = 250;
  return Math.max(1500, Math.round(base + distanceKm * perKm));
}

/** Haversine distance in km */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
