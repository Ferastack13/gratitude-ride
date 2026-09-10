import { colors } from "@/constants/theme";
import { homeForRole, useAuth } from "@/context/auth";
import { homeForAccount } from "@/lib/account-type";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const { session, profile, accountType, loading, ready } = useAuth();

  if (loading || !ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const dest = homeForAccount(profile?.role, accountType);
  if (!dest) {
    // Session present but role/accountType still resolving — avoid /login loop
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={homeForRole(profile?.role, accountType) as never} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
