import { colors, radii } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

/** Calm waiting state — stays until a REAL driver accepts (Phase 1). */
export function FindingCourier({
  city,
  trackingId,
  title = "Finding your driver",
  subtitle,
  pickupLabel,
  dropoffLabel,
  rideType,
}: {
  city: string;
  trackingId?: string;
  title?: string;
  subtitle?: string;
  pickupLabel?: string;
  dropoffLabel?: string;
  rideType?: string;
}) {
  const pulse = useRef(new Animated.Value(0.55)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );
    const sweep = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    );
    loop.start();
    sweep.start();
    return () => {
      loop.stop();
      sweep.stop();
    };
  }, [pulse, ring]);

  const scale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.35],
  });
  const fade = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Animated.View
          style={[styles.ripple, { opacity: fade, transform: [{ scale }] }]}
        />
        <Animated.View
          style={[
            styles.core,
            { opacity: pulse, transform: [{ scale: pulse }] },
          ]}
        >
          <Ionicons name="car-sport" size={28} color={colors.white} />
        </Animated.View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>
        {subtitle ??
          `Looking for a nearby driver around ${city}. You’ll move forward as soon as someone accepts.`}
      </Text>

      {(pickupLabel || dropoffLabel || rideType) && (
        <View style={styles.metaCard}>
          {rideType ? (
            <Text style={styles.metaRide}>{rideType}</Text>
          ) : null}
          {pickupLabel ? (
            <Text style={styles.metaLine} numberOfLines={1}>
              <Text style={styles.dotP}>● </Text>
              {pickupLabel}
            </Text>
          ) : null}
          {dropoffLabel ? (
            <Text style={styles.metaLine} numberOfLines={1}>
              <Text style={styles.dotD}>● </Text>
              {dropoffLabel}
            </Text>
          ) : null}
        </View>
      )}

      {trackingId ? <Text style={styles.id}>{trackingId}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  hero: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ripple: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
  },
  core: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.3,
  },
  sub: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  metaCard: {
    alignSelf: "stretch",
    marginTop: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 14,
    gap: 6,
  },
  metaRide: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaLine: { color: colors.dark, fontSize: 13, fontWeight: "600" },
  dotP: { color: colors.primary, fontWeight: "900" },
  dotD: { color: colors.secondaryDark, fontWeight: "900" },
  id: {
    marginTop: 2,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 12,
    color: colors.muted,
  },
});
