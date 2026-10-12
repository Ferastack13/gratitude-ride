import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { FormCardSkeleton } from "@/components/ui/Skeleton";
import { type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { updateProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

/**
 * Company / business contact details — name + phone on the user profile.
 */
export default function BusinessCompanyProfileScreen() {
  const { profile, session, refreshProfile } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [loading, setLoading] = useState(!profile?.id);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setName(profile?.full_name ?? "");
      setPhone(profile?.phone ?? "");
      setLoading(false);
    }, [profile?.full_name, profile?.phone])
  );

  const onSave = async () => {
    if (!session?.user) return;
    if (name.trim().length < 2) {
      Alert.alert("Name required", "Enter your company or contact name.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(session.user.id, {
        full_name: name.trim(),
        phone: phone.trim() || null,
      });
      await supabase.auth.updateUser({
        data: { full_name: name.trim(), phone: phone.trim() },
      });
      await refreshProfile();
      Alert.alert("Saved", "Company profile updated.");
      router.back();
    } catch (err) {
      Alert.alert(
        "Couldn’t save",
        err instanceof Error ? err.message : "Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Company profile"
        subtitle="Name and phone for bookings"
        onBack={() => router.back()}
      />

      {loading ? (
        <FormCardSkeleton fields={2} />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Company / contact name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Acme Logistics"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="0803 000 0000"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Text style={styles.hint}>
            Shown on your business account. Guest passenger details are still
            collected per trip.
          </Text>
          <Button
            label={saving ? "Saving…" : "Save"}
            onPress={onSave}
            loading={saving}
            disabled={saving}
          />
        </View>
      )}
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    form: { gap: 10 },
    label: { fontSize: 12, fontWeight: "700", color: colors.muted },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      fontWeight: "600",
      color: colors.dark,
    },
    hint: { fontSize: 12, lineHeight: 17, color: colors.muted, marginBottom: 4 },
  });
}
