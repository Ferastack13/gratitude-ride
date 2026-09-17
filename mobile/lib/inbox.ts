import { addPromoCode } from "@/lib/client-prefs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "gr.inbox.messages";

export const INBOX_FILTERS = [
  "all",
  "offers",
  "support",
  "updates",
  "priority",
] as const;

export type InboxFilter = (typeof INBOX_FILTERS)[number];
export type InboxCategory = Exclude<InboxFilter, "all">;

export type InboxMessage = {
  id: string;
  category: InboxCategory;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

export const FILTER_LABELS: Record<InboxFilter, string> = {
  all: "All",
  offers: "Offers",
  support: "Support",
  updates: "Updates",
  priority: "Priority",
};

export const EMPTY_COPY: Record<InboxFilter, { title: string; body: string }> = {
  all: {
    title: "No new messages",
    body: "Check back for offers and important notifications.",
  },
  offers: {
    title: "No offers yet",
    body: "Add a code above or check back for promotions.",
  },
  support: {
    title: "No support messages",
    body: "Trip help and chat replies will show up here.",
  },
  updates: {
    title: "You’re up to date",
    body: "Account and trip updates will appear here.",
  },
  priority: {
    title: "Nothing urgent",
    body: "Safety alerts and important notices land here.",
  },
};

async function readAll(): Promise<InboxMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as InboxMessage[];
    if (!Array.isArray(list)) return [];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

async function writeAll(list: InboxMessage[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function getInboxMessages(
  filter: InboxFilter = "all"
): Promise<InboxMessage[]> {
  const all = await readAll();
  if (filter === "all") return all;
  return all.filter((m) => m.category === filter);
}

export async function addInboxMessage(
  input: Omit<InboxMessage, "id" | "createdAt" | "read"> & {
    id?: string;
    createdAt?: number;
    read?: boolean;
  }
): Promise<InboxMessage[]> {
  const prev = await readAll();
  const nextMsg: InboxMessage = {
    id: input.id ?? `inb-${Date.now()}`,
    category: input.category,
    title: input.title,
    body: input.body,
    createdAt: input.createdAt ?? Date.now(),
    read: input.read ?? false,
  };
  const next = [nextMsg, ...prev.filter((m) => m.id !== nextMsg.id)];
  await writeAll(next);
  return next;
}

export async function markInboxRead(id: string): Promise<InboxMessage[]> {
  const next = (await readAll()).map((m) =>
    m.id === id ? { ...m, read: true } : m
  );
  await writeAll(next);
  return next;
}

export async function redeemInboxOfferCode(code: string): Promise<{
  ok: boolean;
  label: string | null;
  messages: InboxMessage[];
}> {
  const promo = await addPromoCode(code);
  if (!promo.ok) {
    return { ok: false, label: null, messages: await readAll() };
  }
  const messages = await addInboxMessage({
    category: "offers",
    title: promo.label ?? "Offer applied",
    body: `${code.trim().toUpperCase()} is saved to your wallet and ready on your next trip.`,
  });
  return { ok: true, label: promo.label, messages };
}
