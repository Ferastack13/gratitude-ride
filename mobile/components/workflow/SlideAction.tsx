import { colors, radii } from "@/constants/theme";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Slide-to-confirm (also tappable) used on active trip stages. */
export function SlideAction({
  label,
  onConfirm,
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const width = useRef(280);
  const x = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);
  const confirming = useRef(false);

  useEffect(() => {
    setDone(false);
    confirming.current = false;
    x.setValue(0);
  }, [label, x]);

  const finish = () => {
    if (disabled || done || confirming.current) return;
    confirming.current = true;
    const max = Math.max(0, width.current - 64);
    Animated.timing(x, {
      toValue: max,
      duration: 140,
      useNativeDriver: false,
    }).start(() => {
      setDone(true);
      onConfirm();
    });
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled && !done,
        onMoveShouldSetPanResponder: (_, g) =>
          !disabled && !done && Math.abs(g.dx) > 3,
        onStartShouldSetPanResponderCapture: () => !disabled && !done,
        onMoveShouldSetPanResponderCapture: (_, g) =>
          !disabled && !done && Math.abs(g.dx) > 3,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderMove: (_, g) => {
          const max = Math.max(0, width.current - 64);
          x.setValue(Math.max(0, Math.min(g.dx, max)));
        },
        onPanResponderRelease: (_, g) => {
          const max = Math.max(0, width.current - 64);
          // Confirm if slid far enough, or if they tapped/flicked the knob
          if (g.dx > max * 0.55 || (g.dx < 8 && g.dx > -8 && max > 0)) {
            // Small movement = tap on knob → confirm
            if (g.dx < 8 && g.dx > -8) {
              finish();
              return;
            }
            Animated.timing(x, {
              toValue: max,
              duration: 120,
              useNativeDriver: false,
            }).start(() => {
              if (!confirming.current) {
                confirming.current = true;
                setDone(true);
                onConfirm();
              }
            });
          } else {
            Animated.spring(x, {
              toValue: 0,
              useNativeDriver: false,
              bounciness: 8,
            }).start();
          }
        },
      }),
    [disabled, done, onConfirm, x]
  );

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.track, disabled && styles.disabled]}
        onLayout={(e) => {
          width.current = e.nativeEvent.layout.width;
        }}
        {...pan.panHandlers}
      >
        <Text style={styles.label} pointerEvents="none">
          {done ? "Confirmed…" : label}
        </Text>
        <Animated.View
          style={[styles.knob, { transform: [{ translateX: x }] }]}
          pointerEvents="box-none"
        >
          <Text style={styles.arrow}>››</Text>
        </Animated.View>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.tapFallback,
          (disabled || done) && styles.disabled,
          pressed && { opacity: 0.85 },
        ]}
        onPress={finish}
        disabled={disabled || done}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.tapText}>
          {done ? "Working…" : "Or tap here to confirm"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  track: {
    height: 58,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    justifyContent: "center",
    overflow: "hidden",
  },
  disabled: { opacity: 0.5 },
  label: {
    textAlign: "center",
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2,
    paddingHorizontal: 56,
  },
  knob: {
    position: "absolute",
    left: 4,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { color: colors.primary, fontWeight: "900", fontSize: 22 },
  tapFallback: {
    minHeight: 44,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  tapText: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 14,
  },
});
