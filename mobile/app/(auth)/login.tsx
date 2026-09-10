import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { friendlyAuthError } from "@/lib/supabase-errors";
import { supabase } from "@/lib/supabase";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  const params = useLocalSearchParams<{ error?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.error) return;
    setError(params.error);
  }, [params.error]);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return;
    }
    router.replace("/");
  };

  return (
    <Screen>
      <Text style={styles.brand}>Gratitude Ride</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue your journey</Text>

      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        secureTextEntry
        autoComplete="password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Sign In" onPress={onSubmit} loading={loading} />

      <Link href="/forgot-password" style={styles.link}>
        Forgot password?
      </Link>

      <View style={styles.row}>
        <Text style={styles.muted}>Don't have an account? </Text>
        <Link href={"/choose-account" as never} style={styles.link}>
          Get started
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: { fontSize: 32, fontWeight: "800", color: colors.dark },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 8 },
  error: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  link: { color: colors.primary, fontWeight: "700", textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  muted: { color: colors.muted },
});
