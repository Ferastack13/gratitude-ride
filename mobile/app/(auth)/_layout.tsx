import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { session, profile, loading } = useAuth();

  if (!loading && session) {
    return <Redirect href={profile?.role === "rider" ? "/rider" : "/client"} />;
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
