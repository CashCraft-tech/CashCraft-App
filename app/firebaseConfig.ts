import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAQp3DAHj-16bmWi9JwbnEvpfmXKhySoI",
  authDomain: "bachat-991f9.firebaseapp.com",
  projectId: "bachat-991f9",
  storageBucket: "bachat-991f9.firebasestorage.app",
  messagingSenderId: "888504934769",
  appId: "1:888504934769:android:ebf8927e8ab117606156d0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
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