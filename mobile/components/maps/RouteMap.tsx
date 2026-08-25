import { colors, radii } from "@/constants/theme";
import { Platform, StyleSheet, Text, View } from "react-native";

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
  /** Fill the parent map pane (flex layout) — does not cover the tab bar. */
  fullBleed?: boolean;
  delta?: number;
  /** When false, map ignores gestures (fixes Android tab-bar touch theft). */
  interactive?: boolean;
};

export function RouteMap({
  center,
  pickup,
  dropoff,
  hubs = [],
  height = 220,
  fullBleed = false,
  delta = 0.08,
  interactive = true,
}: Props) {
  if (Platform.OS === "web") {
    return (
      <MapFallback
        height={fullBleed ? undefined : height}
        fullBleed={fullBleed}
        pickup={pickup}
        dropoff={dropoff}
        hubs={hubs}
      />
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Maps = require("react-native-maps");
    const MapView = Maps.default;
    const Marker = Maps.Marker;
    const Polyline = Maps.Polyline;
    const coords = [pickup, dropoff].filter(Boolean) as MapPoint[];

    return (
      <View
        style={[
          fullBleed ? styles.full : styles.shell,
          !fullBleed ? { height } : null,
        ]}
        pointerEvents={interactive ? "auto" : "none"}
        collapsable={false}
      >
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: delta,
            longitudeDelta: delta,
          }}
          showsUserLocation={interactive}
          showsMyLocationButton={false}
          scrollEnabled={interactive}
          zoomEnabled={interactive}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          liteMode={Platform.OS === "android" && !interactive}
        >
          {hubs.map((hub, index) => (
            <Marker
              key={`hub-${index}-${hub.lat}`}
              coordinate={{ latitude: hub.lat, longitude: hub.lng }}
              title={hub.label}
              pinColor={colors.primaryGlow}
              opacity={0.9}
            />
          ))}
          {pickup ? (
            <Marker
              coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
              title={pickup.label ?? "Pickup"}
              pinColor={colors.primary}
            />
          ) : null}
          {dropoff ? (
            <Marker
              coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
              title={dropoff.label ?? "Drop-off"}
              pinColor={colors.secondary}
            />
          ) : null}
          {coords.length === 2 ? (
            <Polyline
              coordinates={coords.map((p) => ({
                latitude: p.lat,
                longitude: p.lng,
              }))}
              strokeColor={colors.primary}
              strokeWidth={4}
            />
          ) : null}
        </MapView>
      </View>
    );
  } catch {
    return (
      <MapFallback
        height={fullBleed ? undefined : height}
        fullBleed={fullBleed}
        pickup={pickup}
        dropoff={dropoff}
        hubs={hubs}
      />
    );
  }
}

function MapFallback({
  height,
  fullBleed,
  pickup,
  dropoff,
  hubs = [],
}: {
  height?: number;
  fullBleed?: boolean;
  pickup?: MapPoint;
  dropoff?: MapPoint;
  hubs?: MapPoint[];
}) {
  return (
    <View
      style={[
        styles.fallback,
        fullBleed ? styles.fullFallback : null,
        height ? { height } : null,
      ]}
    >
      <View style={styles.grid} />
      <Text style={styles.fallbackTitle}>Live coverage map</Text>
      <Text style={styles.hubCount}>{hubs.length} hubs nearby</Text>
      {pickup ? (
        <Text style={styles.pinGreen}>● Pickup · {pickup.label ?? "Origin"}</Text>
      ) : null}
      {dropoff ? (
        <Text style={styles.pinGold}>
          ● Drop-off · {dropoff.label ?? "Destination"}
        </Text>
      ) : null}
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
  // Fill parent map pane only — never position against the window/tab bar.
  full: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fallback: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#e8f5ee",
    padding: 18,
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
    backgroundColor: "#d1fae5",
  },
  fallbackTitle: { fontWeight: "800", color: colors.dark, fontSize: 15 },
  hubCount: { color: colors.primaryDark, fontWeight: "700", fontSize: 12 },
  pinGreen: { color: colors.primaryDark, fontWeight: "700", fontSize: 13 },
  pinGold: { color: colors.secondaryDark, fontWeight: "700", fontSize: 13 },
});
