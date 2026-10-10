import { EmptyState } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/auth";
import { useColors } from "@/context/theme";
import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type NotificationRow = Tables<"notifications">;

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function RiderInboxScreen() {
  const { session } = useAuth();
  const colors = useColors();
  const [tab, setTab] = useState<"notifications" | "support">("notifications");
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) throw new Error(error.message);
      setItems(data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  const markRead = async (row: NotificationRow) => {
    if (row.is_read) return;
    setItems((prev) =>
      prev.map((n) => (n.id === row.id ? { ...n, is_read: true } : n))
    );
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", row.id);
  };

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Inbox" />
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <Pressable
          style={[
            styles.tab,
            tab === "notifications" && { borderBottomColor: colors.dark },
          ]}
          onPress={() => setTab("notifications")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.muted },
              tab === "notifications" && {
                color: colors.dark,
                fontWeight: "900",
              },
            ]}
          >
            Notifications
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            tab === "support" && { borderBottomColor: colors.dark },
          ]}
          onPress={() => setTab("support")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.muted },
              tab === "support" && { color: colors.dark, fontWeight: "900" },
            ]}
          >
            Support
          </Text>
        </Pressable>
      </View>

      {tab === "support" ? (
        <EmptyState
          title="Need help?"
          message="Chat with Gratitude Ride support for trip or payout questions."
          actionLabel="WhatsApp support"
          onAction={() => Linking.openURL(SENIOR_SUPPORT_WHATSAPP)}
        />
      ) : loading && !refreshing ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 24, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {items.length === 0 ? (
            <EmptyState
              title="You're up to date!"
              message="New trip alerts and account updates will appear here."
            />
          ) : (
            items.map((row) => (
              <Pressable
                key={row.id}
                onPress={() => void markRead(row)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    opacity: row.is_read ? 0.75 : 1,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.cardTitle, { color: colors.dark }]}>
                    {row.title}
                  </Text>
                  {!row.is_read ? (
                    <View
                      style={[
                        styles.unread,
                        { backgroundColor: colors.secondary },
                      ]}
                    />
                  ) : null}
                </View>
                <Text style={[styles.cardBody, { color: colors.muted }]}>
                  {row.message}
                </Text>
                <Text style={[styles.cardWhen, { color: colors.mutedLight }]}>
                  {formatWhen(row.created_at)}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontWeight: "700" },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: { flex: 1, fontWeight: "800", fontSize: 15 },
  unread: { width: 8, height: 8, borderRadius: 4 },
  cardBody: { fontSize: 13, lineHeight: 18 },
  cardWhen: { fontSize: 11, fontWeight: "600", marginTop: 2 },
});
