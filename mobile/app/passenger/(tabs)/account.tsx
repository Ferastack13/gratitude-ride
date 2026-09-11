import { colors, radii } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function soon(label: string) {
  Alert.alert(label, "This section is coming soon in Gratitude app.");
}

function Tile({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.88 }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

function Row({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
      onPress={onPress}
    >
      <View style={styles.rowIconWrap}>
        <Ionicons name={icon} size={20} color={colors.dark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={colors.mutedLight} />
    </Pressable>
  );
}

export default function PassengerAccountScreen() {
  const { profile, signOut, setAccountTypePreference } = useAuth();
  const insets = useSafeAreaInsets();
  const name = profile?.full_name ?? "Passenger";
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "1.0.0";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.secondaryDark} />
              <Text style={styles.rating}>5.00</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.avatar,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => soon("Profile")}
          >
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          <Tile
            icon="help-buoy-outline"
            label="Help"
            onPress={() => Linking.openURL("https://wa.me/2348000000000")}
          />
          <Tile
            icon="wallet-outline"
            label="Wallet"
            onPress={() => router.push("/passenger/wallet" as never)}
          />
          <Tile
            icon="shield-checkmark-outline"
            label="Safety"
            onPress={() => soon("Safety")}
          />
          <Tile
            icon="file-tray-outline"
            label="Inbox"
            onPress={() => soon("Inbox")}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
          onPress={() => soon("Safety check-up")}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.cardTitle}>Safety check-up</Text>
            <Text style={styles.cardSub}>Learn ways to make rides safer</Text>
          </View>
          <View style={styles.progressRing}>
            <Text style={styles.progressText}>1/5</Text>
          </View>
        </Pressable>

        <View style={styles.co2}>
          <Text style={styles.co2Label}>Estimated CO₂ saved</Text>
          <View style={styles.co2Value}>
            <Ionicons name="leaf" size={16} color={colors.success} />
            <Text style={styles.co2Num}>0 g</Text>
          </View>
        </View>

        <View style={styles.list}>
          <Row
            icon="people-outline"
            title="Family"
            subtitle="Manage adult and senior accounts"
            onPress={() => soon("Family")}
          />
          <Row
            icon="settings-outline"
            title="Settings"
            onPress={() => soon("Settings")}
          />
          <Row
            icon="phone-portrait-outline"
            title="Simple mode"
            subtitle="A simplified app for older adults"
            badge="NEW"
            onPress={() => soon("Simple mode")}
          />
          <Row
            icon="book-outline"
            title="Contacts"
            subtitle="Manage all your contacts at Gratitude app"
            onPress={() => soon("Contacts")}
          />
          <Row
            icon="person-add-outline"
            title="Earn by driving or delivering"
            onPress={async () => {
              await setAccountTypePreference("driver");
              router.replace("/rider" as never);
            }}
          />
          <Row
            icon="people-circle-outline"
            title="Saved groups"
            badge="NEW"
            onPress={() => soon("Saved groups")}
          />
          <Row
            icon="briefcase-outline"
            title="Set up your business profile"
            subtitle="Automate work travel & meal expenses"
            onPress={async () => {
              await setAccountTypePreference("business");
              router.replace("/business" as never);
            }}
          />
          <Row
            icon="business-outline"
            title="Gratitude for Business"
            onPress={async () => {
              await setAccountTypePreference("business");
              router.replace("/business" as never);
            }}
          />
          <Row
            icon="person-outline"
            title="Manage Gratitude account"
            onPress={() => soon("Manage Gratitude account")}
          />
          <Row
            icon="information-circle-outline"
            title="Legal"
            onPress={() => soon("Legal")}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signOut,
            pressed && { opacity: 0.8 },
          ]}
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.version}>v{version}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  rating: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: "500",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 58,
  },
  tileLabel: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardSub: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  progressRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 5,
    borderColor: colors.border,
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  co2: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  co2Label: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "600",
  },
  co2Value: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  co2Num: {
    color: colors.dark,
    fontSize: 15,
    fontWeight: "700",
  },
  list: {
    gap: 2,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "500",
  },
  rowSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  signOut: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    marginBottom: 12,
  },
  signOutText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  version: {
    color: colors.mutedLight,
    fontSize: 12,
    marginBottom: 8,
  },
});
