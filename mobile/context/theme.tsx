import {
  colorsFor,
  type ThemeColors,
  type ThemeScheme,
} from "@/constants/theme";
import {
  DEFAULT_SETTINGS,
  getAppSettings,
  paletteFor,
  setAppSettings,
  type AppearanceMode,
  type AppSettings,
  type SettingsPalette,
} from "@/lib/settings";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Appearance, StyleSheet } from "react-native";

function deviceScheme(): ThemeScheme {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

type ThemeContextValue = {
  ready: boolean;
  settings: AppSettings;
  mode: AppearanceMode;
  scheme: ThemeScheme;
  colors: ThemeColors;
  palette: SettingsPalette;
  update: (patch: Parameters<typeof setAppSettings>[0]) => Promise<AppSettings>;
  setAppearance: (mode: AppearanceMode) => Promise<AppSettings>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [systemScheme, setSystemScheme] = useState<ThemeScheme>(deviceScheme);

  useEffect(() => {
    let alive = true;
    getAppSettings()
      .then((next) => {
        if (alive) setSettings(next);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  const scheme: ThemeScheme =
    settings.appearance === "system" ? systemScheme : settings.appearance;

  useEffect(() => {
    try {
      if (typeof Appearance.setColorScheme === "function") {
        Appearance.setColorScheme(
          settings.appearance === "system" ? null : settings.appearance
        );
      }
    } catch {
      // Expo Go / older runtimes may ignore forced color scheme.
    }
  }, [settings.appearance]);

  const colors = useMemo(
    () => colorsFor(scheme, settings.highContrast),
    [scheme, settings.highContrast]
  );
  const palette = useMemo(
    () => paletteFor(settings.appearance, settings.highContrast, systemScheme),
    [settings.appearance, settings.highContrast, systemScheme]
  );

  const update = useCallback(async (patch: Parameters<typeof setAppSettings>[0]) => {
    const next = await setAppSettings(patch);
    setSettings(next);
    return next;
  }, []);

  const setAppearance = useCallback(
    (mode: AppearanceMode) => update({ appearance: mode }),
    [update]
  );

  const value = useMemo(
    () => ({
      ready,
      settings,
      mode: settings.appearance,
      scheme,
      colors,
      palette,
      update,
      setAppearance,
    }),
    [ready, settings, scheme, colors, palette, update, setAppearance]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }
  return ctx;
}

export function useColors() {
  return useAppTheme().colors;
}

export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T
): T {
  const colors = useColors();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
