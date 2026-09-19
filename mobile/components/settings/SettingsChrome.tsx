import { useAppTheme } from "@/context/theme";
import {
  fontMul,
  type AppSettings,
  type SettingsPalette,
} from "@/lib/settings";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Switch } from "react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useSettingsState() {
  const { settings, update, palette, ready } = useAppTheme();
  return { settings, update, palette, ready };
}

export function SettingsShell({
  title,
  palette,
  settings,
  children,
  footer,
}: {
  title: string;
  palette: SettingsPalette;
  settings: AppSettings;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const mul = fontMul(settings.fontScale);
  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top }]}>
      <View style={styles.head}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={palette.text} />
        </Pressable>
        <Text
          style={[
            styles.title,
            { color: palette.text, fontSize: 28 * mul },
          ]}
        >
          {title}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: 28 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
        {footer}
      </ScrollView>
    </View>
  );
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  palette,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  palette: SettingsPalette;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: palette.border },
        last && { borderBottomWidth: 0 },
        pressed && { opacity: 0.78 },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={palette.text} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSub, { color: palette.muted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.muted} />
    </Pressable>
  );
}

export function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
  palette,
  last,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  palette: SettingsPalette;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: palette.border },
        last && { borderBottomWidth: 0 },
      ]}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSub, { color: palette.muted }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.border, true: palette.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function ChoiceCard({
  title,
  body,
  selected,
  onPress,
  palette,
  children,
}: {
  title: string;
  body: string;
  selected: boolean;
  onPress: () => void;
  palette: SettingsPalette;
  children?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: palette.card,
          borderColor: selected ? palette.accent : palette.border,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.rowSub, { color: palette.muted }]}>{body}</Text>
        {children}
      </View>
      <Ionicons
        name={selected ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={selected ? palette.accent : palette.muted}
      />
    </Pressable>
  );
}

export function SectionLabel({
  label,
  palette,
}: {
  label: string;
  palette: SettingsPalette;
}) {
  return (
    <Text style={[styles.section, { color: palette.muted }]}>{label}</Text>
  );
}

export function usePalette() {
  return useAppTheme().palette;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    letterSpacing: -0.5,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  body: {
    paddingHorizontal: 16,
  },
  section: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowSub: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
});
