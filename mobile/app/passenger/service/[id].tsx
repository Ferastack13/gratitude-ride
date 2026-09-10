import { Button } from "@/components/ui/Button";
import { colors, radii, typography } from "@/constants/theme";
import {
  isRideOptionId,
  rideOptionById,
  type RideOptionId,
} from "@/lib/ride-options";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCENT: Record<
  RideOptionId,
  { iconBg: string; iconFg: string }
> = {
  standard: { iconBg: colors.surfaceAlt, iconFg: colors.dark },
  express: { iconBg: colors.primarySoft, iconFg: colors.primary },
  comfort: { iconBg: "#F4F0E6", iconFg: "#8B7355" },
};

/**
 * Service details — explains Standard / Express / Comfort, then continues
 * into the existing where-to → plan booking flow with serviceId set.
 * Does NOT show maps, driver GPS, or booking UI.
 */
export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = isRideOptionId(id) ? id : "standard";
  const option = rideOptionById(serviceId);
  const accent = ACCENT[serviceId];

  const startBooking = () => {
    router.push({
      pathname: "/passenger/where-to",
      params: {
        serviceId: option.id,
        focus: "dropoff",
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.head}>
        <Pressable
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.dark} />
        </Pressable>
        <Text style={styles.headLabel}>Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroIcon, { backgroundColor: accent.iconBg }]}>
          <Ionicons name={option.icon} size={32} color={accent.iconFg} />
        </View>

        <Text style={styles.title}>{option.detailsHeadline}</Text>
        <Text style={styles.intro}>{option.detailsIntro}</Text>

        <Text style={styles.section}>What you get</Text>
        <View style={styles.benefits}>
          {option.benefits.map((item) => (
            <View key={item} style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ))}
        </View>

        {option.availabilityNote ? (
          <Text style={styles.note}>{option.availabilityNote}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Choose pickup & destination"
          onPress={startBooking}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  headLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  intro: {
    ...typography.supporting,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  section: {
    ...typography.section,
    marginBottom: 14,
  },
  benefits: { gap: 14 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
    color: colors.dark,
    lineHeight: 22,
  },
  note: {
    marginTop: 24,
    ...typography.supporting,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
