import { AppTabBar } from "@/components/navigation/AppTabBar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ClientLayout() {
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
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="book" options={{ title: "Book" }} />
      <Tabs.Screen name="deliveries" options={{ title: "Deliveries" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="track/[id]"
        options={{ href: null, headerShown: false, title: "Track" }}
      />
    </Tabs>
  );
}
