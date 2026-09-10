import { Screen } from "@/components/ui/Screen";
import { colors, radii, typography } from "@/constants/theme";
import { RIDE_OPTIONS, type RideOptionId } from "@/lib/ride-options";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ACCENT: Record<
  RideOptionId,
  { iconBg: string; iconFg: string; tag: string }
> = {
  standard: {
    iconBg: colors.surfaceAlt,
    iconFg: colors.dark,
    tag: "Everyday",
  },
  express: {
    iconBg: colors.primarySoft,
    iconFg: colors.primary,
    tag: "Faster pickup",
  },
  comfort: {
    iconBg: "#F4F0E6",
    iconFg: "#8B7355",
    tag: "Extra space",
  },
};

export default function PassengerServicesScreen() {
  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.sub}>Choose how you want to ride</Text>
      </View>

      <View style={styles.list}>
        {RIDE_OPTIONS.map((s, index) => {
          const accent = ACCENT[s.id];
          return (
            <View key={s.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  router.push(`/passenger/service/${s.id}` as never)
                }
              >
                <View
                  style={[styles.icon, { backgroundColor: accent.iconBg }]}
                >
                  <Ionicons name={s.icon} size={22} color={accent.iconFg} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.tileTitle}>{s.title}</Text>
                    <Text style={styles.tag}>{accent.tag}</Text>
                  </View>
                  <Text style={styles.hint}>{s.description}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.mutedLight}
                />
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => router.push("/passenger/where-to" as never)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Need a ride now?</Text>
          <Text style={styles.ctaBody}>
            Skip service details and go straight to pickup & destination.
          </Text>
        </View>
        <View style={styles.ctaBtn}>
          <Text style={styles.ctaBtnText}>Go</Text>
        </View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 6, marginBottom: 12 },
  title: { ...typography.pageTitle },
  sub: { ...typography.supporting, fontSize: 14 },
  list: { marginBottom: 28 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  tileTitle: {
    fontWeight: "600",
    color: colors.dark,
    fontSize: 17,
  },
  tag: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.muted,
  },
  hint: {
    ...typography.supporting,
    marginTop: 4,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    padding: 16,
  },
  ctaTitle: {
    fontWeight: "600",
    color: colors.dark,
    fontSize: 16,
  },
  ctaBody: {
    ...typography.supporting,
    marginTop: 4,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaBtnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
