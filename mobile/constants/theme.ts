export const colors = {
  primary: "#1D61E7",
  primaryDark: "#1549B8",
  primarySoft: "#E8F0FE",
  primaryGlow: "#4B84F0",
  secondary: "#F5C518",
  secondaryDark: "#D4A017",
  secondarySoft: "#FFF8E1",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  dark: "#0F172A",
  darkSurface: "#111827",
  darkElevated: "#1F2937",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  surface: "#F5F7FB",
  surfaceAlt: "#EEF2F8",
  white: "#FFFFFF",
  border: "#E5EAF2",
  danger: "#EF4444",
  dangerSoft: "#FEF2F2",
  warning: "#F59E0B",
  warningSoft: "#FFFBEB",
  mapInk: "#0B1220",
  pastelBlue: "#EAF1FF",
  pastelGreen: "#EAF8F0",
  pastelPurple: "#F3EAFF",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  float: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: "900" as const, letterSpacing: -0.6 },
  title: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontWeight: "500" as const, color: colors.muted },
  label: { fontSize: 13, fontWeight: "700" as const, color: colors.dark },
  mono: { fontFamily: "monospace" as const, fontWeight: "800" as const },
};
