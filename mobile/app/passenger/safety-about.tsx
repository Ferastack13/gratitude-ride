import { colors, radii, typography } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PILLARS = [
  {
    title: "Verified drivers",
    body: "Riders on Gratitude Ride go through identity checks so you can match the person and vehicle before you ride.",
  },
  {
    title: "In-app safety tools",
    body: "PIN verification, trip sharing, emergency contacts, RideCheck, and optional audio recording live in your Safety hub.",
  },
  {
    title: "Support when you need it",
    body: "If something goes wrong, use emergency contacts from the hub or contact local emergency services immediately.",
  },
];

export default function SafetyAboutScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.dark} />
        </Pressable>
        <Text style={styles.topTitle}>Safety at Gratitude Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>Learn how we stand for your safety.</Text>

        <View style={styles.hero}>
          <Ionicons
            name="shield-checkmark"
            size={36}
            color={colors.primary}
          />
          <Text style={styles.heroTitle}>Your trip, protected</Text>
          <Text style={styles.heroBody}>
            Gratitude Ride builds safety into every step — from pickup matching
            to live trip tools you control in Safety hub.
          </Text>
        </View>

        {PILLARS.map((p) => (
          <View key={p.title} style={styles.block}>
            <Text style={styles.blockTitle}>{p.title}</Text>
            <Text style={styles.blockBody}>{p.body}</Text>
          </View>
        ))}

        <Pressable
          style={styles.cta}
          onPress={() => Linking.openURL("tel:112")}
        >
          <Ionicons name="call" size={18} color={colors.white} />
          <Text style={styles.ctaText}>Call emergency (112)</Text>
        </Pressable>
      </ScrollView>
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.dark,
  },
  body: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  lead: {
    ...typography.supporting,
    fontSize: 14,
    marginBottom: 16,
  },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 14,
    alignItems: "flex-start",
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.dark,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  block: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 6,
  },
  blockBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  cta: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});
