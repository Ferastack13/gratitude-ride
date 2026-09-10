import { Button } from "@/components/ui/Button";
import { colors, radii, shadows } from "@/constants/theme";
import {
  setAccountType,
  type AccountType,
} from "@/lib/account-type";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS: {
  id: AccountType;
  title: string;
  description: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}[] = [
  {
    id: "driver",
    title: "Driver",
    description: "Accept ride requests, earn money, and manage your trips.",
    tint: colors.pastelBlue,
    icon: "car-sport",
    iconColor: colors.primary,
  },
  {
    id: "passenger",
    title: "Passenger",
    description: "Book rides, track your driver, and get to your destination safely.",
    tint: colors.pastelGreen,
    icon: "person",
    iconColor: colors.success,
  },
  {
    id: "business",
    title: "Client / Business",
    description: "Book rides for yourself, your team, or your business.",
    tint: colors.pastelPurple,
    icon: "briefcase",
    iconColor: "#7C3AED",
  },
];

export default function ChooseAccountTypeScreen() {
  const [selected, setSelected] = useState<AccountType | null>(null);

  const onContinue = async () => {
    if (!selected) return;
    await setAccountType(selected);
    router.push({
      pathname: "/register",
      params: { accountType: selected },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.bgAccent} />
      <View style={styles.body}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.dark} />
        </Pressable>

        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoG}>G</Text>
          </View>
          <View>
            <Text style={styles.brand}>Gratitude Ride</Text>
            <Text style={styles.tagline}>Ride · Drive · Deliver · Grow</Text>
          </View>
        </View>

        <Text style={styles.title}>Choose your account type</Text>
        <Text style={styles.sub}>
          Select the option that best describes you. You can change this later
          in your settings.
        </Text>

        <View style={styles.list}>
          {OPTIONS.map((opt) => {
            const on = selected === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setSelected(opt.id)}
                style={[
                  styles.card,
                  { backgroundColor: opt.tint },
                  on && styles.cardOn,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: colors.white },
                  ]}
                >
                  <Ionicons name={opt.icon} size={22} color={opt.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{opt.title}</Text>
                  <Text style={styles.cardDesc}>{opt.description}</Text>
                </View>
                <View style={[styles.radio, on && styles.radioOn]}>
                  {on ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        <Button
          label="Continue"
          icon="arrow-forward"
          onPress={onContinue}
          disabled={!selected}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  bgAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 180,
    height: 180,
    borderBottomLeftRadius: 120,
    backgroundColor: colors.primarySoft,
    opacity: 0.7,
  },
  body: { flex: 1, padding: 20, gap: 14 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  logoG: { color: colors.white, fontWeight: "900", fontSize: 22 },
  brand: { fontSize: 18, fontWeight: "900", color: colors.dark },
  tagline: { fontSize: 11, color: colors.muted, fontWeight: "600", marginTop: 2 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  sub: { fontSize: 14, color: colors.muted, lineHeight: 21, marginTop: -4 },
  list: { gap: 12, marginTop: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardOn: {
    borderColor: colors.primary,
    ...shadows.card,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: colors.dark },
  cardDesc: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: "500",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
