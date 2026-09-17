import { colors, radii, shadows, typography } from "@/constants/theme";
import {
  EMPTY_COPY,
  FILTER_LABELS,
  INBOX_FILTERS,
  getInboxMessages,
  markInboxRead,
  redeemInboxOfferCode,
  type InboxFilter,
  type InboxMessage,
} from "@/lib/inbox";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatWhen(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

const CATEGORY_TINT: Record<
  InboxMessage["category"],
  { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  offers: {
    bg: colors.secondarySoft,
    fg: colors.secondaryDark,
    icon: "pricetag",
  },
  support: {
    bg: colors.primarySoft,
    fg: colors.primary,
    icon: "chatbubbles",
  },
  updates: {
    bg: colors.successSoft,
    fg: colors.success,
    icon: "notifications",
  },
  priority: {
    bg: colors.dangerSoft,
    fg: colors.danger,
    icon: "alert-circle",
  },
};

export default function PassengerInboxScreen() {
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingCode, setSavingCode] = useState(false);

  const load = useCallback(async () => {
    const list = await getInboxMessages("all");
    setMessages(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, [load])
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? messages
        : messages.filter((m) => m.category === filter),
    [filter, messages]
  );

  const empty = EMPTY_COPY[filter];

  const onRefresh = async () => {
    setRefreshing(true);
    await load().catch(() => undefined);
    setRefreshing(false);
  };

  const onAddCode = async () => {
    if (!code.trim() || savingCode) return;
    setSavingCode(true);
    const res = await redeemInboxOfferCode(code);
    setSavingCode(false);
    if (!res.ok) {
      Alert.alert("Invalid code", "Try GRAT10, WELCOME, or EXPRESS.");
      return;
    }
    setMessages(res.messages);
    setCode("");
    setFilter("offers");
    Alert.alert("Offer saved", res.label ?? "Your offer code was added.");
  };

  const onOpenMessage = async (msg: InboxMessage) => {
    if (!msg.read) {
      const next = await markInboxRead(msg.id);
      setMessages(next);
    }
    if (msg.category === "support") {
      Linking.openURL("https://wa.me/2348000000000").catch(() => undefined);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            style={styles.close}
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityLabel="Close inbox"
          >
            <Ionicons name="close" size={26} color={colors.dark} />
          </Pressable>
        </View>

        <Text style={styles.title}>Inbox</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {INBOX_FILTERS.map((id) => {
            const on = filter === id;
            return (
              <Pressable
                key={id}
                onPress={() => setFilter(id)}
                style={({ pressed }) => [
                  styles.chip,
                  on && styles.chipOn,
                  pressed && { opacity: 0.86 },
                ]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {FILTER_LABELS[id]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.codeRow}>
          <Ionicons name="pricetag" size={16} color={colors.muted} />
          <TextInput
            style={styles.codeInput}
            placeholder="Add new offer code"
            placeholderTextColor={colors.mutedLight}
            autoCapitalize="characters"
            autoCorrect={false}
            value={code}
            onChangeText={setCode}
            onSubmitEditing={onAddCode}
            returnKeyType="done"
          />
          {savingCode ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : code.trim() ? (
            <Pressable onPress={onAddCode} hitSlop={8}>
              <Text style={styles.codeAdd}>Add</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.mailbox}>
              <View style={styles.mailboxFlag} />
              <Ionicons name="file-tray" size={42} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>{empty.title}</Text>
            <Text style={styles.emptyBody}>{empty.body}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.refresh,
                pressed && { opacity: 0.88 },
              ]}
              onPress={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.dark} />
              ) : (
                <Text style={styles.refreshText}>Refresh</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {visible.map((msg) => {
              const tint = CATEGORY_TINT[msg.category];
              return (
                <Pressable
                  key={msg.id}
                  onPress={() => onOpenMessage(msg)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <View style={[styles.cardIcon, { backgroundColor: tint.bg }]}>
                    <Ionicons name={tint.icon} size={18} color={tint.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTop}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {msg.title}
                      </Text>
                      {!msg.read ? <View style={styles.unread} /> : null}
                    </View>
                    <Text style={styles.cardBody} numberOfLines={2}>
                      {msg.body}
                    </Text>
                    <Text style={styles.cardTime}>{formatWhen(msg.createdAt)}</Text>
                  </View>
                </Pressable>
              );
            })}
            <Pressable
              style={({ pressed }) => [
                styles.refresh,
                { alignSelf: "center", marginTop: 8 },
                pressed && { opacity: 0.88 },
              ]}
              onPress={onRefresh}
            >
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.6,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.dark,
  },
  chipTextOn: {
    color: colors.white,
  },
  codeRow: {
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeInput: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    paddingVertical: 12,
    fontWeight: "500",
  },
  codeAdd: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingBottom: 48,
    gap: 10,
  },
  mailbox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    ...shadows.soft,
  },
  mailboxFlag: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 10,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  emptyTitle: {
    ...typography.bodyStrong,
    fontSize: 18,
    textAlign: "center",
  },
  emptyBody: {
    ...typography.supporting,
    textAlign: "center",
    maxWidth: 280,
  },
  refresh: {
    marginTop: 10,
    minWidth: 108,
    minHeight: 40,
    paddingHorizontal: 22,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.dark,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadows.card,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
  },
  unread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  cardBody: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  cardTime: {
    marginTop: 6,
    fontSize: 12,
    color: colors.mutedLight,
    fontWeight: "500",
  },
});
