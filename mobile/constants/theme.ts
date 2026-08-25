export const colors = {
  primary: "#16a34a",
  primaryDark: "#15803d",
  primarySoft: "#dcfce7",
  primaryGlow: "#22c55e",
  secondary: "#facc15",
  secondaryDark: "#eab308",
  secondarySoft: "#fef9c3",
  dark: "#0f0f0f",
  darkSurface: "#141414",
  darkElevated: "#1c1c1c",
  muted: "#737373",
  mutedLight: "#a3a3a3",
  surface: "#f4f6f3",
  white: "#ffffff",
  border: "#e4e8e2",
  danger: "#ef4444",
  dangerSoft: "#fef2f2",
  warning: "#f59e0b",
  warningSoft: "#fffbeb",
  mapInk: "#0b1f14",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: "900" as const, letterSpacing: -0.6 },
  title: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontWeight: "500" as const, color: colors.muted },
  label: { fontSize: 13, fontWeight: "700" as const, color: colors.dark },
  mono: { fontFamily: "monospace" as const, fontWeight: "800" as const },
};
