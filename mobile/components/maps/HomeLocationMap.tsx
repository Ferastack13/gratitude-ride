import { OsmRasterMap } from "@/components/maps/OsmRasterMap";
import { colors, radii, shadows } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Coords = { lat: number; lng: number };

type Props = {
  coords: Coords | null;
  loading?: boolean;
  errorMessage?: string | null;
  onRequestLocation?: () => void;
  height?: number;
  width?: number;
  /** Flush edges for map-first Home (presentation only). */
  flush?: boolean;
  /** Move zoom/recenter to top-right so a bottom sheet does not cover them. */
  controlsTop?: boolean;
};

const NIGERIA: Coords = { lat: 9.082, lng: 8.6753 };
const STREET_ZOOM = 16;
const COUNTRY_ZOOM = 6;

/**
 * Home live map — Carto/OSM street tiles (Expo Go safe).
 * Android MapView needs a Google Maps key we do not ship, which left this
 * area blank. Tiles always fill the stage, GPS still drives the puck.
 */
export function HomeLocationMap({
  coords,
  loading,
  errorMessage,
  onRequestLocation,
  height = 200,
  width,
  flush = false,
  controlsTop = false,
}: Props) {
  const { width: winW } = useWindowDimensions();
  const mapW = width && width > 0 ? width : winW;
  const [zoomBoost, setZoomBoost] = useState(0);
  const didStreetZoom = useRef(false);

  const center = coords ?? NIGERIA;
  const baseZoom = coords ? STREET_ZOOM : COUNTRY_ZOOM;
  const zoom = Math.min(18, Math.max(5, baseZoom + zoomBoost));

  useEffect(() => {
    if (coords && !didStreetZoom.current) {
      didStreetZoom.current = true;
      setZoomBoost(0);
    }
    if (!coords) didStreetZoom.current = false;
  }, [coords]);

  const recenter = useCallback(() => {
    setZoomBoost(0);
    onRequestLocation?.();
  }, [onRequestLocation]);

  return (
    <View
      style={[
        styles.shell,
        flush && styles.shellFlush,
        { height, width: mapW },
      ]}
      collapsable={false}
    >
      <OsmRasterMap
        center={center}
        zoom={zoom}
        height={height}
        width={mapW}
        markers={
          coords
            ? [{ lat: coords.lat, lng: coords.lng, color: "#1a73e8" }]
            : []
        }
      />

      {coords ? (
        <View
          style={[styles.badge, flush && styles.badgeFlush]}
          pointerEvents="none"
        >
          <View style={styles.dot} />
          <Text style={styles.badgeText}>You are here · live</Text>
        </View>
      ) : (
        <View style={styles.banner} pointerEvents="box-none">
          <View style={styles.card}>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <Text style={styles.stateTitle}>
              {loading ? "Finding your location…" : "Turn on location"}
            </Text>
            <Text style={styles.stateSub}>
              {errorMessage ??
                "Allow location so we can center the map on you."}
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
      )}

      <View style={[styles.controls, controlsTop && styles.controlsTop]}>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setZoomBoost((z) => Math.min(2, z + 1))}
          accessibilityLabel="Zoom in"
          hitSlop={8}
        >
          <Ionicons name="add" size={20} color={colors.dark} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setZoomBoost((z) => Math.max(-4, z - 1))}
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
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 28,
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
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
