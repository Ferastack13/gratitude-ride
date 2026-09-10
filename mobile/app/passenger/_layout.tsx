import { AppTabBar } from "@/components/navigation/AppTabBar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

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
      <Tabs.Screen name="services" options={{ title: "Services" }} />
      <Tabs.Screen name="activity" options={{ title: "Activity" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
      <Tabs.Screen
        name="where-to"
        options={{ href: null, headerShown: false, title: "Where to" }}
      />
      <Tabs.Screen
        name="plan"
        options={{ href: null, headerShown: false, title: "Plan" }}
      />
      <Tabs.Screen
        name="book"
        options={{ href: null, headerShown: false, title: "Book" }}
      />
      <Tabs.Screen
        name="track/[id]"
        options={{ href: null, headerShown: false, title: "Track" }}
      />
      <Tabs.Screen
        name="trip/[id]"
        options={{ href: null, headerShown: false, title: "Trip" }}
      />
    </Tabs>
  );
}
