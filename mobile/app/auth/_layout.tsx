import { colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function AuthCallbackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    />
  );
}
