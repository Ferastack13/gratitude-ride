import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radii } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const SERVICES = [
  {
    id: "standard",
    title: "Ride",
    hint: "Everyday trips across town",
    icon: "car-outline" as const,
  },
  {
    id: "express",
    title: "Express",
    hint: "Faster matching when busy",
    icon: "flash-outline" as const,
  },
  {
    id: "care",
    title: "Comfort",
    hint: "Extra care for special trips",
    icon: "heart-outline" as const,
  },
  {
    id: "schedule",
    title: "Schedule",
    hint: "Book for later",
    icon: "calendar-outline" as const,
  },
] as const;

export default function PassengerServicesScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Services"
        subtitle="Choose how you want to ride"
      />
      <View style={styles.grid}>
        {SERVICES.map((s) => (
          <Pressable
            key={s.id}
            style={styles.tile}
            onPress={() =>
              router.push({
                pathname: "/passenger",
                params: { serviceId: s.id },
              } as never)
            }
          >
            <View style={styles.icon}>
              <Ionicons name={s.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.hint}>{s.hint}</Text>
          </Pressable>
        ))}
      </View>
      <Card tint="blue">
        <Text style={styles.cardTitle}>Need a ride now?</Text>
        <Text style={styles.cardBody}>
          Go to Home and tap Where to? to search your destination.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontWeight: "900", color: colors.dark, fontSize: 16 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  cardTitle: { fontWeight: "900", color: colors.dark },
  cardBody: { color: colors.muted, lineHeight: 20 },
});
