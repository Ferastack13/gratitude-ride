import { colors, radii, shadows, typography } from "@/constants/theme";
import {
  addPromoCode,
  addVoucherCode,
  addWalletFunds,
  getPaymentMethod,
  getPromoCodes,
  getVoucherCodes,
  getWalletBalance,
  setPaymentMethod,
  type PaymentMethod,
} from "@/lib/client-prefs";
import { useAuth } from "@/context/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatNgn(amount: number) {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PassengerWalletScreen() {
  const { setAccountTypePreference } = useAuth();
  const [balance, setBalance] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [vouchers, setVouchers] = useState<string[]>([]);
  const [promos, setPromos] = useState<string[]>([]);
  const [voucherDraft, setVoucherDraft] = useState("");
  const [promoDraft, setPromoDraft] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const refresh = useCallback(async () => {
    const [b, p, v, pr] = await Promise.all([
      getWalletBalance(),
      getPaymentMethod(),
      getVoucherCodes(),
      getPromoCodes(),
    ]);
    setBalance(b);
    setPayment(p);
    setVouchers(v);
    setPromos(pr);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh])
  );

  const onAddFunds = () => {
    Alert.alert("Add funds", "Choose an amount to add to Gratitude Cash.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "₦1,000",
        onPress: async () => {
          const next = await addWalletFunds(1000);
          setBalance(next);
          Alert.alert("Funds added", `${formatNgn(1000)} added to your wallet.`);
        },
      },
      {
        text: "₦5,000",
        onPress: async () => {
          const next = await addWalletFunds(5000);
          setBalance(next);
          Alert.alert("Funds added", `${formatNgn(5000)} added to your wallet.`);
        },
      },
      {
        text: "₦10,000",
        onPress: async () => {
          const next = await addWalletFunds(10000);
          setBalance(next);
          Alert.alert("Funds added", `${formatNgn(10000)} added to your wallet.`);
        },
      },
    ]);
  };

  const onPickPayment = () => {
    Alert.alert("Payment method", "Choose how you pay for trips.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Cash",
        onPress: async () => {
          await setPaymentMethod("cash");
          setPayment("cash");
        },
      },
      {
        text: "Bank transfer",
        onPress: async () => {
          await setPaymentMethod("transfer");
          setPayment("transfer");
        },
      },
    ]);
  };

  const onAddPaymentMethod = () => {
    Alert.alert(
      "Add payment method",
      "Bank transfer is available now. Card payments are coming soon.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use bank transfer",
          onPress: async () => {
            await setPaymentMethod("transfer");
            setPayment("transfer");
            Alert.alert("Saved", "Bank transfer is now your default payment method.");
          },
        },
      ]
    );
  };

  const submitVoucher = async () => {
    if (!voucherDraft.trim()) return;
    const next = await addVoucherCode(voucherDraft);
    setVouchers(next);
    setVoucherDraft("");
    setShowVoucherInput(false);
    Alert.alert("Voucher saved", "Your voucher code was added.");
  };

  const submitPromo = async () => {
    if (!promoDraft.trim()) return;
    const res = await addPromoCode(promoDraft);
    if (!res.ok) {
      Alert.alert(
        "Invalid code",
        "Try GRAT10, WELCOME, or EXPRESS."
      );
      return;
    }
    setPromos(res.codes);
    setPromoDraft("");
    setShowPromoInput(false);
    Alert.alert("Promo applied", res.label ?? "Promo saved.");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={colors.dark} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Wallet</Text>

        <Pressable
          style={({ pressed }) => [styles.cashCard, pressed && { opacity: 0.96 }]}
          onPress={onAddFunds}
        >
          <View style={styles.cashTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cashLabel}>Gratitude Cash</Text>
              <Text style={styles.cashAmount}>{formatNgn(balance)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addFundsBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={onAddFunds}
          >
            <Text style={styles.addFundsText}>+ Add funds</Text>
          </Pressable>
        </Pressable>

        <Text style={styles.section}>Payment methods</Text>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
          onPress={onPickPayment}
        >
          <View style={[styles.payIcon, { backgroundColor: "#E8F8EF" }]}>
            <Ionicons name="cash-outline" size={18} color={colors.success} />
          </View>
          <Text style={styles.rowTitle}>
            {payment === "transfer" ? "Bank transfer" : "Cash"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.pillBtn,
            pressed && { opacity: 0.9 },
          ]}
          onPress={onAddPaymentMethod}
        >
          <Text style={styles.pillBtnText}>+ Add payment method</Text>
        </Pressable>

        <Text style={styles.section}>Trip profiles</Text>
        <View style={styles.row}>
          <View style={styles.circleIcon}>
            <Ionicons name="person" size={18} color={colors.muted} />
          </View>
          <Text style={styles.rowTitle}>Personal</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
          onPress={async () => {
            await setAccountTypePreference("business");
            router.replace("/business" as never);
          }}
        >
          <View style={styles.circleIcon}>
            <Ionicons name="briefcase" size={18} color={colors.muted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkTitle}>Start using Gratitude for Business</Text>
            <Text style={styles.rowSub}>Turn on business travel features</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionMuted}>Shared with you</Text>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
          onPress={() =>
            Alert.alert(
              "Business rides",
              "Ask your company admin to share a Gratitude for Business profile with you."
            )
          }
        >
          <View style={styles.circleIcon}>
            <Ionicons name="person-add" size={18} color={colors.muted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Manage business rides for others</Text>
            <Text style={styles.linkTitle}>Request access to their business profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
        </Pressable>

        <Text style={styles.section}>Vouchers</Text>
        <View style={styles.row}>
          <Ionicons name="ticket-outline" size={22} color={colors.muted} />
          <Text style={[styles.rowTitle, { flex: 1 }]}>Received vouchers</Text>
          <Text style={styles.count}>{vouchers.length}</Text>
        </View>
        {showVoucherInput ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter voucher code"
              placeholderTextColor={colors.mutedLight}
              autoCapitalize="characters"
              value={voucherDraft}
              onChangeText={setVoucherDraft}
            />
            <Pressable style={styles.inputBtn} onPress={submitVoucher}>
              <Text style={styles.inputBtnText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
            onPress={() => setShowVoucherInput(true)}
          >
            <Ionicons name="add" size={22} color={colors.dark} />
            <Text style={styles.rowTitle}>Add voucher code</Text>
          </Pressable>
        )}

        <Text style={styles.section}>Promotions</Text>
        {promos.length > 0 ? (
          <Text style={styles.hint}>Saved: {promos.join(", ")}</Text>
        ) : null}
        {showPromoInput ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter promo code"
              placeholderTextColor={colors.mutedLight}
              autoCapitalize="characters"
              value={promoDraft}
              onChangeText={setPromoDraft}
            />
            <Pressable style={styles.inputBtn} onPress={submitPromo}>
              <Text style={styles.inputBtnText}>Apply</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
            onPress={() => setShowPromoInput(true)}
          >
            <Ionicons name="add" size={22} color={colors.dark} />
            <Text style={styles.rowTitle}>Add promo code</Text>
          </Pressable>
        )}

        <Text style={styles.section}>In-store offers</Text>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
          onPress={() =>
            Alert.alert(
              "Offers",
              "In-store partner offers will appear here when available in your city."
            )
          }
        >
          <Ionicons name="pricetag-outline" size={22} color={colors.muted} />
          <Text style={[styles.rowTitle, { flex: 1 }]}>Offers</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  cashCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },
  cashTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cashLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.muted,
    marginBottom: 8,
  },
  cashAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.dark,
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  addFundsBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addFundsText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  section: {
    ...typography.section,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionMuted: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.muted,
    marginTop: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  payIcon: {
    width: 36,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  circleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.dark,
  },
  rowSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  pillBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  pillBtnText: {
    color: colors.dark,
    fontWeight: "700",
    fontSize: 14,
  },
  count: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
  },
  hint: {
    ...typography.supporting,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.dark,
    backgroundColor: colors.surfaceAlt,
  },
  inputBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
