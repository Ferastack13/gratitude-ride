import { colors } from "@/constants/theme";
import { homeForRole, useAuth } from "@/context/auth";
import { homeForAccount } from "@/lib/account-type";
import { Redirect } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

/** Same asset as expo-splash-screen (`splash-icon.png`). */
const splashLogo = require("../assets/images/splash-icon.png");

function BootSplash() {
  return (
    <View style={styles.splash}>
      <Image
        source={splashLogo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Gratitude Ride"
      />
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

export default function Index() {
  const { session, profile, accountType, loading, ready } = useAuth();

  if (loading || !ready) {
    return <BootSplash />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const dest = homeForAccount(profile?.role, accountType);
  if (!dest) {
    // Session present but role/accountType still resolving — avoid /login loop
    return <BootSplash />;
  }

  return <Redirect href={homeForRole(profile?.role, accountType) as never} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F4ED",
    paddingHorizontal: 32,
  },
  logo: {
    width: "88%",
    maxWidth: 320,
    height: 220,
  },
});
