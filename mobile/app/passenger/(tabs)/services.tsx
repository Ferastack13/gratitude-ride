import { Screen } from "@/components/ui/Screen";
import { radii, typography, type ThemeColors } from "@/constants/theme";
import { useColors } from "@/context/theme";
import { RIDE_OPTIONS, type RideOptionId } from "@/lib/ride-options";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function accentFor(id: RideOptionId, colors: ThemeColors) {
  if (id === "express") {
    return { iconBg: colors.primarySoft, iconFg: colors.primary, tag: "Faster pickup" };
  }
  if (id === "comfort") {
    return { iconBg: colors.secondarySoft, iconFg: colors.secondaryDark, tag: "Extra space" };
  }
  return { iconBg: colors.surfaceAlt, iconFg: colors.dark, tag: "Everyday" };
}

export default function PassengerServicesScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.sub}>Choose how you want to ride</Text>
      </View>

      <View style={styles.list}>
        {RIDE_OPTIONS.map((s, index) => {
          const accent = accentFor(s.id, colors);
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    head: { gap: 6, marginBottom: 12 },
    title: { ...typography.pageTitle, color: colors.dark },
    sub: { ...typography.supporting, fontSize: 14, color: colors.muted },
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
      color: colors.muted,
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
      color: colors.muted,
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
}
