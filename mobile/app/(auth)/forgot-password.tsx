import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { getAuthRedirectUri } from "@/lib/auth-redirect";
import { supabase } from "@/lib/supabase";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: getAuthRedirectUri(),
      }
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("If an account exists for that email, a reset link has been sent.");
  };

  return (
    <Screen>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we'll send a reset link
      </Text>
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <Button label="Send Reset Link" onPress={onSubmit} loading={loading} />
      <Link href="/login" style={styles.link}>
        Back to sign in
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: "800", color: colors.dark },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 8 },
  error: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
  },
  success: {
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    padding: 12,
    borderRadius: 12,
  },
  link: { color: colors.primary, fontWeight: "700", textAlign: "center" },
});
