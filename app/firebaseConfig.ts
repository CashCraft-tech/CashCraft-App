import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Read Firebase config from app.config.js extra (sourced from .env)
const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
};

// Check if credentials are valid
const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

// Use a fallback config to prevent app crash on startup if build did not have env vars
const activeConfig = isConfigValid
  ? firebaseConfig
  : {
      apiKey: "mock-api-key-for-build-purposes",
      authDomain: "mock-project.firebaseapp.com",
      projectId: "mock-project-id",
      storageBucket: "mock-project.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:1234567890",
    };

if (!isConfigValid) {
  console.warn(
    '⚠️ Firebase configuration credentials are missing! Fallback mock config is being used to prevent immediate startup crash. Please ensure environment variables (FIREBASE_API_KEY, etc.) are correctly set in your .env file locally or configured as secrets in EAS Build.'
  );
}

let firebaseApp;
try {
  // Use getApps() check to avoid reinitializing if hot-reloading
  const { getApps, getApp } = require('firebase/app');
  firebaseApp = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
} catch (error) {
  console.error('Fatal: Failed to initialize Firebase:', error);
  firebaseApp = { name: '[DEFAULT]', options: activeConfig } as any;
}

export const app = firebaseApp;

function createAuth() {
  if (!app) return null as any;
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Auth with persistence:', error);
    try {
      return getAuth(app);
    } catch (e) {
      console.error('Failed to get default Firebase Auth:', e);
      return null as any;
    }
  }
}

export const auth = createAuth();

export const messaging =
  !app || Platform.OS === 'web'
    ? Promise.resolve(null)
    : isSupported().then((supported) => {
        try {
          return supported ? getMessaging(app) : null;
        } catch (e) {
          console.error('Failed to initialize Firebase Messaging:', e);
          return null;
        }
      });

export const db = getFirestore(app);

export const usersCollection = collection(db, 'users');
export const categoriesCollection = collection(db, 'categories');
export const transactionsCollection = collection(db, 'transactions');
export const helpArticlesCollection = collection(db, 'helpArticles');
export const contactSubmissionsCollection = collection(db, 'contactSubmissions');
export const feedbackSubmissionsCollection = collection(db, 'feedbackSubmissions');

export default app;
