import type { LivePlace } from "@/lib/places";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  home: "gr.saved.home",
  work: "gr.saved.work",
  recent: "gr.recent.places",
  payment: "gr.payment.method",
  walletBalance: "gr.wallet.balance",
  vouchers: "gr.wallet.vouchers",
  promos: "gr.wallet.promos",
} as const;

export type PaymentMethod = "cash" | "transfer";

export type SavedPlaces = {
  home: LivePlace | null;
  work: LivePlace | null;
};

async function readPlace(key: string): Promise<LivePlace | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as LivePlace;
  } catch {
    return null;
  }
}

export async function getSavedPlaces(): Promise<SavedPlaces> {
  const [home, work] = await Promise.all([
    readPlace(KEYS.home),
    readPlace(KEYS.work),
  ]);
  return { home, work };
}

export async function setSavedPlace(
  kind: "home" | "work",
  place: LivePlace | null
) {
  const key = kind === "home" ? KEYS.home : KEYS.work;
  if (!place) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await AsyncStorage.setItem(key, JSON.stringify(place));
}

export async function getRecentPlaces(): Promise<LivePlace[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.recent);
    if (!raw) return [];
    const list = JSON.parse(raw) as LivePlace[];
    return Array.isArray(list) ? list.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export async function pushRecentPlace(place: LivePlace) {
  const prev = await getRecentPlaces();
  const next = [
    place,
    ...prev.filter(
      (p) =>
        p.id !== place.id &&
        !(Math.abs(p.lat - place.lat) < 0.0002 && Math.abs(p.lng - place.lng) < 0.0002)
    ),
  ].slice(0, 8);
  await AsyncStorage.setItem(KEYS.recent, JSON.stringify(next));
}

export async function getPaymentMethod(): Promise<PaymentMethod> {
  const v = await AsyncStorage.getItem(KEYS.payment);
  return v === "transfer" ? "transfer" : "cash";
}

export async function setPaymentMethod(method: PaymentMethod) {
  await AsyncStorage.setItem(KEYS.payment, method);
}

export async function getWalletBalance(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.walletBalance);
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function addWalletFunds(amount: number): Promise<number> {
  const add = Math.max(0, Math.round(amount));
  const current = await getWalletBalance();
  const next = current + add;
  await AsyncStorage.setItem(KEYS.walletBalance, String(next));
  return next;
}

export async function getVoucherCodes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.vouchers);
    if (!raw) return [];
    const list = JSON.parse(raw) as string[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function addVoucherCode(code: string): Promise<string[]> {
  const c = code.trim().toUpperCase();
  if (!c) return getVoucherCodes();
  const prev = await getVoucherCodes();
  if (prev.includes(c)) return prev;
  const next = [c, ...prev];
  await AsyncStorage.setItem(KEYS.vouchers, JSON.stringify(next));
  return next;
}

export async function getPromoCodes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.promos);
    if (!raw) return [];
    const list = JSON.parse(raw) as string[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function addPromoCode(code: string): Promise<{
  ok: boolean;
  label: string | null;
  codes: string[];
}> {
  const c = code.trim().toUpperCase();
  const check = applyPromo(2500, c);
  if (!check.label) {
    return { ok: false, label: null, codes: await getPromoCodes() };
  }
  const prev = await getPromoCodes();
  const codes = prev.includes(c) ? prev : [c, ...prev];
  await AsyncStorage.setItem(KEYS.promos, JSON.stringify(codes));
  return { ok: true, label: check.label, codes };
}

/** Simple working promo codes */
export function applyPromo(
  fee: number,
  code: string | undefined | null
): { fee: number; label: string | null } {
  const c = (code || "").trim().toUpperCase();
  if (!c) return { fee, label: null };
  if (c === "GRAT10") {
    return { fee: Math.max(1000, Math.round(fee * 0.9)), label: "10% off with GRAT10" };
  }
  if (c === "WELCOME") {
    return { fee: Math.max(1000, fee - 500), label: "₦500 off with WELCOME" };
  }
  if (c === "EXPRESS") {
    return { fee: Math.max(1000, fee - 300), label: "₦300 off with EXPRESS" };
  }
  return { fee, label: null };
}
