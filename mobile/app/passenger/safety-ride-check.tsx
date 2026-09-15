import { colors, radii, typography } from "@/constants/theme";
import {
  getSafetyPrefs,
  setSafetyPrefs,
  type RideCheckMode,
} from "@/lib/client-prefs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS: {
  mode: RideCheckMode;
  title: string;
  sub: string;
}[] = [
  {
    mode: "all",
    title: "All trips",
    sub: "Get a RideCheck message on every trip if something looks unusual.",
  },
  {
    mode: "night",
    title: "Night trips only",
    sub: "Only check for possible issues on trips between 9 PM and 5 AM.",
  },
  {
    mode: "off",
    title: "Off",
    sub: "Don’t send RideCheck messages automatically.",
  },
];

export default function RideCheckScreen() {
  const [mode, setMode] = useState<RideCheckMode>("all");

  useFocusEffect(
    useCallback(() => {
      getSafetyPrefs()
        .then((p) => setMode(p.rideCheck))
        .catch(() => undefined);
    }, [])
  );

  const select = async (next: RideCheckMode) => {
    setMode(next);
    await setSafetyPrefs({ rideCheck: next });
    const label =
      next === "all" ? "All trips" : next === "night" ? "Night trips" : "Off";
    Alert.alert("RideCheck updated", `RideCheck is set to “${label}”.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.dark} />
        </Pressable>
        <Text style={styles.topTitle}>RideCheck</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.lead}>
          Get a message if we detect a possible safety issue on your trip.
        </Text>

        <View style={styles.list}>
          {OPTIONS.map((opt, i) => {
            const selected = mode === opt.mode;
            return (
              <View key={opt.mode}>
                {i > 0 ? <View style={styles.divider} /> : null}
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    pressed && { opacity: 0.85 },
                  ]}
                  onPress={() => select(opt.mode)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{opt.title}</Text>
                    <Text style={styles.rowSub}>{opt.sub}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selected && styles.radioOn,
                    ]}
                  >
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: colors.dark,
  },
  body: { paddingHorizontal: 20, paddingTop: 12 },
  lead: {
    ...typography.supporting,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  rowSub: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});
