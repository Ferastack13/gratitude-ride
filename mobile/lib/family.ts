import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "gr.family.members";
export const FAMILY_MEMBER_LIMIT = 10;

export type FamilyMember = {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  status: "invited";
};

async function readAll(): Promise<FamilyMember[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as FamilyMember[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeAll(list: FamilyMember[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const list = await readAll();
  return list.sort((a, b) => a.createdAt - b.createdAt);
}

export async function inviteFamilyMember(input: {
  name: string;
  phone: string;
}): Promise<{ ok: true; member: FamilyMember } | { ok: false; message: string }> {
  const name = input.name.trim();
  const phone = input.phone.replace(/\s+/g, "").trim();
  if (name.length < 2) {
    return { ok: false, message: "Enter the family member’s full name." };
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return { ok: false, message: "Enter a valid phone number." };
  }

  const list = await readAll();
  if (list.length >= FAMILY_MEMBER_LIMIT) {
    return { ok: false, message: "You can add up to 10 people on a Family profile." };
  }
  if (list.some((m) => m.phone === phone)) {
    return { ok: false, message: "That number is already invited." };
  }

  const member: FamilyMember = {
    id: `fam-${Date.now()}`,
    name,
    phone,
    createdAt: Date.now(),
    status: "invited",
  };
  await writeAll([...list, member]);
  return { ok: true, member };
}
