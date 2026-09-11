import { Button } from "@/components/ui/Button";
import { ComfortRideDetails } from "@/components/passenger/ComfortRideDetails";
import { ExpressRideDetails } from "@/components/passenger/ExpressRideDetails";
import { StandardRideDetails } from "@/components/passenger/StandardRideDetails";
import { colors } from "@/constants/theme";
import { COMFORT_RIDE_CONTENT } from "@/lib/comfort-ride-content";
import { EXPRESS_RIDE_CONTENT } from "@/lib/express-ride-content";
import { STANDARD_RIDE_CONTENT } from "@/lib/standard-ride-content";
import {
  isRideOptionId,
  rideOptionById,
} from "@/lib/ride-options";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Service details → existing where-to → plan booking with serviceId.
 * Standard, Express, and Comfort each have dedicated rich details.
 * No live map / driver GPS on this screen.
 */
export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = isRideOptionId(id) ? id : "standard";
  const option = rideOptionById(serviceId);

  const startBooking = () => {
    router.push({
      pathname: "/passenger/where-to",
      params: {
        serviceId: option.id,
        focus: "dropoff",
      },
    } as never);
  };

  const ctaLabel =
    serviceId === "standard"
      ? STANDARD_RIDE_CONTENT.ctaLabel
      : serviceId === "express"
        ? EXPRESS_RIDE_CONTENT.ctaLabel
        : COMFORT_RIDE_CONTENT.ctaLabel;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.head}>
        <Pressable
          style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.dark} />
        </Pressable>
        <Text style={styles.headLabel}>Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {serviceId === "standard" ? (
          <StandardRideDetails />
        ) : serviceId === "express" ? (
          <ExpressRideDetails />
        ) : (
          <ComfortRideDetails />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label={ctaLabel} onPress={startBooking} size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  headLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
