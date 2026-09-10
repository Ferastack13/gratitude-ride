import { distanceKm } from "@/lib/geo";

export type LatLng = { lat: number; lng: number };

export type RouteResult = {
  coords: LatLng[];
  /** Road distance when OSRM succeeds; otherwise haversine. */
  distanceKm: number;
  /** Drive duration in minutes. */
  durationMin: number;
  /** Where the numbers came from — UI can label placeholders honestly. */
  source: "osrm" | "estimate";
};

/**
 * Road route via public OSRM. Falls back to straight-line estimate if offline.
 * This is client-side routing for UX — not a billed backend pricing API.
 */
export async function fetchDrivingRoute(
  from: LatLng,
  to: LatLng
): Promise<RouteResult> {
  const straight = distanceKm(from, to);
  const estimate: RouteResult = {
    coords: [from, to],
    distanceKm: straight,
    durationMin: Math.max(8, Math.round(straight * 2.8 + 5)),
    source: "estimate",
  };

  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return estimate;

    const data = (await res.json()) as {
      code?: string;
      routes?: {
        distance: number;
        duration: number;
        geometry?: { coordinates?: [number, number][] };
      }[];
    };

    const route = data.routes?.[0];
    if (!route || data.code !== "Ok") return estimate;

    const raw = route.geometry?.coordinates ?? [];
    const coords: LatLng[] =
      raw.length >= 2
        ? raw.map(([lng, lat]) => ({ lat, lng }))
        : [from, to];

    return {
      coords: simplifyCoords(coords, 80),
      distanceKm: Math.max(0.2, route.distance / 1000),
      durationMin: Math.max(3, Math.round(route.duration / 60)),
      source: "osrm",
    };
  } catch {
    return estimate;
  }
}

/** Keep URL/static-map path length under control. */
function simplifyCoords(coords: LatLng[], maxPoints: number): LatLng[] {
  if (coords.length <= maxPoints) return coords;
  const step = (coords.length - 1) / (maxPoints - 1);
  const out: LatLng[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(coords[Math.round(i * step)]!);
  }
  return out;
}
