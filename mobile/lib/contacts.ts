import { nigeriaWhatsAppNumber } from "@/lib/family";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Contact,
  ContactField,
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-contacts";
import { Platform } from "react-native";

const KEY = "gr.app.contacts.v1";
const DEVICE_PAGE = 200;

export type SavedContact = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type DeviceContact = {
  id: string;
  name: string;
  phone: string;
};

export type ContactsPermission = "undetermined" | "granted" | "denied";

function digits(phone: string) {
  return phone.replace(/\D/g, "");
}

function makeId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizePhone(phone: string) {
  return digits(phone);
}

export function formatPhoneLabel(phone: string) {
  const d = digits(phone);
  if (!d) return phone.trim();
  if (d.startsWith("234") && d.length === 13) {
    return `0${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  }
  if (d.startsWith("0") && d.length === 11) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return phone.trim();
}

export function contactMatches(query: string, name: string, phone: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const qDigits = digits(q);
  return (
    name.toLowerCase().includes(q) ||
    phone.toLowerCase().includes(q) ||
    (qDigits.length > 0 && digits(phone).includes(qDigits))
  );
}

export function shareTripMessage(contactName: string, riderName: string) {
  const first = riderName.split(" ")[0] || "I";
  return (
    `Hi ${contactName} — ${first} is sharing a Gratitude Ride update.\n\n` +
    `I'll send pick-up and drop-off notifications from the Gratitude Ride app.`
  );
}

export function whatsappShareUrl(phone: string, message: string) {
  const n = nigeriaWhatsAppNumber(phone);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function smsShareUrl(phone: string, message: string) {
  const d = digits(phone);
  if (!d) return "";
  const sep = Platform.OS === "ios" ? "&" : "?";
  return `sms:${d}${sep}body=${encodeURIComponent(message)}`;
}

async function readAll(): Promise<SavedContact[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedContact =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as SavedContact).id === "string" &&
        typeof (item as SavedContact).name === "string" &&
        typeof (item as SavedContact).phone === "string"
    );
  } catch {
    return [];
  }
}

async function writeAll(list: SavedContact[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function getSavedContacts(): Promise<SavedContact[]> {
  const list = await readAll();
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

export async function addSavedContact(input: {
  name: string;
  phone: string;
}): Promise<SavedContact> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) throw new Error("Enter a name.");
  if (digits(phone).length < 7) throw new Error("Enter a valid phone number.");

  const list = await readAll();
  const existing = list.find(
    (c) => digits(c.phone) === digits(phone) || c.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    const next = { ...existing, name, phone };
    await writeAll(list.map((c) => (c.id === existing.id ? next : c)));
    return next;
  }

  const contact: SavedContact = {
    id: makeId(),
    name,
    phone,
    createdAt: new Date().toISOString(),
  };
  await writeAll([...list, contact]);
  return contact;
}

export async function removeSavedContact(id: string) {
  const list = await readAll();
  await writeAll(list.filter((c) => c.id !== id));
}

function mapPermission(status: string | undefined): ContactsPermission {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export async function getDeviceContactsPermission(): Promise<ContactsPermission> {
  try {
    const res = await getPermissionsAsync();
    return mapPermission(res.status);
  } catch {
    try {
      const Contacts = await import("expo-contacts/legacy");
      const res = await Contacts.getPermissionsAsync();
      return mapPermission(res.status);
    } catch {
      return "undetermined";
    }
  }
}

export async function requestDeviceContactsPermission(): Promise<ContactsPermission> {
  try {
    const res = await requestPermissionsAsync();
    return mapPermission(res.status);
  } catch {
    try {
      const Contacts = await import("expo-contacts/legacy");
      const res = await Contacts.requestPermissionsAsync();
      return mapPermission(res.status);
    } catch {
      return "denied";
    }
  }
}

function mapDeviceRows(
  rows: Array<{ id: string; name: string; phone: string }>
): DeviceContact[] {
  return rows
    .filter((row) => row.name || row.phone)
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function loadDeviceContactsLegacy(): Promise<DeviceContact[]> {
  const Contacts = await import("expo-contacts/legacy");
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    pageSize: DEVICE_PAGE,
  });
  return mapDeviceRows(
    (data ?? []).map((row) => {
      const phones = row.phoneNumbers ?? [];
      const phone =
        phones.find((p) => digits(p.number ?? "").length >= 7)?.number?.trim() ??
        phones[0]?.number?.trim() ??
        "";
      const name = (row.name ?? "").trim();
      return { id: row.id ?? makeId(), name: name || phone, phone };
    })
  );
}

export async function loadDeviceContacts(): Promise<DeviceContact[]> {
  const permission = await getDeviceContactsPermission();
  if (permission !== "granted") return [];

  try {
    const rows = await Contact.getAllDetails(
      [ContactField.FULL_NAME, ContactField.PHONES],
      { limit: DEVICE_PAGE, offset: 0 }
    );
    return mapDeviceRows(
      rows.map((row) => {
        const name = (row.fullName ?? "").trim();
        const phones = Array.isArray(row.phones) ? row.phones : [];
        const phone =
          phones.find((p) => digits(p.number ?? "").length >= 7)?.number?.trim() ??
          phones[0]?.number?.trim() ??
          "";
        return { id: row.id, name: name || phone, phone };
      })
    );
  } catch {
    return loadDeviceContactsLegacy();
  }
}
