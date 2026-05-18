import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { verifyBeforeUpdateEmail, User } from 'firebase/auth';
import { db } from '../firebaseConfig';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  profession: string;
  username: string;
  address?: string;
  dateOfBirth?: string;
}

export const UserService = {
  // Test function to manually check Firestore data
  testFirestoreData: async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
      }
    } catch (error) {
      console.error('Test error:', error);
    }
  },

  // Fetch user profile from Firestore
  getUserProfile: async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  },

  // Create initial user profile
  createUserProfile: async (uid: string, basicUserData: any) => {
    await setDoc(doc(db, 'users', uid), basicUserData);
  },

  // Sync the verified Auth email back to Firestore.
  // Called automatically when a mismatch is detected on profile load.
  syncEmail: async (uid: string, verifiedEmail: string) => {
    await updateDoc(doc(db, 'users', uid), {
      email: verifiedEmail,
      updatedAt: new Date(),
    });
  },

  // Update user profile
  updateUserProfile: async (user: User, personalInfo: PersonalInfo) => {
    const emailChanged = personalInfo.email && personalInfo.email !== user.email;

    if (emailChanged) {
      // Send verification link to the NEW email using Firebase's built-in email sender.
      // The email will not be updated until the user clicks this link.
      await verifyBeforeUpdateEmail(user, personalInfo.email);
    }

    // Update Firestore with all other fields.
    // Email is intentionally excluded when changed — it will be synced
    // automatically once the user verifies the new address.
    const { email, ...otherFields } = personalInfo;
    const firestoreUpdate = emailChanged
      ? { ...otherFields, updatedAt: new Date() }    // email pending verification
      : { ...personalInfo, updatedAt: new Date() };   // email unchanged, safe to write

    await updateDoc(doc(db, 'users', user.uid), firestoreUpdate);

    return { emailVerificationSent: !!emailChanged };
  }
};

export default function IgnoredRoute() { return null; }
