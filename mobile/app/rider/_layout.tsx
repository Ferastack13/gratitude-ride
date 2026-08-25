import { AppTabBar } from "@/components/navigation/AppTabBar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function RiderLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
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
      <Tabs.Screen name="index" options={{ title: "Hub" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="active/[id]"
        options={{ href: null, headerShown: false, title: "Active" }}
      />
    </Tabs>
  );
}
