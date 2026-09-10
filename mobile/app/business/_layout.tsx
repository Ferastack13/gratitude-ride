import { AppTabBar } from "@/components/navigation/AppTabBar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function BusinessLayout() {
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
  // Only bounce when we know they chose passenger (null = still ok / default)
  if (accountType === "passenger") {
    return <Redirect href={"/passenger" as never} />;
  }

  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: colors.surface, flex: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
      <Tabs.Screen name="billing" options={{ title: "Billing" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
      <Tabs.Screen
        name="book"
        options={{ href: null, headerShown: false, title: "Book" }}
      />
      <Tabs.Screen
        name="track/[id]"
        options={{ href: null, headerShown: false, title: "Track" }}
      />
    </Tabs>
  );
}
