import { colors, radii, shadows } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type TabTheme = {
  accent: string;
  soft: string;
  outline: IconName;
  filled: IconName;
};

const TAB_THEME: Record<string, TabTheme> = {
  index: {
    accent: colors.primary,
    soft: colors.primarySoft,
    outline: "home-outline",
    filled: "home",
  },
  services: {
    accent: colors.secondary,
    soft: colors.secondarySoft,
    outline: "apps-outline",
    filled: "apps",
  },
  activity: {
    accent: colors.success,
    soft: colors.successSoft,
    outline: "pulse-outline",
    filled: "pulse",
  },
  account: {
    accent: colors.primaryGlow,
    soft: colors.pastelBlue,
    outline: "person-circle-outline",
    filled: "person-circle",
  },
  orders: {
    accent: colors.secondary,
    soft: colors.secondarySoft,
    outline: "compass-outline",
    filled: "compass",
  },
  earnings: {
    accent: colors.success,
    soft: colors.successSoft,
    outline: "wallet-outline",
    filled: "wallet",
  },
  inbox: {
    accent: colors.primaryGlow,
    soft: colors.pastelBlue,
    outline: "chatbubbles-outline",
    filled: "chatbubbles",
  },
  profile: {
    accent: colors.primary,
    soft: colors.primarySoft,
    outline: "person-circle-outline",
    filled: "person-circle",
  },
  book: {
    accent: colors.secondary,
    soft: colors.secondarySoft,
    outline: "cube-outline",
    filled: "cube",
  },
  deliveries: {
    accent: colors.success,
    soft: colors.successSoft,
    outline: "navigate-outline",
    filled: "navigate",
  },
  bookings: {
    accent: colors.primaryGlow,
    soft: colors.pastelBlue,
    outline: "briefcase-outline",
    filled: "briefcase",
  },
  billing: {
    accent: colors.secondary,
    soft: colors.secondarySoft,
    outline: "card-outline",
    filled: "card",
  },
};

const FALLBACK: TabTheme = {
  accent: colors.primary,
  soft: colors.primarySoft,
  outline: "ellipse-outline",
  filled: "ellipse",
};

const TAB_ROUTE_ALLOWLIST = new Set([
  "index",
  "services",
  "activity",
  "account",
  "orders",
  "earnings",
  "inbox",
  "profile",
  "book",
  "deliveries",
  "bookings",
  "billing",
  "team",
]);

function themeFor(routeName: string, label: string): TabTheme {
  if (routeName === "index" && label === "Hub") {
    return {
      accent: colors.primary,
      soft: colors.primarySoft,
      outline: "bicycle-outline",
      filled: "bicycle",
    };
  }
  return TAB_THEME[routeName] ?? FALLBACK;
}

/** Android-safe tab bar — sits above MapView and always receives taps. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 12 : 8);

  const tabs = state.routes.filter((route) => {
    const opts = descriptors[route.key]?.options as { href?: unknown };
    if (opts?.href === null) return false;
    if (
      route.name === "where-to" ||
      route.name === "plan" ||
      route.name.startsWith("track") ||
      route.name.startsWith("trip")
    ) {
      return false;
    }
    return TAB_ROUTE_ALLOWLIST.has(route.name);
  });

  return (
    <View
      style={[styles.wrap, { paddingBottom: bottomPad }]}
      collapsable={false}
      renderToHardwareTextureAndroid
    >
      <View style={styles.dock} collapsable={false}>
        <View style={styles.brandStrip}>
          <View style={styles.brandForest} />
          <View style={styles.brandGold} />
        </View>
        <View style={styles.row} collapsable={false}>
          {tabs.map((route) => {
            const index = state.routes.findIndex((r) => r.key === route.key);
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label =
              typeof options.title === "string"
                ? options.title
                : route.name === "index"
                  ? "Home"
                  : route.name;

            const theme = themeFor(route.name, label);
            const icon = focused ? theme.filled : theme.outline;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={label}
                onPress={onPress}
                android_ripple={{ color: theme.soft, borderless: false }}
                style={({ pressed }) => [
                  styles.item,
                  focused && [
                    styles.itemOn,
                    {
                      backgroundColor: theme.accent,
                      shadowColor: theme.accent,
                    },
                  ],
                  pressed && styles.itemPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconWell,
                    focused
                      ? styles.iconWellOn
                      : { backgroundColor: theme.soft },
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={focused ? 18 : 20}
                    color={theme.accent}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    focused ? styles.labelOn : { color: colors.muted },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 98 : 86;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingTop: 8,
    zIndex: 10000,
    elevation: 16,
  },
  dock: {
    backgroundColor: colors.white,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.float,
  },
  brandStrip: {
    height: 3,
    flexDirection: "row",
  },
  brandForest: {
    flex: 2,
    backgroundColor: colors.primary,
  },
  brandGold: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  row: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radii.xl,
    minHeight: 56,
  },
  itemOn: {
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  itemPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  iconWell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWellOn: {
    backgroundColor: colors.white,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.15,
  },
  labelOn: {
    color: colors.white,
    fontWeight: "700",
  },
});
