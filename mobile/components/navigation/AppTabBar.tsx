import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  index: "home",
  book: "cube",
  deliveries: "map",
  profile: "person",
  // rider
  orders: "list",
  earnings: "wallet",
};

/** Android-safe tab bar — sits above MapView and always receives taps. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 0);

  const tabs = state.routes.filter((route) => {
    const opts = descriptors[route.key]?.options as { href?: unknown };
    // Expo Router hides screens with href: null (e.g. track/[id])
    return opts?.href !== null;
  });

  return (
    <View
      style={[styles.wrap, { paddingBottom: bottomPad }]}
      collapsable={false}
      // Force this native view above Google Maps touch overlay on Android.
      renderToHardwareTextureAndroid
    >
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

          const color = focused ? colors.primary : colors.muted;
          const iconName =
            route.name === "index" && label === "Hub"
              ? "bicycle"
              : ICONS[route.name] ?? "ellipse";

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
              hitSlop={10}
              android_ripple={{ color: colors.primarySoft, borderless: true }}
              style={({ pressed }) => [
                styles.item,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Ionicons name={iconName} size={22} color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 84 : 64;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 24,
    zIndex: 10000,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
