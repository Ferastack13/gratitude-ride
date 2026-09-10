import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  index: "home-outline",
  book: "cube-outline",
  deliveries: "map-outline",
  profile: "menu-outline",
  orders: "diamond-outline",
  earnings: "cash-outline",
  inbox: "mail-outline",
  services: "grid-outline",
  activity: "receipt-outline",
  account: "person-outline",
  bookings: "briefcase-outline",
  team: "people-outline",
  billing: "card-outline",
};

const FILLED: Partial<Record<IconName, IconName>> = {
  "home-outline": "home",
  "grid-outline": "grid",
  "receipt-outline": "receipt",
  "person-outline": "person",
  "diamond-outline": "diamond",
  "cash-outline": "cash",
  "mail-outline": "mail",
  "briefcase-outline": "briefcase",
  "people-outline": "people",
  "card-outline": "card",
  "cube-outline": "cube",
  "map-outline": "map",
  "menu-outline": "menu",
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

/** Android-safe tab bar — sits above MapView and always receives taps. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 10 : 4);

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

          const outline =
            route.name === "index" && label === "Hub"
              ? ("bicycle-outline" as IconName)
              : ICONS[route.name] ?? ("ellipse-outline" as IconName);
          const displayIcon =
            focused && FILLED[outline] ? FILLED[outline]! : outline;
          const color = focused ? colors.primary : colors.mutedLight;

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
              hitSlop={12}
              android_ripple={{ color: colors.primarySoft, borderless: true }}
              style={({ pressed }) => [
                styles.item,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name={displayIcon} size={22} color={color} />
              <Text
                style={[
                  styles.label,
                  { color },
                  focused && styles.labelOn,
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
  );
}

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 84 : 64;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    elevation: 12,
    zIndex: 10000,
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 4,
    minHeight: 48,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
  labelOn: {
    fontWeight: "600",
  },
});
