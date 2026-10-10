import { SENIOR_SUPPORT_WHATSAPP } from "@/lib/settings";
import * as StoreReview from "expo-store-review";
import { Alert, Linking, Platform } from "react-native";

/** Optional store listing URLs — set when the apps are published. */
const IOS_APP_STORE_URL = process.env.EXPO_PUBLIC_IOS_APP_STORE_URL ?? "";
const ANDROID_PLAY_URL = process.env.EXPO_PUBLIC_ANDROID_PLAY_URL ?? "";

/**
 * Prompt the user to rate Gratitude Ride.
 * Uses the native in-app review sheet when available; otherwise store link
 * or WhatsApp feedback (Expo Go often has no store listing yet).
 */
export async function promptAppReview() {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      const hasAction = await StoreReview.hasAction();
      if (hasAction) {
        await StoreReview.requestReview();
        return;
      }
    }
  } catch {
    // Fall through to manual options.
  }

  const storeUrl =
    StoreReview.storeUrl() ||
    (Platform.OS === "ios"
      ? IOS_APP_STORE_URL
      : Platform.OS === "android"
        ? ANDROID_PLAY_URL
        : "");

  Alert.alert(
    "Rate Gratitude Ride",
    storeUrl
      ? "Thanks for riding with us. Leave a quick rating on the store, or send feedback to support."
      : "Thanks for riding with us. The app isn’t on the store listing yet — send feedback to our team instead.",
    [
      { text: "Not now", style: "cancel" },
      ...(storeUrl
        ? [
            {
              text: "Rate on store",
              onPress: () => {
                void Linking.openURL(storeUrl);
              },
            },
          ]
        : []),
      {
        text: "Send feedback",
        onPress: () => {
          void Linking.openURL(
            SENIOR_SUPPORT_WHATSAPP.includes("?text=")
              ? SENIOR_SUPPORT_WHATSAPP
              : `${SENIOR_SUPPORT_WHATSAPP}?text=${encodeURIComponent(
                  "Hi Gratitude Ride — here’s my app feedback: "
                )}`
          );
        },
      },
    ]
  );
}
