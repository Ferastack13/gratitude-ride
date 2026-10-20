import "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/context/auth";
import { ThemeProvider, useAppTheme } from "@/context/theme";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

/** Keep native splash (splash-icon.png) visible until auth bootstrap finishes. */
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function NativeSplashGate() {
  const { ready } = useAuth();
  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);
  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NativeSplashGate />
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
