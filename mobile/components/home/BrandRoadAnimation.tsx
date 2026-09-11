import { colors } from "@/constants/theme";
import { useEffect } from "react";
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
 * Purely visual personality for Home empty space.
 */
export function BrandRoadAnimation() {
  const progress = useSharedValue(0);
  const travel = useSharedValue(200);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 5600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const onRoadLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    travel.value = Math.max(120, w - 56);
  };

  const carStyle = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      transform: [
        { translateX: t * travel.value },
        { translateY: Math.sin(t * Math.PI) * -1.5 },
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
      <View style={styles.road} onLayout={onRoadLayout}>
        <View style={styles.roadLine} />
        <View style={styles.dashes}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <Animated.View style={[styles.car, carStyle]}>
          <View style={styles.carBody}>
            <View style={styles.carCabin} />
            <View style={styles.carAccent} />
          </View>
          <View style={styles.wheelRow}>
            <View style={styles.wheel} />
            <View style={styles.wheel} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 16,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  caption: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.mutedLight,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  road: {
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
  },
  roadLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    top: 18,
  },
  dashes: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dash: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
  },
  car: {
    position: "absolute",
    left: 4,
    top: 6,
    width: 42,
    height: 26,
  },
  carBody: {
    height: 16,
    borderRadius: 5,
    backgroundColor: colors.primary,
    justifyContent: "center",
  },
  carCabin: {
    position: "absolute",
    right: 7,
    top: 2,
    width: 13,
    height: 9,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  carAccent: {
    position: "absolute",
    left: 4,
    bottom: 2,
    width: 7,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: colors.secondary,
  },
  wheelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 1,
  },
  wheel: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.dark,
  },
});
