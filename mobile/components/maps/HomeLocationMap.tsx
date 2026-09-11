import { OsmRasterMap } from "@/components/maps/OsmRasterMap";
import { colors, radii, shadows } from "@/constants/theme";
import {
  latToWorldY,
  lngToWorldX,
  worldToLatLng,
} from "@/lib/osm-tiles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  /** Flush edges for map-first Home (presentation only). */
  flush?: boolean;
  /** Move zoom/recenter to top-right so a bottom sheet does not cover them. */
  controlsTop?: boolean;
};

const MIN_ZOOM = 12;
const MAX_ZOOM = 17;
const DEFAULT_ZOOM = 15;

/**
 * Home “You are here” map — real GPS + OSM/Carto raster tiles.
 * Root cause of blank map: staticmap.openstreetmap.de is discontinued (NXDOMAIN).
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
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [viewCenter, setViewCenter] = useState<Coords | null>(coords);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const baseRef = useRef<Coords | null>(coords);
  const viewRef = useRef<Coords | null>(coords);
  const zoomRef = useRef(DEFAULT_ZOOM);
  const panStart = useRef<Coords | null>(null);
  const sizeRef = useRef({ w: 0, h: height });

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
          if (!start || sizeRef.current.w <= 0) {
            setDrag({ x: 0, y: 0 });
            return;
          }
          const z = zoomRef.current;
          const cx = lngToWorldX(start.lng, z) - g.dx;
          const cy = latToWorldY(start.lat, z) - g.dy;
          const next = worldToLatLng(cx, cy, z);
          viewRef.current = next;
          setViewCenter(next);
          setDrag({ x: 0, y: 0 });
        },
        onPanResponderTerminate: () => setDrag({ x: 0, y: 0 }),
      }),
    []
  );

  const shellStyle = [
    styles.shell,
    flush && styles.shellFlush,
    { height },
  ];

  if (loading && !coords) {
    return (
      <View style={shellStyle}>
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
      <View style={shellStyle}>
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

  return (
    <View style={shellStyle} collapsable={false}>
      <View style={styles.mapTouch} {...panResponder.panHandlers}>
        <OsmRasterMap
          center={viewCenter}
          zoom={zoom}
          height={height}
          dragOffset={drag}
          markers={[{ lat: coords.lat, lng: coords.lng, color: colors.primary }]}
          onLayoutSize={(s) => {
            sizeRef.current = s;
          }}
        />
      </View>

      <View
        style={[styles.badge, flush && styles.badgeFlush]}
        pointerEvents="none"
      >
        <View style={styles.dot} />
        <Text style={styles.badgeText}>You are here</Text>
      </View>

      <Text
        style={[styles.attrib, flush && styles.attribFlush]}
        pointerEvents="none"
      >
        © OSM · CARTO
      </Text>

      <View
        style={[styles.controls, controlsTop && styles.controlsTop]}
      >
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
    backgroundColor: "#e8eef2",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  shellFlush: {
    borderRadius: 0,
    borderWidth: 0,
  },
  mapTouch: { flex: 1 },
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
  badgeFlush: {
    bottom: 28,
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
  attrib: {
    position: "absolute",
    left: 12,
    top: 10,
    fontSize: 9,
    color: colors.muted,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attribFlush: {
    top: 72,
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
