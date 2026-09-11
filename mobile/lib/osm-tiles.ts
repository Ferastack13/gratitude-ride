/**
 * Web-mercator OSM/Carto raster tiles for Expo Go.
 * Replaces discontinued staticmap.openstreetmap.de.
 */

export const TILE_SIZE = 256;

/** Carto Voyager — OSM data, reliable HTTPS PNGs (no API key). */
export function tileUrl(z: number, x: number, y: number): string {
  const n = 2 ** z;
  const xx = ((x % n) + n) % n;
  const yy = Math.max(0, Math.min(n - 1, Math.floor(y)));
  const subdomain = ["a", "b", "c", "d"][Math.abs(xx + yy) % 4];
  return `https://${subdomain}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${xx}/${yy}.png`;
}

export function lngToWorldX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * 2 ** zoom * TILE_SIZE;
}

export function latToWorldY(lat: number, zoom: number): number {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sin = Math.sin((clamped * Math.PI) / 180);
  const y =
    (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 2 ** zoom;
  return y * TILE_SIZE;
}

export function worldToLatLng(x: number, y: number, zoom: number): {
  lat: number;
  lng: number;
} {
  const n = 2 ** zoom;
  const lng = (x / TILE_SIZE / n) * 360 - 180;
  const mercY = 0.5 - y / TILE_SIZE / n;
  const lat =
    (180 / Math.PI) * Math.atan(Math.sinh(2 * Math.PI * mercY));
  return { lat, lng };
}

export type TileSpec = {
  key: string;
  url: string;
  left: number;
  top: number;
};

/** Tiles covering a viewport centered on world pixel (cx, cy). */
export function tilesForViewport(
  zoom: number,
  centerWorldX: number,
  centerWorldY: number,
  width: number,
  height: number,
  pad = 1
): TileSpec[] {
  const left = centerWorldX - width / 2;
  const top = centerWorldY - height / 2;
  const minTX = Math.floor(left / TILE_SIZE) - pad;
  const maxTX = Math.floor((left + width) / TILE_SIZE) + pad;
  const minTY = Math.floor(top / TILE_SIZE) - pad;
  const maxTY = Math.floor((top + height) / TILE_SIZE) + pad;
  const out: TileSpec[] = [];
  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      out.push({
        key: `${zoom}/${tx}/${ty}`,
        url: tileUrl(zoom, tx, ty),
        left: tx * TILE_SIZE - left,
        top: ty * TILE_SIZE - top,
      });
    }
  }
  return out;
}
