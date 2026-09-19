/** Gen Z Marketplace palette — forest green, cream, warm orange. */
export const lightColors = {
  primary: "#12372A",
  primaryDark: "#0C261D",
  primarySoft: "#E7EFEA",
  primaryGlow: "#1F5A42",
  secondary: "#F59E3D",
  secondaryDark: "#D97706",
  secondarySoft: "#FDECD6",
  success: "#1F7A4C",
  successSoft: "#E5F4EC",
  dark: "#17211D",
  darkSurface: "#12372A",
  darkElevated: "#1F5A42",
  muted: "#5B675F",
  mutedLight: "#8A938C",
  /** Cream canvas from the marketplace site */
  surface: "#F7F4ED",
  surfaceAlt: "#EFE8DC",
  white: "#FFFFFF",
  border: "#D9D2C4",
  danger: "#B42318",
  dangerSoft: "#FDECEC",
  warning: "#F59E3D",
  warningSoft: "#FDECD6",
  mapInk: "#17211D",
  pastelBlue: "#E7EFEA",
  pastelGreen: "#E5F4EC",
  pastelPurple: "#F3EAFF",
} as const;

export type ThemeScheme = "light" | "dark";
export type ThemeColors = { [K in keyof typeof lightColors]: string };

/** Forest surfaces with cream type — used when Appearance is Dark, or the phone is in dark mode. */
export const darkColors: ThemeColors = {
  primary: "#F59E3D",
  primaryDark: "#0C261D",
  primarySoft: "#1F5A42",
  primaryGlow: "#F6C177",
  secondary: "#F59E3D",
  secondaryDark: "#F6C177",
  secondarySoft: "#3D2E18",
  success: "#7BC99A",
  successSoft: "#163D30",
  dark: "#F7F4ED",
  darkSurface: "#12372A",
  darkElevated: "#1F5A42",
  muted: "#C5D0C9",
  mutedLight: "#9AADA4",
  surface: "#0C261D",
  surfaceAlt: "#12372A",
  white: "#163A2F",
  border: "#2F5344",
  danger: "#F87171",
  dangerSoft: "#3D1A18",
  warning: "#F59E3D",
  warningSoft: "#3D2E18",
  mapInk: "#F7F4ED",
  pastelBlue: "#1F5A42",
  pastelGreen: "#163D30",
  pastelPurple: "#2A2438",
};

/** Default / Light appearance — cream canvas with forest and orange. */
export const colors = lightColors;

export function colorsFor(
  scheme: ThemeScheme,
  highContrast = false
): ThemeColors {
  const base = scheme === "dark" ? darkColors : lightColors;
  if (!highContrast) return base;
  if (scheme === "dark") {
    return {
      ...base,
      border: "#F59E3D",
      muted: "#F7F4ED",
      mutedLight: "#E7EFEA",
    };
  }
  return {
    ...base,
    border: "#12372A",
    muted: "#17211D",
    mutedLight: "#12372A",
  };
}

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
    shadowColor: "#17211D",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  float: {
    shadowColor: "#17211D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  soft: {
    shadowColor: "#12372A",
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
