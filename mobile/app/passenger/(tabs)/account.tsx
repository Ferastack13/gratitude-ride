import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { colors, typography } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  emphasize,
  muted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  emphasize?: boolean;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.menuIcon,
          emphasize && styles.menuIconOn,
          muted && styles.menuIconMuted,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={
            emphasize ? colors.primary : muted ? colors.mutedLight : colors.dark
          }
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuTitle, muted && { color: colors.muted }]}>
          {title}
        </Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.mutedLight}
      />
    </Pressable>
  );
}

export default function PassengerAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const first = profile?.full_name?.split(" ")[0] ?? "P";

  const soon = (label: string) =>
    Alert.alert(label, "This section is coming soon.");

  return (
    <Screen>
      <Text style={styles.title}>Account</Text>

      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{first.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name ?? "Passenger"}</Text>
          <Text style={styles.meta}>{profile?.email}</Text>
          <Text style={styles.role}>Passenger</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon="wallet-outline"
          title="Wallet"
          subtitle="Coming soon"
          muted
          onPress={() => soon("Wallet")}
        />
        <View style={styles.divider} />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Safety"
          subtitle="Coming soon"
          muted
          onPress={() => soon("Safety")}
        />
        <View style={styles.divider} />
        <MenuItem
          icon="help-circle-outline"
          title="Help"
          subtitle="Chat with support"
          emphasize
          onPress={() => Linking.openURL("https://wa.me/2348000000000")}
        />
        <View style={styles.divider} />
        <MenuItem
          icon="settings-outline"
          title="Settings"
          subtitle="Coming soon"
          muted
          onPress={() => soon("Settings")}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label="Switch to Business"
          variant="outline"
          onPress={async () => {
            await setAccountTypePreference("business");
            router.replace("/business" as never);
          }}
        />
        <Button label="Sign out" variant="ghost" onPress={signOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.pageTitle, marginBottom: 20 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.dark,
    fontWeight: "600",
    fontSize: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.dark,
    letterSpacing: -0.2,
  },
  meta: {
    ...typography.supporting,
    marginTop: 4,
  },
  role: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
    color: colors.muted,
  },
  menu: {
    marginBottom: 28,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconOn: {
    backgroundColor: colors.primarySoft,
  },
  menuIconMuted: {
    backgroundColor: colors.surfaceAlt,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.dark,
  },
  menuSub: {
    ...typography.supporting,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 54,
  },
  actions: {
    gap: 8,
  },
});
