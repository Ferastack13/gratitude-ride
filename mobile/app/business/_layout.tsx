import { useColors } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/**
 * Business root = Stack.
 * Tabs live in (tabs). Book / plan / track are stack screens — never bottom-nav items.
 */
export default function BusinessLayout() {
  const { session, loading, ready, profile, accountType } = useAuth();
  const colors = useColors();

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
  if (accountType === "passenger") {
    return <Redirect href={"/passenger" as never} />;
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
      <Stack.Screen
        name="where-to"
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="plan" />
      <Stack.Screen name="book" />
      <Stack.Screen name="company-profile" />
      <Stack.Screen name="track/[id]" />
    </Stack>
  );
}
