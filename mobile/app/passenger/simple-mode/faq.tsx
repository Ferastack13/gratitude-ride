import { colors } from "@/constants/theme";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAQS = [
  {
    q: "What is Simple Mode?",
    a: "It is a calmer Gratitude Ride layout with larger text, a bigger book-a-ride button, and a dedicated support line.",
  },
  {
    q: "Does it cost extra?",
    a: "No. Fares stay the same. Simple Mode only changes how the app looks and how we note extra boarding time.",
  },
  {
    q: "What does “I’m a senior” do?",
    a: "Your driver sees that you may need extra time to get in the car. It is written on the trip, not posted publicly.",
  },
  {
    q: "How do I book a trip?",
    a: "On Home, tap the large Where to? button, choose pickup and drop-off, then Confirm. Home and Work shortcuts still work.",
  },
  {
    q: "How do I get help?",
    a: "Use Call or chat support on this Simple Mode screen, or Help on Account. Someone can walk you through a booking.",
  },
  {
    q: "How do I turn it off?",
    a: "Open Account → Simple mode and switch off “Turn on a simplified version of the app”.",
  },
];

export default function SimpleModeFaqScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.head}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.dark} />
        </Pressable>
        <Text style={styles.title}>Gratitude for Seniors FAQ</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 36 + insets.bottom }}
      >
        {FAQS.map((item) => (
          <View key={item.q} style={styles.card}>
            <Text style={styles.q}>{item.q}</Text>
            <Text style={styles.a}>{item.a}</Text>
          </View>
        ))}
        <Pressable
          style={styles.help}
          onPress={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
        >
          <Text style={styles.helpText}>Chat with support</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  head: { paddingHorizontal: 8, paddingTop: 6 },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.4,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  q: { fontSize: 16, fontWeight: "700", color: colors.dark, marginBottom: 6 },
  a: { fontSize: 15, lineHeight: 22, color: colors.muted },
  help: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
