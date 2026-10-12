import { AppTabBar } from "@/components/navigation/AppTabBar";
import { useColors } from "@/context/theme";
import { Tabs } from "expo-router";

/** Permanent business tabs — Home · Bookings · Billing · Account */
export default function BusinessTabsLayout() {
  const colors = useColors();
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
    </Tabs>
  );
}
