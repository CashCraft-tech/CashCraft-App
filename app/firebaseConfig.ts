import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

import { getFirestore, collection } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIMqCgK2yZtwuuye9IKhdghK7VsJ5RCh8",
  authDomain: "cashcraft-c8a02.firebaseapp.com",
  projectId: "cashcraft-c8a02",
  storageBucket: "cashcraft-c8a02.firebasestorage.app",
  messagingSenderId: "930540132801",
  appId: "1:930540132801:android:54571d7d7d6fecdbad7740"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firebase Cloud Messaging
export const messaging = isSupported().then(supported => {
  if (supported) {
    return getMessaging(app);
  }
  return null;
});

export const db = getFirestore(app);

// Firestore collections
export const usersCollection = collection(db, 'users');
export const categoriesCollection = collection(db, 'categories');
export const transactionsCollection = collection(db, 'transactions');
export const helpArticlesCollection = collection(db, 'helpArticles');
export const contactSubmissionsCollection = collection(db, 'contactSubmissions');
export const feedbackSubmissionsCollection = collection(db, 'feedbackSubmissions');

export default app; 