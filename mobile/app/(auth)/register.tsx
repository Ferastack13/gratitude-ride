import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import {
  accountTypeLabel,
  roleForAccountType,
  setAccountType,
  type AccountType,
} from "@/lib/account-type";
import { getAuthRedirectUri } from "@/lib/auth-redirect";
import { friendlyAuthError } from "@/lib/supabase-errors";
import { supabase } from "@/lib/supabase";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ accountType?: string }>();
  const accountType = (
    params.accountType === "driver" ||
    params.accountType === "passenger" ||
    params.accountType === "business"
      ? params.accountType
      : "passenger"
  ) as AccountType;

  const role = roleForAccountType(accountType);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAccountType(accountType).catch(() => undefined);
  }, [accountType]);

  const onSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    await setAccountType(accountType);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role,
          account_type: accountType,
          vehicle_type: role === "rider" ? vehicleType.trim() : undefined,
        },
        emailRedirectTo: getAuthRedirectUri(),
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(friendlyAuthError(signUpError.message));
      return;
    }

    if (data.user && !data.session) {
      setMessage("Account created. Check your email to confirm, then sign in.");
      return;
    }

    router.replace("/");
  };

  return (
    <Screen>
      <Text style={styles.brand}>Gratitude Ride</Text>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>
        Joining as {accountTypeLabel(accountType)}
      </Text>

      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Adaeze Okonkwo"
        value={fullName}
        onChangeText={setFullName}
      />
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
        label="Phone"
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="+234 800 000 0000"
        value={phone}
        onChangeText={setPhone}
      />
      <Input
        label="Password"
        secureTextEntry
        autoComplete="new-password"
        placeholder="Min. 8 characters"
        value={password}
        onChangeText={setPassword}
      />
      {role === "rider" ? (
        <Input
          label="Vehicle type"
          placeholder="Car, Motorcycle, Bicycle..."
          value={vehicleType}
          onChangeText={setVehicleType}
        />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <Button label="Create Account" onPress={onSubmit} loading={loading} />

      <Link href={"/choose-account" as never} style={styles.link}>
        Change account type
      </Link>

      <View style={styles.row}>
        <Text style={styles.muted}>Already have an account? </Text>
        <Link href="/login" style={styles.link}>
          Sign in
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
  subtitle: { fontSize: 15, color: colors.muted },
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
  row: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  muted: { color: colors.muted },
});
