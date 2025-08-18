// Dynamic Expo app config to support EAS file secret for google-services.json
// If GOOGLE_SERVICES_JSON is set by EAS (file secret), use that path.
// Otherwise fall back to the local file for development.

module.exports = () => ({
  expo: {
    name: "CashCraft",
    slug: "bachat",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "cashcraft",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    androidStatusBar: {
      backgroundColor: "#004F3A",
    },
    androidNavigationBar: {
      visible: "immersive",
      backgroundColor: "#FFFFFF",
      barStyle: "dark-content",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cashcraft.app",
    },
    android: {
      package: "com.cashcraft.com",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#004F3A",
      },
      edgeToEdgeEnabled: false,
      softwareKeyboardLayoutMode: "pan",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          resizeMode: "contain",
          backgroundColor: "#004F3A",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#4caf50",
        },
      ],
      "expo-navigation-bar",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "e9b9481b-8889-42b9-a96f-87f0961cbe8d",
      },
    },
    owner: "prasad19",
  },
});





