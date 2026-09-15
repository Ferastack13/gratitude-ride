import { colors, radii, typography } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIPS = [
  {
    icon: "car-outline" as const,
    title: "Confirm your ride",
    body: "Before you get in, match the plate number, car model, and driver photo in the app. Use PIN verification when it’s on.",
  },
  {
    icon: "people-outline" as const,
    title: "Share your trip",
    body: "Turn on share trip location so a trusted contact can follow your route until you arrive.",
  },
  {
    icon: "call-outline" as const,
    title: "Keep emergency contacts ready",
    body: "Add people we can reach quickly if something goes wrong during a trip.",
  },
  {
    icon: "moon-outline" as const,
    title: "Stay aware at night",
    body: "Prefer well-lit pickup spots, keep RideCheck on for night trips, and sit in the back seat when you can.",
  },
  {
    icon: "mic-outline" as const,
    title: "Use audio recording if you need it",
    body: "If a ride feels uncomfortable, enable audio recording from Safety hub before or during the trip.",
  },
  {
    icon: "alert-circle-outline" as const,
    title: "Trust your instincts",
    body: "You can cancel a trip that doesn’t feel right. If you’re already riding, use emergency contacts or local emergency services.",
  },
];

export default function SafetyTipsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={colors.dark} />
        </Pressable>
        <Text style={styles.topTitle}>Safety tips</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>Take charge of your safety.</Text>

        {TIPS.map((tip) => (
          <View key={tip.title} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={tip.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{tip.title}</Text>
              <Text style={styles.cardBody}>{tip.body}</Text>
            </View>
          </View>
        ))}
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
    fontSize: 17,
    fontWeight: "700",
    color: colors.dark,
  },
  body: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 8 },
  lead: {
    ...typography.supporting,
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
});
