export type LivePlace = {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  lat: number;
  lng: number;
  state?: string;
  city?: string;
};

type NominatimItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
  };
};

const USER_AGENT = "GratitudeRide/1.0 (mobile delivery; contact@gratituderide.app)";

function titleFrom(item: NominatimItem) {
  const a = item.address;
  return (
    item.name ||
    a?.road ||
    a?.neighbourhood ||
    a?.suburb ||
    a?.city ||
    a?.town ||
    a?.village ||
    item.display_name.split(",")[0]?.trim() ||
    "Location"
  );
}

function subtitleFrom(item: NominatimItem) {
  const a = item.address;
  const parts = [
    a?.suburb || a?.neighbourhood,
    a?.city || a?.town || a?.village,
    a?.state,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : item.display_name;
}

function toPlace(item: NominatimItem): LivePlace {
  const a = item.address;
  return {
    id: String(item.place_id),
    title: titleFrom(item),
    subtitle: subtitleFrom(item),
    address: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
    state: a?.state,
    city: a?.city || a?.town || a?.village || a?.suburb,
  };
}

/** Live search any street / area / landmark in Nigeria */
export async function searchLivePlaces(query: string): Promise<LivePlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "10",
      countrycodes: "ng",
      q,
    }).toString();

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) throw new Error("Place search failed");
  const data = (await res.json()) as NominatimItem[];
  return data.map(toPlace);
}

/** Reverse geocode live GPS into a readable place */
export async function reverseLivePlace(
  lat: number,
  lng: number
): Promise<LivePlace | null> {
  const url =
    "https://nominatim.openstreetmap.org/reverse?" +
    new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      lat: String(lat),
      lon: String(lng),
      zoom: "18",
    }).toString();

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimItem & { error?: string };
  if (data.error || !data.lat) return null;
  return toPlace({
    ...data,
    place_id: data.place_id ?? Date.now(),
    lat: data.lat || String(lat),
    lon: data.lon || String(lng),
    display_name: data.display_name || "Current location",
  });
}
