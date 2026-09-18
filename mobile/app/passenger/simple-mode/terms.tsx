import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TERMS = [
  {
    title: "Who Simple Mode is for",
    body: "Simple Mode is an optional layout for older adults and anyone who wants larger type, fewer choices, and easier trip booking in Gratitude Ride.",
  },
  {
    title: "What changes",
    body: "When Simple Mode is on, Home uses a larger Where to? button, Account uses larger text, and a dedicated support button is shown. You can turn it off at any time.",
  },
  {
    title: "Senior identification",
    body: "If you turn on “I’m a senior”, we add a note to your trip so the driver knows you may need extra time to board. This is only shared for active trips.",
  },
  {
    title: "Support",
    body: "Dedicated phone and WhatsApp support is for Simple Mode users. Standard rates from your carrier may apply.",
  },
  {
    title: "Your control",
    body: "Simple Mode does not change your fare, wallet, or account ownership. You can leave Simple Mode or delete your account from Settings.",
  },
];

export default function SimpleModeTermsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.head}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.dark} />
        </Pressable>
        <Text style={styles.title}>Simple Mode Terms of Use</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 36 + insets.bottom }}
      >
        <Text style={styles.updated}>Effective 18 September 2026</Text>
        {TERMS.map((t) => (
          <View key={t.title} style={styles.block}>
            <Text style={styles.h}>{t.title}</Text>
            <Text style={styles.p}>{t.body}</Text>
          </View>
        ))}
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
  },
  updated: { color: colors.muted, fontSize: 13, marginBottom: 16 },
  block: { marginBottom: 18 },
  h: { fontSize: 17, fontWeight: "700", color: colors.dark, marginBottom: 6 },
  p: { fontSize: 15, lineHeight: 22, color: colors.muted },
});
