import { NIGERIA_STATES } from "@/lib/nigeria-locations";

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

function googleKey() {
  return (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
}

function searchNigeriaGazetteer(query: string): LivePlace[] {
  const n = query.trim().toLowerCase();
  if (n.length < 2) return [];
  const out: LivePlace[] = [];
  const seen = new Set<string>();
  const push = (place: LivePlace) => {
    if (seen.has(place.id)) return;
    seen.add(place.id);
    out.push(place);
  };

  for (const s of NIGERIA_STATES) {
    const stateHit =
      s.label.toLowerCase().includes(n) ||
      s.capital.toLowerCase().includes(n) ||
      s.id.includes(n);

    if (stateHit) {
      push({
        id: `ng-state-${s.id}`,
        title: s.capital,
        subtitle: `${s.label} State · Nigeria`,
        address: `${s.capital}, ${s.label}, Nigeria`,
        lat: s.center.lat,
        lng: s.center.lng,
        state: s.label,
        city: s.capital,
      });
    }

    for (const a of s.areas) {
      if (stateHit || a.label.toLowerCase().includes(n)) {
        const pin = a.streets[0];
        push({
          id: `ng-city-${a.id}`,
          title: a.label,
          subtitle: `${s.label} State · Nigeria`,
          address: `${a.label}, ${s.label}, Nigeria`,
          lat: pin?.lat ?? s.center.lat,
          lng: pin?.lng ?? s.center.lng,
          state: s.label,
          city: a.label,
        });
      }
      for (const st of a.streets) {
        if (
          st.label.toLowerCase().includes(n) ||
          a.label.toLowerCase().includes(n)
        ) {
          push({
            id: `ng-st-${st.id}`,
            title: st.label,
            subtitle: `${a.label}, ${s.label}`,
            address: st.address,
            lat: st.lat,
            lng: st.lng,
            state: s.label,
            city: a.label,
          });
        }
      }
    }
  }
  return out.slice(0, 10);
}

const NIGERIA_BBOX = "2.67,4.27,14.68,13.89";

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
    type?: string;
  };
};

function nigeriaQuery(query: string) {
  const q = query.trim();
  return /nigeria/i.test(q) ? q : `${q}, Nigeria`;
}

async function searchPhoton(
  query: string,
  near?: { lat: number; lng: number } | null
): Promise<LivePlace[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "12",
    lang: "en",
    bbox: NIGERIA_BBOX,
  });
  if (near && Number.isFinite(near.lat) && Number.isFinite(near.lng)) {
    params.set("lat", String(near.lat));
    params.set("lon", String(near.lng));
  }

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const out: LivePlace[] = [];

  for (const f of data.features ?? []) {
    const p = f.properties ?? {};
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    if (p.countrycode && p.countrycode.toUpperCase() !== "NG") continue;

    const street = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
    const city = p.city || p.locality || p.district || p.county;
    const title = street || p.name || city || "Location";
    const subtitle = [p.district, city, p.state].filter(Boolean).join(", ") || "Nigeria";
    out.push({
      id: `ph-${p.osm_type ?? "n"}-${p.osm_id ?? `${coords[1]}-${coords[0]}`}`,
      title,
      subtitle,
      address: [title, subtitle, "Nigeria"].filter(Boolean).join(", "),
      lat: coords[1],
      lng: coords[0],
      city,
      state: p.state,
    });
  }
  return out;
}

async function searchNominatim(query: string): Promise<LivePlace[]> {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "12",
      countrycodes: "ng",
      q: nigeriaQuery(query),
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

type GooglePrediction = { place_id: string; description: string; structured_formatting?: { main_text?: string; secondary_text?: string } };

async function searchGooglePlaces(query: string): Promise<LivePlace[]> {
  const key = googleKey();
  if (!key) return [];

  const autoUrl =
    "https://maps.googleapis.com/maps/api/place/autocomplete/json?" +
    new URLSearchParams({
      input: query,
      components: "country:ng",
      language: "en",
      key,
    }).toString();
  const autoRes = await fetch(autoUrl);
  if (!autoRes.ok) return [];
  const autoJson = (await autoRes.json()) as {
    status?: string;
    predictions?: GooglePrediction[];
  };
  const predictions = autoJson.predictions?.slice(0, 6) ?? [];
  if (!predictions.length) return [];

  const details = await Promise.all(
    predictions.map(async (p) => {
      const dUrl =
        "https://maps.googleapis.com/maps/api/place/details/json?" +
        new URLSearchParams({
          place_id: p.place_id,
          fields: "geometry,name,formatted_address,address_component",
          key,
        }).toString();
      const dRes = await fetch(dUrl);
      if (!dRes.ok) return null;
      const dJson = (await dRes.json()) as {
        result?: {
          name?: string;
          formatted_address?: string;
          geometry?: { location?: { lat: number; lng: number } };
          address_components?: { long_name: string; types: string[] }[];
        };
      };
      const r = dJson.result;
      const loc = r?.geometry?.location;
      if (!loc) return null;
      const comps = r.address_components ?? [];
      const city =
        comps.find((c) => c.types.includes("locality"))?.long_name ||
        comps.find((c) => c.types.includes("administrative_area_level_2"))
          ?.long_name;
      const state = comps.find((c) =>
        c.types.includes("administrative_area_level_1")
      )?.long_name;
      return {
        id: `g-${p.place_id}`,
        title: r?.name || p.structured_formatting?.main_text || p.description,
        subtitle:
          p.structured_formatting?.secondary_text ||
          [city, state].filter(Boolean).join(", ") ||
          "Nigeria",
        address: r?.formatted_address || p.description,
        lat: loc.lat,
        lng: loc.lng,
        city,
        state,
      } satisfies LivePlace;
    })
  );

  return details.filter((x): x is LivePlace => Boolean(x));
}

function dedupePlaces(list: LivePlace[]): LivePlace[] {
  const seen = new Set<string>();
  const out: LivePlace[] = [];
  for (const p of list) {
    const key = `${p.title.toLowerCase()}|${p.lat.toFixed(3)}|${p.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/** Live search any state, city, town, street or landmark in Nigeria */
export async function searchLivePlaces(
  query: string,
  near?: { lat: number; lng: number } | null
): Promise<LivePlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const local = searchNigeriaGazetteer(q);
  const [streets, google, osm] = await Promise.all([
    searchPhoton(q, near).catch(() => [] as LivePlace[]),
    searchGooglePlaces(q).catch(() => [] as LivePlace[]),
    searchNominatim(q).catch(() => [] as LivePlace[]),
  ]);
  return dedupePlaces([...streets, ...google, ...local, ...osm]).slice(0, 16);
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
