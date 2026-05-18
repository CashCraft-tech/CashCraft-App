// Dynamic Expo app config to support EAS file secret for google-services.json
// If GOOGLE_SERVICES_JSON is set by EAS (file secret), use that path.
// Otherwise fall back to the local file for development.

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

const googleServicesPath =
  process.env.GOOGLE_SERVICES_JSON || './google-services.json';
const googleServicesResolved = path.resolve(__dirname, googleServicesPath);
const hasGoogleServices = fs.existsSync(googleServicesResolved);

module.exports = () => ({
  expo: {
    name: 'CashCraft',
    slug: 'bachat',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'cashcraft',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    androidStatusBar: {
      backgroundColor: '#004F3A',
    },
    androidNavigationBar: {
      visible: 'immersive',
      backgroundColor: '#FFFFFF',
      barStyle: 'dark-content',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cashcraft.app',
    },
    android: {
      package: 'com.cashcraft.com',
      ...(hasGoogleServices && { googleServicesFile: googleServicesPath }),
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#004F3A',
      },
      edgeToEdgeEnabled: false,
      softwareKeyboardLayoutMode: 'pan',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-dev-client',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#004F3A',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#4caf50',
        },
      ],
      'expo-navigation-bar',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'e9b9481b-8889-42b9-a96f-87f0961cbe8d',
      },
      // Firebase config (loaded from .env)
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      // Cloudinary config (loaded from .env)
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    },
    owner: 'prasad19',
  },
});
