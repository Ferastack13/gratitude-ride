import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Passenger root = Stack.
 * Permanent tabs live in (tabs). Ride-booking steps are stack screens
 * (service details, where-to, plan, track, trip) — never bottom-nav items.
 */
export default function PassengerLayout() {
  const { session, loading, ready, profile, accountType } = useAuth();

  if (loading || !ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (profile?.role === "rider" || accountType === "driver") {
    return <Redirect href="/rider" />;
  }
  if (accountType === "business") {
    return <Redirect href={"/business" as never} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="where-to" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="plan" />
      <Stack.Screen name="book" />
      <Stack.Screen name="track/[id]" />
      <Stack.Screen name="trip/[id]" />
    </Stack>
  );
}
