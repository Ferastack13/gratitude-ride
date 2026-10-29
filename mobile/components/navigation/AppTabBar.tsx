import { radii } from "@/constants/theme";
import { useColors } from "@/context/theme";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

type TabTheme = {
  outline: IconName;
  filled: IconName;
};

function tabThemes(): Record<string, TabTheme> {
  return {
    index: { outline: "home-outline", filled: "home" },
    services: { outline: "grid-outline", filled: "grid" },
    activity: { outline: "time-outline", filled: "time" },
    account: { outline: "person-outline", filled: "person" },
    orders: { outline: "compass-outline", filled: "compass" },
    earnings: { outline: "wallet-outline", filled: "wallet" },
    inbox: { outline: "chatbubble-ellipses-outline", filled: "chatbubble-ellipses" },
    profile: { outline: "person-outline", filled: "person" },
    book: { outline: "cube-outline", filled: "cube" },
    deliveries: { outline: "navigate-outline", filled: "navigate" },
    bookings: { outline: "briefcase-outline", filled: "briefcase" },
    billing: { outline: "card-outline", filled: "card" },
  };
}

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
    return { outline: "bicycle-outline", filled: "bicycle" };
  }
  return tabThemes()[routeName] ?? { outline: "ellipse-outline", filled: "ellipse" };
}

const pillLayout = LinearTransition.springify().damping(18).stiffness(240).mass(0.7);

/** Android-safe tab bar — sits above MapView and always receives taps. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const unreadInbox = useUnreadNotificationCount();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 10 : 8);

  const focused = state.routes[state.index];
  if (
    focused?.name?.startsWith("active") ||
    focused?.name?.startsWith("track") ||
    focused?.name?.startsWith("trip")
  ) {
    return null;
  }

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
      pointerEvents="box-none"
      renderToHardwareTextureAndroid
    >
      <View
        style={[
          styles.dock,
          {
            backgroundColor: colors.darkSurface,
            borderColor: "rgba(245, 158, 61, 0.28)",
            shadowColor: colors.primaryDark,
          },
        ]}
        collapsable={false}
      >
        <View style={styles.goldRail} />
        <View style={styles.row} collapsable={false}>
          {tabs.map((route) => {
            const index = state.routes.findIndex((r) => r.key === route.key);
            const isOn = state.index === index;
            const { options } = descriptors[route.key];
            const label =
              typeof options.title === "string"
                ? options.title
                : route.name === "index"
                  ? "Home"
                  : route.name;

            const theme = themeFor(route.name, label);
            const icon = isOn ? theme.filled : theme.outline;
            const showUnread = route.name === "inbox" && unreadInbox > 0;
            const unreadLabel = unreadInbox > 9 ? "9+" : String(unreadInbox);

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isOn && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isOn ? { selected: true } : {}}
                accessibilityLabel={
                  showUnread ? `${label}, ${unreadInbox} unread` : label
                }
                onPress={onPress}
                android_ripple={{ color: "rgba(245, 158, 61, 0.18)", borderless: true }}
                style={({ pressed }) => [
                  styles.slot,
                  isOn ? styles.slotOn : styles.slotOff,
                  pressed && styles.slotPressed,
                ]}
              >
                <Animated.View
                  layout={pillLayout}
                  style={[
                    styles.chip,
                    isOn
                      ? { backgroundColor: colors.surface }
                      : { backgroundColor: "transparent" },
                  ]}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={icon}
                      size={isOn ? 18 : 22}
                      color={isOn ? colors.primary : "rgba(247, 244, 237, 0.62)"}
                    />
                    {showUnread ? (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: colors.secondary, borderColor: colors.darkSurface },
                        ]}
                      >
                        <Text style={styles.badgeText}>{unreadLabel}</Text>
                      </View>
                    ) : null}
                  </View>
                  {isOn ? (
                    <Animated.View
                      entering={FadeIn.duration(160)}
                      exiting={FadeOut.duration(90)}
                      style={styles.labelCluster}
                    >
                      <Text
                        style={[styles.label, { color: colors.dark }]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>
                      <View
                        style={[styles.goldDot, { backgroundColor: colors.secondary }]}
                      />
                    </Animated.View>
                  ) : null}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 96 : 84;

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    zIndex: 10000,
    elevation: 20,
  },
  dock: {
    borderRadius: radii.xxl + 6,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  goldRail: {
    height: 2,
    backgroundColor: "#F59E3D",
    opacity: 0.9,
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
  },
  slot: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "stretch",
  },
  slotOn: {
    flex: 1.7,
  },
  slotOff: {
    flex: 0.85,
  },
  slotPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    borderRadius: radii.full,
    paddingHorizontal: 10,
    gap: 8,
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  labelCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
                    maxWidth: 110,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  badgeText: {
    color: "#12372A",
    fontSize: 8,
    fontWeight: "800",
    lineHeight: 10,
  },
});
