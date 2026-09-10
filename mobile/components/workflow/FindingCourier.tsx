import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

/** Post-book matching — searching for a nearby driver. */
export function FindingCourier({
  city,
  trackingId,
  title = "Finding your driver",
  subtitle,
}: {
  city: string;
  trackingId?: string;
  title?: string;
  subtitle?: string;
}) {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.ring, { opacity: pulse, transform: [{ scale: pulse }] }]}
      />
      <View style={styles.icon}>
        <Ionicons name="car" size={28} color={colors.white} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>
        {subtitle ??
          `Matching a verified driver near ${city}. This usually takes under a minute.`}
      </Text>
      {trackingId ? <Text style={styles.id}>{trackingId}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  ring: {
    position: "absolute",
    top: 4,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "900", color: colors.dark },
  sub: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  id: {
    marginTop: 4,
    fontFamily: "monospace",
    fontWeight: "800",
    color: colors.primary,
  },
});
