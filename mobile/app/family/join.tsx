import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import {
  acceptFamilyInvite,
  peekFamilyInvite,
  stashPendingFamilyCode,
  type FamilyInvitePreview,
} from "@/lib/family";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FamilyJoinScreen() {
  const { session } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState((params.code ?? "").toString().toUpperCase());
  const [preview, setPreview] = useState<FamilyInvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const incoming = (params.code ?? "").toString().trim().toUpperCase();
    if (incoming) {
      setCode(incoming);
      stashPendingFamilyCode(incoming).catch(() => undefined);
    }
  }, [params.code]);

  useEffect(() => {
    let cancelled = false;
    const lookup = async () => {
      const c = code.trim().toUpperCase();
      if (c.length < 4) {
        setPreview(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const p = await peekFamilyInvite(c);
      if (cancelled) return;
      setPreview(p);
      setLoading(false);
    };
    const t = setTimeout(lookup, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [code]);

  const goSignup = async () => {
    const c = code.trim().toUpperCase();
    if (c) await stashPendingFamilyCode(c);
    router.push(
      `/register?accountType=passenger&familyCode=${encodeURIComponent(c)}` as never
    );
  };

  const goLogin = async () => {
    const c = code.trim().toUpperCase();
    if (c) await stashPendingFamilyCode(c);
    router.push(`/login?familyCode=${encodeURIComponent(c)}` as never);
  };

  const onAccept = async () => {
    const c = code.trim().toUpperCase();
    if (!c) {
      setError("Enter the family code from your invite.");
      return;
    }
    setBusy(true);
    setError(null);
    await stashPendingFamilyCode(c);
    const res = await acceptFamilyInvite(c);
    setBusy(false);
    if (!res.ok) {
      setError(res.message ?? "Couldn’t accept this invite.");
      return;
    }
    setDone(
      res.already
        ? "You’re already on this family profile."
        : `You’re in ${preview?.inviter_name ?? "the"} family.`
    );
  };

  const withdrawn = preview?.status === "cancelled";
  const already = preview?.status === "accepted";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <Pressable style={styles.close} onPress={() => router.replace("/")}>
        <Ionicons name="close" size={24} color={colors.dark} />
      </Pressable>

      <View style={styles.badge}>
        <Ionicons name="people" size={22} color={colors.primary} />
      </View>
      <Text style={styles.title}>You’re invited</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : preview ? (
        <>
          <Text style={styles.lead}>
            {preview.inviter_name} wants {preview.invitee_name} on their
            Gratitude family profile so they can cover trips.
          </Text>
          {withdrawn ? (
            <Text style={styles.warn}>This invite was withdrawn.</Text>
          ) : already ? (
            <Text style={styles.ok}>This invite was already accepted.</Text>
          ) : null}
        </>
      ) : (
        <Text style={styles.lead}>
          Enter the family code from WhatsApp, SMS, or the QR they showed you.
        </Text>
      )}

      <Text style={styles.label}>Family code</Text>
      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
        autoCapitalize="characters"
        placeholder="GR7K2P"
        placeholderTextColor={colors.mutedLight}
        style={styles.input}
      />

      {error ? <Text style={styles.warn}>{error}</Text> : null}
      {done ? <Text style={styles.ok}>{done}</Text> : null}

      {session ? (
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
          onPress={done ? () => router.replace("/") : onAccept}
          disabled={busy || withdrawn}
        >
          <Text style={styles.ctaText}>
            {busy ? "Joining…" : done ? "Continue" : "Accept invite"}
          </Text>
        </Pressable>
      ) : (
        <>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={goSignup}
            disabled={withdrawn}
          >
            <Text style={styles.ctaText}>Create account & join</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.85 }]}
            onPress={goLogin}
          >
            <Text style={styles.secondaryText}>I already have an account</Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    color: colors.dark,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  lead: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 12,
  },
  warn: {
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  ok: {
    color: colors.success,
    backgroundColor: colors.successSoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  secondary: {
    alignItems: "center",
    paddingVertical: 16,
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
});
