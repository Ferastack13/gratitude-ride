import { useColors } from "@/context/theme";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

type BoneProps = {
  /** Fraction of screen width (0–1), or absolute px when `px` is set. */
  widthFrac?: number;
  widthPx?: number;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/** Soft pulse block used to build loading placeholders. */
export function SkeletonBone({
  widthFrac = 1,
  widthPx,
  height = 14,
  radius = 8,
  style,
}: BoneProps) {
  const colors = useColors();
  const { width: winW } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0.35)).current;
  const width = widthPx ?? Math.max(24, Math.round((winW - 56) * widthFrac));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Inbox-shaped notification card placeholders. */
export function NotificationSkeletonList({ count = 5 }: { count?: number }) {
  const colors = useColors();
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`sk-${i}`}
          style={[
            styles.card,
            {
              backgroundColor: colors.white,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.row}>
            <SkeletonBone widthFrac={0.55} height={16} radius={8} />
            <SkeletonBone widthPx={10} height={10} radius={5} />
          </View>
          <SkeletonBone widthFrac={0.9} height={12} radius={6} />
          <SkeletonBone widthFrac={0.72} height={12} radius={6} />
          <SkeletonBone
            widthFrac={0.3}
            height={10}
            radius={6}
            style={{ marginTop: 4 }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingBottom: 24, width: "100%" },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 2,
  },
});
