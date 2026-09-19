import "react-native-gesture-handler";

import { AuthProvider } from "@/context/auth";
import { ThemeProvider, useAppTheme } from "@/context/theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { colors, scheme } = useAppTheme();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="client" />
        <Stack.Screen name="rider" />
        <Stack.Screen name="passenger" />
        <Stack.Screen name="family" />
        <Stack.Screen name="business" />
      </Stack>
    </>
  );
}
