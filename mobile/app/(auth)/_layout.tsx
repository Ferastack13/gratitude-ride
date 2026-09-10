import { colors } from "@/constants/theme";
import { homeForRole, useAuth } from "@/context/auth";
import { homeForAccount } from "@/lib/account-type";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { session, profile, accountType, loading, ready } = useAuth();

  if (!loading && ready && session) {
    const dest = homeForAccount(profile?.role, accountType);
    // Never Redirect to /login from auth while signed in — that loops forever.
    if (dest && dest !== "/login") {
      return <Redirect href={homeForRole(profile?.role, accountType) as never} />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    />
  );
}
