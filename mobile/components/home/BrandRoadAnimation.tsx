import { colors } from "@/constants/theme";
import { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/**
 * Decorative branded road + car. NOT GPS. NOT a driver.
 * Premium motion only — fills Home space when no active trip.
 */

type Pt = { x: number; y: number };

function cubic(t: number, p0: number, p1: number, p2: number, p3: number) {
  "worklet";
  const u = 1 - t;
  return (
    u * u * u * p0 +
    3 * u * u * t * p1 +
    3 * u * t * t * p2 +
    t * t * t * p3
  );
}

function cubicDeriv(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
) {
  "worklet";
  const u = 1 - t;
  return (
    3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2)
  );
}

/** Control points in unit space (0–1). Gentle S-curve across the scene. */
const PATH = {
  x0: 0.04,
  y0: 0.72,
  x1: 0.28,
  y1: 0.18,
  x2: 0.68,
  y2: 0.82,
  x3: 0.96,
  y3: 0.28,
};

function pathPoint(t: number, w: number, h: number): Pt {
  "worklet";
  return {
    x: cubic(t, PATH.x0, PATH.x1, PATH.x2, PATH.x3) * w,
    y: cubic(t, PATH.y0, PATH.y1, PATH.y2, PATH.y3) * h,
  };
}

function pathAngle(t: number, w: number, h: number) {
  "worklet";
  const dx = cubicDeriv(t, PATH.x0, PATH.x1, PATH.x2, PATH.x3) * w;
  const dy = cubicDeriv(t, PATH.y0, PATH.y1, PATH.y2, PATH.y3) * h;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function samplePath(w: number, h: number, count: number) {
  const pts: Pt[] = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    pts.push({
      x: cubic(t, PATH.x0, PATH.x1, PATH.x2, PATH.x3) * w,
      y: cubic(t, PATH.y0, PATH.y1, PATH.y2, PATH.y3) * h,
    });
  }
  return pts;
}

function PremiumCar() {
  return (
    <View style={styles.carRoot}>
      <View style={styles.carShadow} />
      <View style={styles.carShell}>
        <View style={styles.carBumperFront} />
        <View style={styles.hood} />
        <View style={styles.cabin}>
          <View style={styles.windshield} />
          <View style={styles.roof} />
          <View style={styles.rearGlass} />
        </View>
        <View style={styles.trunk} />
        <View style={styles.carBumperRear} />
        <View style={[styles.mirror, styles.mirrorL]} />
        <View style={[styles.mirror, styles.mirrorR]} />
        <View style={[styles.light, styles.lightFL]} />
        <View style={[styles.light, styles.lightFR]} />
        <View style={[styles.tail, styles.tailL]} />
        <View style={[styles.tail, styles.tailR]} />
        <View style={styles.accentStripe} />
      </View>
    </View>
  );
}

export function BrandRoadAnimation() {
  const progress = useSharedValue(0);
  const widthSV = useSharedValue(320);
  const heightSV = useSharedValue(110);
  const [size, setSize] = useState({ w: 320, h: 110 });

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 7800,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width < 8 || height < 8) return;
    setSize({ w: width, h: height });
    widthSV.value = width;
    heightSV.value = height;
  };

  const roadPts = useMemo(
    () => samplePath(size.w, size.h, 28),
    [size.w, size.h]
  );

  const lanePts = useMemo(
    () => samplePath(size.w, size.h, 16),
    [size.w, size.h]
  );

  const carStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const w = widthSV.value;
    const h = heightSV.value;
    const p = pathPoint(t, w, h);
    const deg = pathAngle(t, w, h);
    return {
      transform: [
        { translateX: p.x - 22 },
        { translateY: p.y - 12 },
        { rotate: `${deg}deg` },
      ],
    };
  });

  return (
    <View
      style={styles.wrap}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={styles.caption}>On the road with you</Text>
      <View style={styles.scene} onLayout={onLayout}>
        <View style={styles.ambience} />
        <View style={styles.ambienceSoft} />

        {/* Soft asphalt ribbon */}
        {roadPts.slice(0, -1).map((a, i) => {
          const b = roadPts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) + 1;
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`r-${i}`}
              style={[
                styles.roadSeg,
                {
                  width: len + 10,
                  left: (a.x + b.x) / 2 - (len + 10) / 2,
                  top: (a.y + b.y) / 2 - 9,
                  transform: [{ rotate: `${ang}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Shoulder / edge highlight */}
        {roadPts.slice(0, -1).map((a, i) => {
          if (i % 2 !== 0) return null;
          const b = roadPts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy) + 1;
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`e-${i}`}
              style={[
                styles.roadEdge,
                {
                  width: len + 6,
                  left: (a.x + b.x) / 2 - (len + 6) / 2,
                  top: (a.y + b.y) / 2 - 10.5,
                  transform: [{ rotate: `${ang}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Center dashes */}
        {lanePts.slice(0, -1).map((a, i) => {
          if (i % 2 === 0) return null;
          const b = lanePts[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.min(10, Math.sqrt(dx * dx + dy * dy));
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`d-${i}`}
              style={[
                styles.dash,
                {
                  width: len,
                  left: (a.x + b.x) / 2 - len / 2,
                  top: (a.y + b.y) / 2 - 1,
                  transform: [{ rotate: `${ang}deg` }],
                },
              ]}
            />
          );
        })}

        <Animated.View style={[styles.carWrap, carStyle]}>
          <PremiumCar />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 0,
    marginBottom: 2,
  },
  caption: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.mutedLight,
    letterSpacing: 0.55,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 2,
  },
  scene: {
    height: 118,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F7F8FA",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  ambience: {
    position: "absolute",
    left: -20,
    right: -20,
    top: 8,
    height: 70,
    borderRadius: 40,
    backgroundColor: "rgba(29,97,231,0.04)",
  },
  ambienceSoft: {
    position: "absolute",
    left: 40,
    right: 20,
    bottom: 6,
    height: 48,
    borderRadius: 28,
    backgroundColor: "rgba(16,24,40,0.03)",
  },
  roadSeg: {
    position: "absolute",
    height: 18,
    borderRadius: 9,
    backgroundColor: "#CBD5E1",
  },
  roadEdge: {
    position: "absolute",
    height: 21,
    borderRadius: 11,
    backgroundColor: "rgba(16,24,40,0.045)",
  },
  dash: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  carWrap: {
    position: "absolute",
    width: 44,
    height: 24,
    zIndex: 5,
  },
  carRoot: {
    width: 44,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  carShadow: {
    position: "absolute",
    width: 38,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(16,24,40,0.14)",
    bottom: 0,
  },
  carShell: {
    width: 42,
    height: 18,
    borderRadius: 7,
    backgroundColor: colors.primary,
    overflow: "visible",
  },
  carBumperFront: {
    position: "absolute",
    right: 0,
    top: 3,
    bottom: 3,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: colors.primaryDark,
  },
  carBumperRear: {
    position: "absolute",
    left: 0,
    top: 3,
    bottom: 3,
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    backgroundColor: colors.primaryDark,
  },
  hood: {
    position: "absolute",
    right: 5,
    top: 2,
    width: 9,
    height: 14,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cabin: {
    position: "absolute",
    left: 11,
    right: 13,
    top: 2,
    bottom: 2,
    borderRadius: 4,
    backgroundColor: "rgba(11,18,32,0.22)",
    overflow: "hidden",
  },
  windshield: {
    position: "absolute",
    right: 0,
    top: 1,
    bottom: 1,
    width: 7,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "rgba(232,240,254,0.55)",
  },
  roof: {
    position: "absolute",
    left: 6,
    right: 8,
    top: 2,
    bottom: 2,
    borderRadius: 2,
    backgroundColor: "rgba(16,24,40,0.18)",
  },
  rearGlass: {
    position: "absolute",
    left: 0,
    top: 1,
    bottom: 1,
    width: 5,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    backgroundColor: "rgba(232,240,254,0.35)",
  },
  trunk: {
    position: "absolute",
    left: 3,
    top: 3,
    width: 7,
    height: 12,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  mirror: {
    position: "absolute",
    width: 3,
    height: 4,
    borderRadius: 1.5,
    backgroundColor: colors.primaryDark,
  },
  mirrorL: { top: -2, left: 18 },
  mirrorR: { bottom: -2, left: 18 },
  light: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#F8FAFC",
    right: 1,
  },
  lightFL: { top: 2 },
  lightFR: { bottom: 2 },
  tail: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: "#F87171",
    left: 1,
    opacity: 0.85,
  },
  tailL: { top: 2 },
  tailR: { bottom: 2 },
  accentStripe: {
    position: "absolute",
    left: 8,
    right: 10,
    bottom: 1,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(245,197,24,0.55)",
  },
});
