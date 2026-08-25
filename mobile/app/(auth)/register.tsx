import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/constants/theme";
import { getAuthRedirectUri } from "@/lib/auth-redirect";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Role = "client" | "rider";

export default function RegisterScreen() {
  const [role, setRole] = useState<Role>("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role,
          vehicle_type: role === "rider" ? vehicleType.trim() : undefined,
        },
        emailRedirectTo: getAuthRedirectUri(),
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
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
      <Text style={styles.subtitle}>Join as a {role}</Text>

      <View style={styles.toggle}>
        {(["client", "rider"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setRole(item)}
            style={[styles.toggleBtn, role === item && styles.toggleActive]}
          >
            <Text
              style={[
                styles.toggleLabel,
                role === item && styles.toggleLabelActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

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
          placeholder="Motorcycle, Bicycle, Car..."
          value={vehicleType}
          onChangeText={setVehicleType}
        />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <Button label="Create Account" onPress={onSubmit} loading={loading} />

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
  toggle: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  toggleActive: { backgroundColor: colors.primary },
  toggleLabel: { textTransform: "capitalize", fontWeight: "700", color: colors.muted },
  toggleLabelActive: { color: colors.white },
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
  link: { color: colors.primary, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  muted: { color: colors.muted },
});
