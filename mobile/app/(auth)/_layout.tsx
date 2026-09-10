import { colors } from "@/constants/theme";
import { homeForRole, useAuth } from "@/context/auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { session, profile, accountType, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href={homeForRole(profile?.role, accountType) as never} />;
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
