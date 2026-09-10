import { colors, radii } from "@/constants/theme";
import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

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
  hubs?: MapPoint[];
  height?: number;
  fullBleed?: boolean;
  delta?: number;
  interactive?: boolean;
  live?: boolean;
  showsUserLocation?: boolean;
};

function zoomFromDelta(delta?: number) {
  const d = delta ?? 0.08;
  if (d <= 0.02) return 15;
  if (d <= 0.05) return 14;
  if (d <= 0.1) return 13;
  return 12;
}

/**
 * Live street map via OSM static tiles image.
 * Avoids react-native-maps (needs Google key) and WebView html
 * (crashes Expo Go on Android with JSBigFileString::fromPath).
 */
function buildMapUri(
  center: { lat: number; lng: number },
  markers: { lat: number; lng: number; color: string }[],
  zoom: number
) {
  const markerParams = markers
    .slice(0, 3)
    .map((m) => `${m.lat},${m.lng},${m.color}`)
    .join("|");
  return (
    "https://staticmap.openstreetmap.de/staticmap.php?" +
    `center=${center.lat},${center.lng}` +
    `&zoom=${zoom}` +
    `&size=720x1100` +
    `&maptype=mapnik` +
    (markerParams ? `&markers=${markerParams}` : "")
  );
}

export function RouteMap({
  center,
  pickup,
  dropoff,
  height = 220,
  fullBleed = false,
  delta = 0.08,
}: Props) {
  const mapCenter = useMemo(() => {
    if (pickup && dropoff) {
      return {
        lat: (pickup.lat + dropoff.lat) / 2,
        lng: (pickup.lng + dropoff.lng) / 2,
      };
    }
    return center;
  }, [center.lat, center.lng, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  const uri = useMemo(() => {
    const markers: { lat: number; lng: number; color: string }[] = [
      { lat: center.lat, lng: center.lng, color: "lightblue1" },
    ];
    if (pickup) {
      markers.push({ lat: pickup.lat, lng: pickup.lng, color: "green" });
    }
    if (dropoff) {
      markers.push({ lat: dropoff.lat, lng: dropoff.lng, color: "orange" });
    }
    return buildMapUri(mapCenter, markers, zoomFromDelta(delta));
  }, [
    mapCenter.lat,
    mapCenter.lng,
    center.lat,
    center.lng,
    pickup?.lat,
    pickup?.lng,
    dropoff?.lat,
    dropoff?.lng,
    delta,
  ]);

  return (
    <View
      style={[
        fullBleed ? styles.full : styles.shell,
        !fullBleed ? { height } : null,
      ]}
      collapsable={false}
    >
      <Image
        key={uri}
        source={{ uri }}
        style={styles.map}
        resizeMode="cover"
        accessibilityLabel="Live location map"
      />
      <View style={styles.badge} pointerEvents="none">
        <View style={styles.dot} />
        <Text style={styles.badgeText}>Live map</Text>
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
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#dbe7e0",
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
});
