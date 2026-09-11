import {
  TILE_SIZE,
  latToWorldY,
  lngToWorldX,
  tilesForViewport,
} from "@/lib/osm-tiles";
import { useEffect, useMemo, useRef, useState } from "react";
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
  markers?: Marker[];
  dragOffset?: { x: number; y: number };
  onLayoutSize?: (size: { w: number; h: number }) => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Live OSM/Carto raster tiles (replaces discontinued staticmap.openstreetmap.de).
 */
export function OsmRasterMap({
  center,
  zoom,
  height,
  markers = [],
  dragOffset = { x: 0, y: 0 },
  onLayoutSize,
  style,
  children,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: height });
  const logged = useRef(false);

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
              backgroundColor: m.color ?? "#1D61E7",
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
          width: "100%",
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
        {markerNodes}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
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
