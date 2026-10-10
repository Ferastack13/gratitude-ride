import { AppTabBar } from "@/components/navigation/AppTabBar";
import { colors } from "@/constants/theme";
import { homeForRole, useAuth } from "@/context/auth";
import { ensureDriverIdentity } from "@/lib/driver-bootstrap";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Driver shell. Phase 0 hardens entry:
 * - session required
 * - non-driver clients redirected away
 * - on enter: ensure riders row + users.role = rider
 */
export default function RiderLayout() {
  const { session, loading, ready, profile, accountType, refreshProfile } =
    useAuth();
  const [bootstrapping, setBootstrapping] = useState(true);
  const didBootstrap = useRef(false);

  useEffect(() => {
    if (!ready || loading) return;

    if (!session?.user?.id) {
      setBootstrapping(false);
      return;
    }

    if (
      profile?.role === "client" &&
      accountType &&
      accountType !== "driver"
    ) {
      setBootstrapping(false);
      return;
    }

    if (didBootstrap.current) {
      setBootstrapping(false);
      return;
    }

    let cancelled = false;
    setBootstrapping(true);

    (async () => {
      try {
        await ensureDriverIdentity(session.user.id);
        if (!cancelled) {
          await refreshProfile();
          didBootstrap.current = true;
        }
      } catch (err) {
        console.warn("[rider] ensureDriverIdentity failed", err);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    loading,
    session?.user?.id,
    profile?.role,
    accountType,
    refreshProfile,
  ]);

  if (loading || !ready || bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (profile?.role === "client" && accountType && accountType !== "driver") {
    return <Redirect href={homeForRole(profile.role, accountType) as never} />;
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
      <Tabs.Screen name="orders" options={{ title: "Discover" }} />
      <Tabs.Screen name="earnings" options={{ title: "Earnings" }} />
      <Tabs.Screen name="inbox" options={{ title: "Inbox" }} />
      <Tabs.Screen name="profile" options={{ title: "Menu" }} />
      <Tabs.Screen
        name="account"
        options={{ href: null, headerShown: false, title: "Account" }}
      />
      <Tabs.Screen
        name="vehicle"
        options={{ href: null, headerShown: false, title: "Vehicle" }}
      />
      <Tabs.Screen
        name="payouts"
        options={{ href: null, headerShown: false, title: "Payouts" }}
      />
      <Tabs.Screen
        name="active/[id]"
        options={{
          href: null,
          headerShown: false,
          title: "Active",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
