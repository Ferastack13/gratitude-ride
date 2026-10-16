import {
  TILE_SIZE,
  latToWorldY,
  lngToWorldX,
  tilesForViewport,
} from "@/lib/osm-tiles";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Image,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Coords = { lat: number; lng: number };

type Marker = Coords & {
  color?: string;
};

type Props = {
  center: Coords;
  zoom: number;
  height: number;
  /** Pixel width — pass this so tiles paint before onLayout (avoids a blank map). */
  width?: number;
  markers?: Marker[];
  /** Road path in lat/lng — drawn as screen-space segments (no native MapView). */
  path?: Coords[];
  pathColor?: string;
  dragOffset?: { x: number; y: number };
  onLayoutSize?: (size: { w: number; h: number }) => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Cap points so we don't paint hundreds of Views on long OSRM routes. */
function simplifyPath(path: Coords[], maxPoints: number): Coords[] {
  if (path.length <= maxPoints) return path;
  const step = (path.length - 1) / (maxPoints - 1);
  const out: Coords[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(path[Math.round(i * step)]!);
  }
  return out;
}

/**
 * Live OSM/Carto raster tiles (replaces discontinued staticmap.openstreetmap.de).
 */
export function OsmRasterMap({
  center,
  zoom,
  height,
  width: widthProp,
  markers = [],
  path = [],
  pathColor = "#12372A",
  dragOffset = { x: 0, y: 0 },
  onLayoutSize,
  style,
  children,
}: Props) {
  const [size, setSize] = useState({
    w: widthProp && widthProp > 0 ? widthProp : 0,
    h: height,
  });
  const logged = useRef(false);

  useEffect(() => {
    setSize((prev) => {
      const w = widthProp && widthProp > 0 ? widthProp : prev.w;
      const h = height > 0 ? height : prev.h;
      if (w === prev.w && h === prev.h) return prev;
      return { w, h };
    });
  }, [widthProp, height]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    if (width <= 0) return;
    if (width !== size.w || Math.abs(h - size.h) > 1) {
      setSize({ w: width, h });
      onLayoutSize?.({ w: width, h });
    }
  };

  const tiles = useMemo(() => {
    if (size.w <= 0) return [];
    const cx = lngToWorldX(center.lng, zoom);
    const cy = latToWorldY(center.lat, zoom);
    return tilesForViewport(zoom, cx, cy, size.w, size.h, 1);
  }, [center.lat, center.lng, zoom, size.w, size.h]);

  useEffect(() => {
    logged.current = false;
  }, [center.lat, center.lng, zoom]);

  const pathNodes = useMemo(() => {
    if (size.w <= 0 || path.length < 2) return null;
    const pts = simplifyPath(path, 48);
    const cx = lngToWorldX(center.lng, zoom);
    const cy = latToWorldY(center.lat, zoom);
    const pixels = pts.map((p) => ({
      x: lngToWorldX(p.lng, zoom) - cx + size.w / 2,
      y: latToWorldY(p.lat, zoom) - cy + size.h / 2,
    }));
    const segments: ReactNode[] = [];
    for (let i = 0; i < pixels.length - 1; i++) {
      const a = pixels[i]!;
      const b = pixels[i + 1]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.5) continue;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      segments.push(
        <View
          key={`seg-${i}`}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: midX - len / 2,
            top: midY - 2,
            width: len,
            height: 4,
            borderRadius: 2,
            backgroundColor: pathColor,
            opacity: 0.88,
            transform: [{ rotate: `${angle}deg` }],
            zIndex: 1,
          }}
        />
      );
    }
    return segments;
  }, [path, pathColor, center.lat, center.lng, zoom, size.w, size.h]);

  const markerNodes = useMemo(() => {
    if (size.w <= 0) return null;
    const cx = lngToWorldX(center.lng, zoom);
    const cy = latToWorldY(center.lat, zoom);
    return markers.map((m, i) => {
      const mx = lngToWorldX(m.lng, zoom) - cx + size.w / 2;
      const my = latToWorldY(m.lat, zoom) - cy + size.h / 2;
      return (
        <View
          key={`m-${i}-${m.lat}-${m.lng}`}
          pointerEvents="none"
          style={[
            styles.marker,
            {
              left: mx - 9,
              top: my - 9,
              backgroundColor: m.color ?? "#12372A",
            },
          ]}
        />
      );
    });
  }, [markers, center.lat, center.lng, zoom, size.w, size.h]);

  return (
    <View
      style={[
        {
          height,
          width: widthProp && widthProp > 0 ? widthProp : "100%",
          overflow: "hidden",
          backgroundColor: "#e8eef2",
        },
        style,
      ]}
      onLayout={onLayout}
      collapsable={false}
    >
      <View
        style={[
          styles.layer,
          {
            transform: [
              { translateX: dragOffset.x },
              { translateY: dragOffset.y },
            ],
          },
        ]}
      >
        {tiles.map((t) => (
          <Image
            key={t.key}
            source={{ uri: t.url }}
            style={{
              position: "absolute",
              left: t.left,
              top: t.top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
            onLoad={() => {
              if (!logged.current) {
                logged.current = true;
                console.log(
                  "[OsmRasterMap] tile OK",
                  t.key,
                  "center",
                  center.lat.toFixed(5),
                  center.lng.toFixed(5),
                  "z",
                  zoom
                );
              }
            }}
            onError={(e) => {
              console.warn(
                "[OsmRasterMap] tile FAIL",
                t.key,
                e.nativeEvent?.error
              );
            }}
          />
        ))}
        {pathNodes}
        {markerNodes}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 2,
  },
});
