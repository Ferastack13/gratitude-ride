const appJson = require("./app.json");

// Load mobile/.env so Maps / Supabase keys are available when Expo evaluates config.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: require("path").join(__dirname, ".env") });
} catch {
  // dotenv is optional; Expo CLI also injects EXPO_PUBLIC_* from .env
}

module.exports = ({ config }) => {
  const googleMapsApiKey = (
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  ).trim();

  const android = {
    ...appJson.expo.android,
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "FOREGROUND_SERVICE",
    ],
  };

  // Only inject a Maps key when set. An empty string overrides Expo Go's
  // built-in key and produces a blank map with only the Google logo.
  if (googleMapsApiKey) {
    android.config = {
      ...(appJson.expo.android?.config || {}),
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    };
  }

  const ios = {
    ...appJson.expo.ios,
    infoPlist: {
      ...(appJson.expo.ios?.infoPlist || {}),
      NSLocationWhenInUseUsageDescription:
        "Gratitude Ride uses your location to show a live map and match nearby couriers.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Gratitude Ride uses your location to show a live map and match nearby couriers.",
    },
  };

  if (googleMapsApiKey) {
    ios.config = {
      ...(appJson.expo.ios?.config || {}),
      googleMapsApiKey,
    };
  }

  return {
    ...appJson.expo,
    ...config,
    name: appJson.expo.name,
    slug: appJson.expo.slug,
    android,
    ios,
    plugins: [
      ...(appJson.expo.plugins || []),
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow Gratitude Ride to use your location for live map delivery booking.",
        },
      ],
    ],
  };
};
