import { colors } from "@/constants/theme";
import {
  FILTER_LABELS,
  INBOX_FILTERS,
  getInboxMessages,
  redeemInboxOfferCode,
  type InboxFilter,
} from "@/lib/inbox";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BG = "#111613";
const FIELD = "#2C322E";
const CHIP_OFF = "#2C322E";
const MUTED = "#A8ADA8";

function MailboxArt() {
  return (
    <View style={art.wrap} accessibilityElementsHidden>
      <View style={art.flagPole} />
      <View style={art.flag} />
      <View style={art.body}>
        <View style={art.lid} />
        <View style={art.door} />
      </View>
    </View>
  );
}

export default function PassengerInboxScreen() {
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [code, setCode] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savingCode, setSavingCode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getInboxMessages("all").catch(() => undefined);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await getInboxMessages("all").catch(() => undefined);
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
    setCode("");
    Alert.alert("Offer saved", res.label ?? "Your offer code was added.");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar style="light" />

      <Pressable
        style={styles.close}
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityLabel="Close inbox"
      >
        <Ionicons name="close" size={26} color={colors.white} />
      </Pressable>

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
              style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {FILTER_LABELS[id]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.codeRow}>
        <Ionicons name="pricetag" size={15} color={MUTED} />
        <TextInput
          style={styles.codeInput}
          placeholder="Add new offer code"
          placeholderTextColor={MUTED}
          autoCapitalize="characters"
          autoCorrect={false}
          value={code}
          onChangeText={setCode}
          onSubmitEditing={onAddCode}
          returnKeyType="done"
          selectionColor={colors.secondary}
        />
        {savingCode ? (
          <ActivityIndicator size="small" color={colors.secondary} />
        ) : null}
      </View>

      <View style={styles.emptyWrap}>
        <MailboxArt />
        <Text style={styles.emptyTitle}>No new messages</Text>
        <Text style={styles.emptyBody}>
          Check back for offers and important notifications.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.refresh,
            pressed && { opacity: 0.8 },
          ]}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.refreshText}>Refresh</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const art = StyleSheet.create({
  wrap: {
    width: 88,
    height: 72,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  flagPole: {
    position: "absolute",
    right: 18,
    top: 2,
    width: 5,
    height: 34,
    borderRadius: 1,
    backgroundColor: "#1A1C1A",
  },
  flag: {
    position: "absolute",
    right: 22,
    top: 4,
    width: 16,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#1A1C1A",
  },
  body: {
    width: 58,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F1EC",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  lid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#DDD8CE",
  },
  door: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#C8C3B8",
    marginTop: 6,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  close: {
    width: 44,
    height: 44,
    marginLeft: 8,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chips: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipOn: {
    backgroundColor: colors.surface,
  },
  chipOff: {
    backgroundColor: CHIP_OFF,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: MUTED,
  },
  chipTextOn: {
    color: colors.dark,
  },
  codeRow: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: FIELD,
    borderRadius: 22,
    paddingHorizontal: 16,
    minHeight: 46,
  },
  codeInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    paddingVertical: 12,
    fontWeight: "400",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 72,
    gap: 8,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  emptyBody: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 6,
  },
  refresh: {
    marginTop: 8,
    minWidth: 96,
    minHeight: 38,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: FIELD,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
