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
  dark: "#101828",
  darkSurface: "#111827",
  darkElevated: "#1F2937",
  muted: "#667085",
  mutedLight: "#98A2B3",
  /** App canvas — near-white to avoid grey “card farm” look */
  surface: "#FFFFFF",
  surfaceAlt: "#F2F4F7",
  white: "#FFFFFF",
  border: "#EAECF0",
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
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 999,
} as const;

/** Use sparingly — prefer flat surfaces + spacing. */
export const shadows = {
  card: {
    shadowColor: "#101828",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  float: {
    shadowColor: "#101828",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  soft: {
    shadowColor: "#1D61E7",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
} as const;

/**
 * Passenger typography — modern system UI weights.
 * Prefer 600/700 for emphasis; reserve 800 for rare brand moments.
 */
export const typography = {
  pageTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    color: colors.dark,
  },
  section: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.dark,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: colors.dark,
    lineHeight: 22,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.dark,
  },
  supporting: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: colors.muted,
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.muted,
    letterSpacing: 0.2,
  },
  cta: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  brand: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  display: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, fontWeight: "400" as const, color: colors.muted },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    color: colors.muted,
  },
  mono: { fontFamily: "System" as const, fontWeight: "600" as const },
};
