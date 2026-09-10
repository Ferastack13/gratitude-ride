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
  dark: "#0B1220",
  darkSurface: "#111827",
  darkElevated: "#1F2937",
  muted: "#667085",
  mutedLight: "#98A2B3",
  surface: "#F7F9FC",
  surfaceAlt: "#EEF2F7",
  white: "#FFFFFF",
  border: "#E4E7EC",
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
    shadowColor: "#0B1220",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  float: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  soft: {
    shadowColor: "#1D61E7",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: "900" as const, letterSpacing: -0.7 },
  title: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, fontWeight: "500" as const, color: colors.muted },
  label: { fontSize: 13, fontWeight: "700" as const, color: colors.dark },
  caption: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.muted,
    letterSpacing: 0.2,
  },
  mono: { fontFamily: "monospace" as const, fontWeight: "800" as const },
};
