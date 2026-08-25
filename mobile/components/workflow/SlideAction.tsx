import { colors, radii } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Slide-to-confirm control used on active trip stages. */
export function SlideAction({
  label,
  onConfirm,
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const width = useRef(0);
  const x = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(false);
    x.setValue(0);
  }, [label, x]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !done,
      onMoveShouldSetPanResponder: () => !disabled && !done,
      onPanResponderMove: (_, g) => {
        const max = Math.max(0, width.current - 64);
        x.setValue(Math.max(0, Math.min(g.dx, max)));
      },
      onPanResponderRelease: (_, g) => {
        const max = Math.max(0, width.current - 64);
        if (g.dx > max * 0.72) {
          Animated.timing(x, {
            toValue: max,
            duration: 120,
            useNativeDriver: false,
          }).start(() => {
            setDone(true);
            onConfirm();
          });
        } else {
          Animated.spring(x, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.track, disabled && styles.disabled]}
      onLayout={(e) => {
        width.current = e.nativeEvent.layout.width;
      }}
    >
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[styles.knob, { transform: [{ translateX: x }] }]}
        {...pan.panHandlers}
      >
        <Text style={styles.arrow}>››</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
