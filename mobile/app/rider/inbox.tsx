import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors } from "@/constants/theme";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export default function RiderInboxScreen() {
  const [tab, setTab] = useState<"notifications" | "support">("notifications");

  return (
    <Screen>
      <ScreenHeader title="Inbox" />
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === "notifications" && styles.tabOn]}
          onPress={() => setTab("notifications")}
        >
          <Text
            style={[styles.tabText, tab === "notifications" && styles.tabTextOn]}
          >
            Notifications
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "support" && styles.tabOn]}
          onPress={() => setTab("support")}
        >
          <Text style={[styles.tabText, tab === "support" && styles.tabTextOn]}>
            Support
          </Text>
        </Pressable>
      </View>

      {tab === "notifications" ? (
        <EmptyState
          title="You're up to date!"
          message="New trip alerts and account updates will appear here."
        />
      ) : (
        <EmptyState
          title="Need help?"
          message="Chat with Gratitude Ride support for trip or payout questions."
          actionLabel="WhatsApp support"
          onAction={() => Linking.openURL("https://wa.me/2348000000000")}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabOn: { borderBottomColor: colors.dark },
  tabText: { fontWeight: "700", color: colors.muted },
  tabTextOn: { color: colors.dark, fontWeight: "900" },
});
