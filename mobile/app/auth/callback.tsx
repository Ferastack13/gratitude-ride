import { colors } from "@/constants/theme";
import { handleAuthRedirectUrl } from "@/lib/handle-auth-url";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const [message, setMessage] = useState("Finishing sign in…");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const url = await Linking.getInitialURL();
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === "string") query.set(key, value);
        else if (Array.isArray(value) && value[0]) query.set(key, value[0]);
      });

      const callbackUrl =
        url && url.includes("auth/callback")
          ? url
          : query.toString()
            ? `gratituderide://auth/callback?${query.toString()}`
            : url;

      if (!callbackUrl) {
        if (!cancelled) {
          setMessage("Missing auth callback.");
          router.replace("/login");
        }
        return;
      }

      const result = await handleAuthRedirectUrl(callbackUrl);
      if (cancelled) return;

      if (result.ok) {
        router.replace("/");
        return;
      }

      router.replace(
        `/login?error=${encodeURIComponent(result.error)}` as `/login?error=${string}`
      );
    };

    finish();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.surface,
    padding: 24,
  },
  text: { color: colors.muted, textAlign: "center" },
});
