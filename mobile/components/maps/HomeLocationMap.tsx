import { colors, radii, shadows } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";

type Coords = { lat: number; lng: number };

type Props = {
  coords: Coords | null;
  loading?: boolean;
  errorMessage?: string | null;
  onRequestLocation?: () => void;
  height?: number;
  /** Flush edges for map-first Home (presentation only). */
  flush?: boolean;
  /** Move zoom/recenter to top-right so a bottom sheet does not cover them. */
  controlsTop?: boolean;
};

const NIGERIA: Region = {
  latitude: 9.082,
  longitude: 8.6753,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

const STREET_DELTA = 0.006;

function regionFrom(coords: Coords, delta: number): Region {
  return {
    latitude: coords.lat,
    longitude: coords.lng,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

/**
 * Home live map — native MapView (Google on Android, Apple on iOS)
 * plus the device blue “you are here” puck. GPS does not need a Google key.
 */
export function HomeLocationMap({
  coords,
  loading,
  errorMessage,
  onRequestLocation,
  height = 200,
  flush = false,
  controlsTop = false,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const didCenter = useRef(false);
  const [delta, setDelta] = useState(STREET_DELTA);

  useEffect(() => {
    if (!coords) {
      didCenter.current = false;
      return;
    }
    const region = regionFrom(coords, delta);
    if (!didCenter.current) {
      didCenter.current = true;
      mapRef.current?.animateToRegion(region, 500);
      return;
    }
  }, [coords?.lat, coords?.lng, delta]);

  const recenter = useCallback(() => {
    if (coords) {
      mapRef.current?.animateToRegion(regionFrom(coords, delta), 400);
    }
    onRequestLocation?.();
  }, [coords, delta, onRequestLocation]);

  const zoomBy = (factor: number) => {
    setDelta((d) => {
      const next = Math.min(0.2, Math.max(0.0015, d * factor));
      if (coords) {
        mapRef.current?.animateToRegion(regionFrom(coords, next), 200);
      }
      return next;
    });
  };

  const shellStyle = [
    styles.shell,
    flush && styles.shellFlush,
    { height },
    Platform.OS === "android" && styles.shellAndroid,
  ];

  return (
    <View style={shellStyle} collapsable={false}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={coords ? regionFrom(coords, STREET_DELTA) : NIGERIA}
        showsUserLocation={Boolean(coords)}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        loadingEnabled
        loadingIndicatorColor={colors.primary}
        mapType="standard"
      />

      {!coords ? (
        <View style={styles.cover} pointerEvents="box-none">
          <View style={styles.card}>
            <Ionicons name="locate" size={22} color={colors.primary} />
            <Text style={styles.stateTitle}>
              {loading ? "Finding your location…" : "Turn on location"}
            </Text>
            <Text style={styles.stateSub}>
              {errorMessage ??
                "Allow location so we can put you on the map and set pickup."}
            </Text>
            {onRequestLocation ? (
              <Pressable
                style={({ pressed }) => [
                  styles.retry,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={onRequestLocation}
              >
                <Text style={styles.retryText}>Turn on location</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <View
          style={[styles.badge, flush && styles.badgeFlush]}
          pointerEvents="none"
        >
          <View style={styles.dot} />
          <Text style={styles.badgeText}>You are here · live</Text>
        </View>
      )}

      <View style={[styles.controls, controlsTop && styles.controlsTop]}>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={() => zoomBy(0.5)}
          accessibilityLabel="Zoom in"
          hitSlop={8}
        >
          <Ionicons name="add" size={20} color={colors.dark} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={() => zoomBy(2)}
          accessibilityLabel="Zoom out"
          hitSlop={8}
        >
          <Ionicons name="remove" size={20} color={colors.dark} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={recenter}
          accessibilityLabel="Recenter on current location"
          hitSlop={8}
        >
          <Ionicons name="locate" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: "#dbe4ea",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  shellFlush: {
    borderRadius: 0,
    borderWidth: 0,
  },
  shellAndroid: {
    overflow: "visible",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247,244,237,0.55)",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
    maxWidth: 320,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.dark,
    textAlign: "center",
  },
  stateSub: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  retry: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  badge: {
    position: "absolute",
    left: 12,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  badgeFlush: {
    bottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1a73e8",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.dark,
  },
  controls: {
    position: "absolute",
    right: 12,
    bottom: 14,
    gap: 8,
  },
  controlsTop: {
    top: 72,
    bottom: undefined,
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },
});
