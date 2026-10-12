import AsyncStorage from "@react-native-async-storage/async-storage";

const GUESTS_KEY = "gr.business.guests";
const CENTERS_KEY = "gr.business.cost_centers";
const DEFAULT_CENTER_KEY = "gr.business.cost_center.default";

export type BusinessGuest = {
  id: string;
  name: string;
  phone: string;
  note?: string;
  updatedAt: string;
};

export type CostCenter = {
  id: string;
  name: string;
  code?: string;
  updatedAt: string;
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getBusinessGuests(): Promise<BusinessGuest[]> {
  const list = await readJson<BusinessGuest[]>(GUESTS_KEY, []);
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveBusinessGuest(
  input: Omit<BusinessGuest, "id" | "updatedAt"> & { id?: string }
): Promise<BusinessGuest[]> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (name.length < 2 || phone.length < 7) {
    throw new Error("Name and phone are required.");
  }
  const prev = await getBusinessGuests();
  const now = new Date().toISOString();
  const id = input.id ?? `guest-${Date.now()}`;
  const next: BusinessGuest = {
    id,
    name,
    phone,
    note: input.note?.trim() || undefined,
    updatedAt: now,
  };
  const merged = [next, ...prev.filter((g) => g.id !== id && g.phone !== phone)];
  await AsyncStorage.setItem(GUESTS_KEY, JSON.stringify(merged));
  return merged;
}

export async function deleteBusinessGuest(id: string): Promise<BusinessGuest[]> {
  const next = (await getBusinessGuests()).filter((g) => g.id !== id);
  await AsyncStorage.setItem(GUESTS_KEY, JSON.stringify(next));
  return next;
}

export async function getCostCenters(): Promise<CostCenter[]> {
  const list = await readJson<CostCenter[]>(CENTERS_KEY, []);
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCostCenter(
  input: Omit<CostCenter, "id" | "updatedAt"> & { id?: string }
): Promise<CostCenter[]> {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Cost center name is required.");
  const prev = await getCostCenters();
  const now = new Date().toISOString();
  const id = input.id ?? `cc-${Date.now()}`;
  const next: CostCenter = {
    id,
    name,
    code: input.code?.trim() || undefined,
    updatedAt: now,
  };
  const merged = [next, ...prev.filter((c) => c.id !== id)];
  await AsyncStorage.setItem(CENTERS_KEY, JSON.stringify(merged));
  return merged;
}

export async function deleteCostCenter(id: string): Promise<CostCenter[]> {
  const next = (await getCostCenters()).filter((c) => c.id !== id);
  await AsyncStorage.setItem(CENTERS_KEY, JSON.stringify(next));
  const def = await getDefaultCostCenterId();
  if (def === id) await AsyncStorage.removeItem(DEFAULT_CENTER_KEY);
  return next;
}

export async function getDefaultCostCenterId(): Promise<string | null> {
  return (await AsyncStorage.getItem(DEFAULT_CENTER_KEY)) || null;
}

export async function setDefaultCostCenterId(id: string | null) {
  if (!id) {
    await AsyncStorage.removeItem(DEFAULT_CENTER_KEY);
    return;
  }
  await AsyncStorage.setItem(DEFAULT_CENTER_KEY, id);
}

export function costCenterFromNotes(
  notes: string | null | undefined
): string | null {
  if (!notes) return null;
  const m = notes.match(/Cost center:\s*([^·]+)/i);
  return m?.[1]?.trim() || null;
}
