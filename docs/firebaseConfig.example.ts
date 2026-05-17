// Firebase Configuration Example
// Copy this file to firebaseConfig.ts and replace with your actual Firebase credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';

// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase (commented out to prevent conflicts)
// const app = initializeApp(firebaseConfig);

// Initialize Firebase services (commented out to prevent conflicts)
// export const auth = getAuth(app);
// export const db = getFirestore(app);

// Collection references (commented out to prevent conflicts)
// export const usersRef = collection(db, 'users');
// export const categoriesRef = collection(db, 'categories');
// export const transactionsRef = collection(db, 'transactions');

// Instructions:
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Enable Authentication (Email/Password)
// 3. Enable Firestore Database
// 4. Get your config from Project Settings > General > Your apps
// 5. Replace the values above with your actual configuration
// 6. Download google-services.json and place it in the project root
// 7. Set up Firestore security rules as documented in README.md

// Default export to satisfy router requirements
const FirebaseConfigExample = () => {
  return null; // This is just a placeholder component
};

export default FirebaseConfigExample; 