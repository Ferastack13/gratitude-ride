import { useColors } from "@/context/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";

type BoneProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/** Soft pulse block used to build loading placeholders. */
export function SkeletonBone({
  width = "100%",
  height = 14,
  radius = 8,
  style,
}: BoneProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
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
          backgroundColor: colors.border,
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
            { backgroundColor: colors.white, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <SkeletonBone width="58%" height={16} radius={8} />
            <SkeletonBone width={8} height={8} radius={4} />
          </View>
          <SkeletonBone width="92%" height={12} radius={6} />
          <SkeletonBone width="74%" height={12} radius={6} />
          <SkeletonBone
            width="28%"
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
  list: { gap: 10, paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 2,
  },
});
