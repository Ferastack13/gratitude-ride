import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { colors, radii, shadows } from "@/constants/theme";
import { RIDE_OPTIONS } from "@/lib/ride-options";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PassengerServicesScreen() {
  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.sub}>Choose how you want to ride</Text>
      </View>

      <View style={styles.list}>
        {RIDE_OPTIONS.map((s) => (
          <Pressable
            key={s.id}
            style={({ pressed }) => [
              styles.tile,
              pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
            onPress={() =>
              router.push({
                pathname: "/passenger/where-to",
                params: { serviceId: s.id },
              } as never)
            }
          >
            <View style={styles.icon}>
              <Ionicons name={s.icon} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tileTitle}>{s.title}</Text>
              <Text style={styles.hint}>{s.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
          </Pressable>
        ))}
      </View>

      <Card tint="blue">
        <Text style={styles.cardTitle}>Need a ride now?</Text>
        <Text style={styles.cardBody}>
          Tap a service above, or use Where to? on Home to set pickup and
          destination.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4, marginBottom: 4 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  sub: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  list: { gap: 12 },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadows.card,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: { fontWeight: "900", color: colors.dark, fontSize: 17 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  cardTitle: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  cardBody: { color: colors.muted, lineHeight: 20, marginTop: 4 },
});
