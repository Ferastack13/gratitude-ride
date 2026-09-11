import { colors, radii, shadows } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Coords = { lat: number; lng: number };

type Props = {
  coords: Coords | null;
  loading?: boolean;
  errorMessage?: string | null;
  onRequestLocation?: () => void;
  height?: number;
};

const MIN_ZOOM = 12;
const MAX_ZOOM = 17;
const DEFAULT_ZOOM = 15;

function metersPerPixel(lat: number, zoom: number) {
  return (
    (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom)
  );
}

function buildUri(center: Coords, zoom: number) {
  return (
    "https://staticmap.openstreetmap.de/staticmap.php?" +
    `center=${center.lat},${center.lng}` +
    `&zoom=${zoom}` +
    `&size=720x480` +
    `&maptype=mapnik` +
    `&markers=${center.lat},${center.lng},blue`
  );
}

/**
 * Home “You are here” map — real GPS center, zoom +/−, pan, recenter.
 * Expo Go safe (OSM static tiles). Decorative cars must NOT use this component.
 */
export function HomeLocationMap({
  coords,
  loading,
  errorMessage,
  onRequestLocation,
  height = 200,
}: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [viewCenter, setViewCenter] = useState<Coords | null>(coords);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const baseRef = useRef<Coords | null>(coords);
  const viewRef = useRef<Coords | null>(coords);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const panStart = useRef<Coords | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (!coords) return;
    baseRef.current = coords;
    viewRef.current = coords;
    setViewCenter(coords);
    setDrag({ x: 0, y: 0 });
  }, [coords?.lat, coords?.lng]);

  const recenter = useCallback(() => {
    if (baseRef.current) {
      viewRef.current = baseRef.current;
      setViewCenter(baseRef.current);
      setDrag({ x: 0, y: 0 });
    }
    onRequestLocation?.();
  }, [onRequestLocation]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
        onPanResponderGrant: () => {
          panStart.current = viewRef.current;
          setDrag({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, g) => {
          setDrag({ x: g.dx, y: g.dy });
        },
        onPanResponderRelease: (_, g) => {
          const start = panStart.current;
          if (!start) {
            setDrag({ x: 0, y: 0 });
            return;
          }
          const mpp = metersPerPixel(start.lat, zoomRef.current);
          const dLat = (g.dy * mpp) / 111320;
          const dLng =
            (g.dx * mpp) /
            (111320 * Math.cos((start.lat * Math.PI) / 180) || 1);
          const next = {
            lat: start.lat + dLat,
            lng: start.lng - dLng,
          };
          viewRef.current = next;
          setViewCenter(next);
          setDrag({ x: 0, y: 0 });
        },
        onPanResponderTerminate: () => {
          setDrag({ x: 0, y: 0 });
        },
      }),
    []
  );

  if (loading && !coords) {
    return (
      <View style={[styles.shell, { height }]}>
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateTitle}>Finding your location…</Text>
          <Text style={styles.stateSub}>
            We’ll center the map on where you are now.
          </Text>
        </View>
      </View>
    );
  }

  if (!coords || !viewCenter) {
    return (
      <View style={[styles.shell, { height }]}>
        <View style={styles.state}>
          <Ionicons name="location-outline" size={28} color={colors.muted} />
          <Text style={styles.stateTitle}>Location unavailable</Text>
          <Text style={styles.stateSub}>
            {errorMessage ??
              "Enable location to see yourself on the map."}
          </Text>
          {onRequestLocation ? (
            <Pressable
              style={({ pressed }) => [
                styles.retry,
                pressed && { opacity: 0.85 },
              ]}
              onPress={onRequestLocation}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const uri = buildUri(viewCenter, zoom);

  return (
    <View style={[styles.shell, { height }]}>
      <View style={styles.mapTouch} {...panResponder.panHandlers}>
        <Image
          key={uri}
          source={{ uri }}
          style={[
            styles.map,
            { transform: [{ translateX: drag.x }, { translateY: drag.y }] },
          ]}
          resizeMode="cover"
          accessibilityLabel="Your location map"
        />
      </View>

      <View style={styles.badge} pointerEvents="none">
        <View style={styles.dot} />
        <Text style={styles.badgeText}>You are here</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
          accessibilityLabel="Zoom in"
          hitSlop={8}
        >
          <Ionicons name="add" size={20} color={colors.dark} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.8 }]}
          onPress={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mapTouch: { flex: 1 },
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: "#dbe7e0",
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
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
    marginTop: 8,
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
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
