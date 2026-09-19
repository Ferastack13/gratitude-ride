import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { colors } from "@/constants/theme";

const KEY = "gr.app.settings.v1";

export type AppearanceMode = "system" | "light" | "dark";
export type FontScale = "default" | "large" | "extra";
export type TipPercent = 0 | 5 | 10 | 15 | 20;
export type ReserveMatch = "any" | "top_rated" | "wait";
export type NearbyAlert = "off" | "banner" | "sound";

export type AppSettings = {
  appearance: AppearanceMode;
  fontScale: FontScale;
  reduceMotion: boolean;
  highContrast: boolean;
  simpleMode: boolean;
  seniorIdentification: boolean;
  privacy: {
    shareLocation: boolean;
    personalize: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  communication: {
    push: boolean;
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
  notifications: {
    trips: boolean;
    offers: boolean;
    family: boolean;
    commute: boolean;
  };
  defaultTipPercent: TipPercent;
  reserveMatch: ReserveMatch;
  nearbyAlert: NearbyAlert;
  commute: {
    enabled: boolean;
    morning: string;
    evening: string;
    days: number[];
  };
};

export const DEFAULT_SETTINGS: AppSettings = {
  appearance: "system",
  fontScale: "default",
  reduceMotion: false,
  highContrast: false,
  simpleMode: false,
  seniorIdentification: false,
  privacy: {
    shareLocation: true,
    personalize: true,
    analytics: false,
    crashReports: true,
  },
  communication: {
    push: true,
    whatsapp: true,
    sms: false,
    email: true,
    inApp: true,
  },
  notifications: {
    trips: true,
    offers: true,
    family: true,
    commute: false,
  },
  defaultTipPercent: 10,
  reserveMatch: "any",
  nearbyAlert: "banner",
  commute: {
    enabled: false,
    morning: "07:30",
    evening: "18:00",
    days: [1, 2, 3, 4, 5],
  },
};

export type SettingsPalette = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  danger: string;
  overlay: string;
};

export function resolvedAppearance(
  mode: AppearanceMode,
  systemScheme?: "light" | "dark"
): "light" | "dark" {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  if (systemScheme) return systemScheme;
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

export function paletteFor(
  mode: AppearanceMode,
  highContrast = false,
  systemScheme?: "light" | "dark"
): SettingsPalette {
  const resolved = resolvedAppearance(mode, systemScheme);
  if (resolved === "dark") {
    return {
      bg: "#0C261D",
      card: "#163A2F",
      text: "#F7F4ED",
      muted: highContrast ? "#F7F4ED" : "#C5D0C9",
      border: highContrast ? "#F59E3D" : "#2F5344",
      accent: "#F59E3D",
      danger: "#F87171",
      overlay: "rgba(7,18,14,0.55)",
    };
  }
  return {
    bg: colors.surface,
    card: colors.white,
    text: colors.dark,
    muted: highContrast ? colors.dark : colors.muted,
    border: highContrast ? colors.primary : colors.border,
    accent: colors.primary,
    danger: colors.danger,
    overlay: "rgba(18,55,42,0.35)",
  };
}

export function fontMul(scale: FontScale) {
  if (scale === "extra") return 1.28;
  if (scale === "large") return 1.14;
  return 1;
}

export const TIP_OPTIONS: { value: TipPercent; label: string }[] = [
  { value: 0, label: "No tip" },
  { value: 5, label: "5%" },
  { value: 10, label: "10%" },
  { value: 15, label: "15%" },
  { value: 20, label: "20%" },
];

export const RESERVE_OPTIONS: {
  value: ReserveMatch;
  title: string;
  body: string;
}[] = [
  {
    value: "any",
    title: "Any nearby driver",
    body: "Fastest match when you book ahead.",
  },
  {
    value: "top_rated",
    title: "Top-rated drivers",
    body: "Wait a bit longer for highly rated drivers.",
  },
  {
    value: "wait",
    title: "Hold for my preferred match",
    body: "We’ll keep searching until a strong match is free.",
  },
];

export const NEARBY_OPTIONS: {
  value: NearbyAlert;
  title: string;
  body: string;
}[] = [
  {
    value: "off",
    title: "Off",
    body: "No extra alerts during long pickups.",
  },
  {
    value: "banner",
    title: "In-app banner",
    body: "Show a quiet notice if the driver is delayed.",
  },
  {
    value: "sound",
    title: "Banner + sound",
    body: "Play a short sound with the delay notice.",
  },
];

export const WEEKDAYS = [
  { id: 0, label: "S" },
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
];

function merge(parsed: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    privacy: { ...DEFAULT_SETTINGS.privacy, ...parsed.privacy },
    communication: {
      ...DEFAULT_SETTINGS.communication,
      ...parsed.communication,
    },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...parsed.notifications,
    },
    commute: {
      ...DEFAULT_SETTINGS.commute,
      ...parsed.commute,
      days: Array.isArray(parsed.commute?.days)
        ? parsed.commute!.days
        : DEFAULT_SETTINGS.commute.days,
    },
  };
}

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return merge(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function setAppSettings(
  patch: DeepPartial<AppSettings>
): Promise<AppSettings> {
  const current = await getAppSettings();
  const next = merge({
    ...current,
    ...patch,
    privacy: { ...current.privacy, ...patch.privacy },
    communication: { ...current.communication, ...patch.communication },
    notifications: { ...current.notifications, ...patch.notifications },
    commute: {
      ...current.commute,
      ...patch.commute,
      days: patch.commute?.days ?? current.commute.days,
    },
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function parseHm(value: string) {
  const [h, m] = value.split(":").map((n) => Number(n));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export function commutePromptNow(
  settings: AppSettings,
  now = new Date()
): "morning" | "evening" | null {
  if (!settings.commute.enabled || !settings.notifications.commute) return null;
  if (!settings.commute.days.includes(now.getDay())) return null;
  const cur = now.getHours() * 60 + now.getMinutes();
  const morning = parseHm(settings.commute.morning);
  const evening = parseHm(settings.commute.evening);
  if (morning != null && Math.abs(cur - morning) <= 25) return "morning";
  if (evening != null && Math.abs(cur - evening) <= 25) return "evening";
  return null;
}

export function appearanceSubtitle(mode: AppearanceMode) {
  if (mode === "light") return "Light (cream)";
  if (mode === "dark") return "Dark (forest)";
  return "Use device settings";
}

export function reserveSubtitle(value: ReserveMatch) {
  return RESERVE_OPTIONS.find((o) => o.value === value)?.title ?? "Any nearby driver";
}

export function nearbySubtitle(value: NearbyAlert) {
  return NEARBY_OPTIONS.find((o) => o.value === value)?.title ?? "In-app banner";
}

export const SENIOR_SUPPORT_WHATSAPP =
  "https://wa.me/2348000000000?text=" +
  encodeURIComponent("Hello Gratitude Ride, I need Simple Mode phone support.");
export const SENIOR_SUPPORT_TEL = "tel:+2348000000000";
