const appJson = require("./app.json");

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
      "READ_CONTACTS",
      "WRITE_CONTACTS",
      "CAMERA",
      "READ_MEDIA_IMAGES",
      "READ_EXTERNAL_STORAGE",
    ],
  };

  if (googleMapsApiKey) {
    android.config = {
      ...(appJson.expo.android?.config || {}),
      googleMaps: { apiKey: googleMapsApiKey },
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
      NSContactsUsageDescription:
        "Gratitude Ride uses contact information to share trip status and to send pick-up and drop-off notifications.",
      NSCameraUsageDescription:
        "Gratitude Ride uses the camera so you can take a profile photo.",
      NSPhotoLibraryUsageDescription:
        "Gratitude Ride uses your photos so you can set a profile picture.",
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
      [
        "expo-contacts",
        {
          contactsPermission:
            "Allow Gratitude Ride to access contacts so you can share trip status and send pick-up and drop-off notifications.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow Gratitude Ride to use your photos for a profile picture.",
          cameraPermission:
            "Allow Gratitude Ride to use the camera for a profile picture.",
        },
      ],
      ...(googleMapsApiKey
        ? [
            [
              "react-native-maps",
              {
                androidGoogleMapsApiKey: googleMapsApiKey,
                iosGoogleMapsApiKey: googleMapsApiKey,
              },
            ],
          ]
        : []),
    ],
  };
};
