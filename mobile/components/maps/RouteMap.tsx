import { OsmRasterMap } from "@/components/maps/OsmRasterMap";
import { colors, radii, shadows } from "@/constants/theme";
import type { LatLng } from "@/lib/routing";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type MapPoint = {
  lat: number;
  lng: number;
  label?: string;
  color?: "primary" | "secondary";
};

type Props = {
  center: { lat: number; lng: number };
  pickup?: MapPoint;
  dropoff?: MapPoint;
  /** Assigned driver's live GPS — real coords only, never invent. */
  driver?: MapPoint;
  /** Road geometry from OSRM (or straight line). Drawn on the street map image. */
  routeCoords?: LatLng[];
  hubs?: MapPoint[];
  height?: number;
  fullBleed?: boolean;
  delta?: number;
  interactive?: boolean;
  live?: boolean;
  showsUserLocation?: boolean;
  onRecenter?: () => void;
  style?: StyleProp<ViewStyle>;
};

function zoomFromDelta(delta?: number) {
  const d = delta ?? 0.08;
  if (d <= 0.02) return 15;
  if (d <= 0.05) return 14;
  if (d <= 0.1) return 13;
  return 12;
}

function fitDelta(
  pickup?: MapPoint,
  dropoff?: MapPoint,
  driver?: MapPoint,
  route?: LatLng[]
): number {
  const pts = [
    ...(route ?? []),
    ...(pickup ? [pickup] : []),
    ...(dropoff ? [dropoff] : []),
    ...(driver ? [driver] : []),
  ];
  if (pts.length < 2) return 0.06;
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const dLat = Math.max(...lats) - Math.min(...lats);
  const dLng = Math.max(...lngs) - Math.min(...lngs);
  return Math.max(0.025, Math.max(dLat, dLng) * 1.55);
}

/**
 * Street map via OSM/Carto raster tiles + markers.
 * Expo Go safe. (staticmap.openstreetmap.de was discontinued — NXDOMAIN.)
 */
export function RouteMap({
  center,
  pickup,
  dropoff,
  driver,
  routeCoords,
  height = 220,
  fullBleed = false,
  delta,
  live,
  onRecenter,
  style,
}: Props) {
  const autoDelta = useMemo(
    () => delta ?? fitDelta(pickup, dropoff, driver, routeCoords),
    [
      delta,
      pickup?.lat,
      pickup?.lng,
      dropoff?.lat,
      dropoff?.lng,
      driver?.lat,
      driver?.lng,
      routeCoords,
    ]
  );
  const [zoomBoost, setZoomBoost] = useState(0);

  const mapCenter = useMemo(() => {
    if (pickup && dropoff) {
      return {
        lat: (pickup.lat + dropoff.lat) / 2,
        lng: (pickup.lng + dropoff.lng) / 2,
      };
    }
    if (driver) return { lat: driver.lat, lng: driver.lng };
    if (pickup) return { lat: pickup.lat, lng: pickup.lng };
    return center;
  }, [
    center.lat,
    center.lng,
    pickup?.lat,
    pickup?.lng,
    dropoff?.lat,
    dropoff?.lng,
    driver?.lat,
    driver?.lng,
  ]);

  const baseZoom = zoomFromDelta(autoDelta);
  const zoom = Math.min(16, Math.max(11, baseZoom + zoomBoost));

  const markers = useMemo(() => {
    const list: { lat: number; lng: number; color: string }[] = [];
    if (pickup) {
      list.push({ lat: pickup.lat, lng: pickup.lng, color: "#16A34A" });
    }
    if (dropoff) {
      list.push({ lat: dropoff.lat, lng: dropoff.lng, color: "#F59E0B" });
    }
    if (driver) {
      list.push({ lat: driver.lat, lng: driver.lng, color: "#1D61E7" });
    }
    if (!pickup && !dropoff && !driver) {
      list.push({ lat: center.lat, lng: center.lng, color: "#4B84F0" });
    }
    return list;
  }, [
    center.lat,
    center.lng,
    pickup?.lat,
    pickup?.lng,
    dropoff?.lat,
    dropoff?.lng,
    driver?.lat,
    driver?.lng,
  ]);

  return (
    <View
      style={[
        fullBleed ? styles.full : styles.shell,
        !fullBleed ? { height } : null,
        style,
      ]}
      collapsable={false}
    >
      <OsmRasterMap
        center={mapCenter}
        zoom={zoom}
        height={fullBleed ? height : height}
        markers={markers}
        style={fullBleed ? styles.fullRaster : undefined}
      />
      <View style={styles.badge} pointerEvents="none">
        <View style={styles.dot} />
        <Text style={styles.badgeText}>
          {live && driver
            ? "Live driver"
            : routeCoords && routeCoords.length > 2
              ? "Route map"
              : "Street map"}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={styles.ctrlBtn}
          onPress={() => setZoomBoost((z) => Math.min(3, z + 1))}
          accessibilityLabel="Zoom in"
        >
          <Ionicons name="add" size={20} color={colors.dark} />
        </Pressable>
        <Pressable
          style={styles.ctrlBtn}
          onPress={() => setZoomBoost((z) => Math.max(-2, z - 1))}
          accessibilityLabel="Zoom out"
        >
          <Ionicons name="remove" size={20} color={colors.dark} />
        </Pressable>
        {onRecenter ? (
          <Pressable
            style={styles.ctrlBtn}
            onPress={onRecenter}
            accessibilityLabel="Recenter map"
          >
            <Ionicons name="locate" size={18} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  full: {
    flex: 1,
    width: "100%",
    minHeight: 220,
    overflow: "hidden",
    backgroundColor: "#dbe7e0",
  },
  fullRaster: {
    ...StyleSheet.absoluteFillObject,
    height: undefined as unknown as number,
  },
  badge: {
    position: "absolute",
    left: 12,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.dark,
  },
  controls: {
    position: "absolute",
    right: 12,
    bottom: 16,
    gap: 8,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
});
