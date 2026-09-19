import {
  SectionLabel,
  SettingsRow,
  useSettingsState,
} from "@/components/settings/SettingsChrome";
import { useAppTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { getSavedPlaces } from "@/lib/client-prefs";
import {
  appearanceSubtitle,
  nearbySubtitle,
  reserveSubtitle,
} from "@/lib/settings";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsHomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const { settings, palette, ready } = useSettingsState();
  const { colors, scheme } = useAppTheme();
  const [homeLabel, setHomeLabel] = useState("Add home");
  const [workLabel, setWorkLabel] = useState("Add work");

  useFocusEffect(
    useCallback(() => {
      getSavedPlaces()
        .then((s) => {
          setHomeLabel(s.home?.title ? s.home.title : "Add home");
          setWorkLabel(s.work?.title ? s.work.title : "Add work");
        })
        .catch(() => undefined);
    }, [])
  );

  const switchAccount = () => {
    Alert.alert("Switch account", "Choose how you want to use Gratitude Ride.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Passenger",
        onPress: async () => {
          await setAccountTypePreference("passenger");
          router.replace("/passenger" as never);
        },
      },
      {
        text: "Driver",
        onPress: async () => {
          await setAccountTypePreference("driver");
          router.replace("/rider" as never);
        },
      },
      {
        text: "Business",
        onPress: async () => {
          await setAccountTypePreference("business");
          router.replace("/business" as never);
        },
      },
    ]);
  };

  if (!ready || !settings) {
    return (
      <View style={[styles.boot, { backgroundColor: palette.bg }]}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  const name = profile?.full_name ?? "Passenger";
  const phone = profile?.phone || "Add phone number";
  const email = profile?.email ?? "";

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <View style={styles.head}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 36 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [styles.profile, pressed && { opacity: 0.85 }]}
          onPress={() => router.push("/passenger/settings/profile" as never)}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: palette.text }]}>{name}</Text>
            <Text style={[styles.profileMeta, { color: palette.muted }]}>{phone}</Text>
            {email ? (
              <Text style={[styles.profileMeta, { color: palette.muted }]} numberOfLines={1}>
                {email}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={16} color={palette.muted} />
        </Pressable>

        <View style={styles.pad}>
          <SectionLabel label="App settings" palette={palette} />
          <SettingsRow
            icon="home-outline"
            title={homeLabel === "Add home" ? "Add home" : "Home"}
            subtitle={homeLabel === "Add home" ? undefined : homeLabel}
            palette={palette}
            onPress={() =>
              router.push({
                pathname: "/passenger/where-to",
                params: { saveAs: "home", intent: "save" },
              } as never)
            }
          />
          <SettingsRow
            icon="briefcase-outline"
            title={workLabel === "Add work" ? "Add work" : "Work"}
            subtitle={workLabel === "Add work" ? undefined : workLabel}
            palette={palette}
            onPress={() =>
              router.push({
                pathname: "/passenger/where-to",
                params: { saveAs: "work", intent: "save" },
              } as never)
            }
          />
          <SettingsRow
            icon="location-outline"
            title="Shortcuts"
            palette={palette}
            onPress={() => router.push("/passenger/settings/shortcuts" as never)}
          />
          <SettingsRow
            icon="lock-closed-outline"
            title="Privacy"
            subtitle="Manage the data you share with us"
            palette={palette}
            onPress={() => router.push("/passenger/settings/privacy" as never)}
          />
          <SettingsRow
            icon="contrast-outline"
            title="Appearance"
            subtitle={appearanceSubtitle(settings.appearance)}
            palette={palette}
            onPress={() => router.push("/passenger/settings/appearance" as never)}
          />
          <SettingsRow
            icon="accessibility-outline"
            title="Accessibility"
            subtitle="Manage your accessibility settings"
            palette={palette}
            onPress={() => router.push("/passenger/settings/accessibility" as never)}
          />
          <SettingsRow
            icon="call-outline"
            title="Communication"
            subtitle="Choose your preferred contact methods and manage your notification settings"
            palette={palette}
            last
            onPress={() =>
              router.push("/passenger/settings/communication" as never)
            }
          />

          <SectionLabel label="Trip preferences" palette={palette} />
          <SettingsRow
            icon="cash-outline"
            title="Tip automatically"
            subtitle={
              settings.defaultTipPercent === 0
                ? "No default tip"
                : `${settings.defaultTipPercent}% on every trip`
            }
            palette={palette}
            onPress={() => router.push("/passenger/settings/tip" as never)}
          />
          <SettingsRow
            icon="calendar-outline"
            title="Reserve"
            subtitle={reserveSubtitle(settings.reserveMatch)}
            palette={palette}
            onPress={() => router.push("/passenger/settings/reserve" as never)}
          />
          <SettingsRow
            icon="phone-portrait-outline"
            title="Driver nearby alert"
            subtitle={nearbySubtitle(settings.nearbyAlert)}
            palette={palette}
            onPress={() => router.push("/passenger/settings/nearby" as never)}
          />
          <SettingsRow
            icon="notifications-outline"
            title="Commute alerts"
            subtitle={
              settings.commute.enabled
                ? `${settings.commute.morning} · ${settings.commute.evening}`
                : "Get notifications to request rides at the right time"
            }
            palette={palette}
            last
            onPress={() => router.push("/passenger/settings/commute" as never)}
          />

          <Pressable
            style={({ pressed }) => [styles.plain, pressed && { opacity: 0.75 }]}
            onPress={switchAccount}
          >
            <Text style={[styles.plainText, { color: palette.text }]}>
              Switch account
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.plain, pressed && { opacity: 0.75 }]}
            onPress={signOut}
          >
            <Text style={[styles.signOut, { color: palette.danger }]}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: "center", justifyContent: "center" },
  root: { flex: 1 },
  head: { paddingHorizontal: 8, paddingTop: 6 },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.6,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "700",
    fontSize: 22,
  },
  profileName: { fontSize: 16, fontWeight: "700" },
  profileMeta: { fontSize: 13, marginTop: 2 },
  pad: { paddingHorizontal: 16 },
  plain: { paddingVertical: 16 },
  plainText: { fontSize: 16, fontWeight: "600" },
  signOut: {
    fontSize: 16,
    fontWeight: "700",
  },
});
