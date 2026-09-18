import { SettingsShell, useSettingsState } from "@/components/settings/SettingsChrome";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SettingsProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const { settings, palette, ready } = useSettingsState();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [saving, setSaving] = useState(false);

  if (!ready || !settings) return null;

  const onSave = async () => {
    if (!profile?.id) return;
    if (name.trim().length < 2) {
      Alert.alert("Name required", "Enter your full name.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        full_name: name.trim(),
        phone: phone.trim() || null,
      })
      .eq("id", profile.id);
    if (error) {
      setSaving(false);
      Alert.alert("Couldn’t save", error.message);
      return;
    }
    const authPatch: { data: { full_name: string; phone: string }; email?: string } = {
      data: { full_name: name.trim(), phone: phone.trim() },
    };
    if (email.trim() && email.trim() !== profile.email) {
      authPatch.email = email.trim();
    }
    const { error: authError } = await supabase.auth.updateUser(authPatch);
    setSaving(false);
    if (authError) {
      Alert.alert("Profile saved", authError.message);
    } else {
      Alert.alert(
        "Saved",
        email.trim() !== profile.email
          ? "Check your email if you changed your address."
          : "Your profile is up to date."
      );
    }
    await refreshProfile();
  };

  return (
    <SettingsShell title="Profile" palette={palette} settings={settings}>
      <Text style={[styles.label, { color: palette.muted }]}>Full name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.card },
        ]}
        placeholderTextColor={palette.muted}
      />
      <Text style={[styles.label, { color: palette.muted }]}>Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={[
          styles.input,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.card },
        ]}
        placeholder="+234 800 000 0000"
        placeholderTextColor={palette.muted}
      />
      <Text style={[styles.label, { color: palette.muted }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          { color: palette.text, borderColor: palette.border, backgroundColor: palette.card },
        ]}
        placeholderTextColor={palette.muted}
      />
      <Pressable
        style={[styles.save, saving && { opacity: 0.7 }]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>{saving ? "Saving…" : "Save changes"}</Text>
      </Pressable>
      <View style={{ height: 8 }} />
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  save: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
