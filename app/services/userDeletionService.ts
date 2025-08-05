import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface DeletionResult {
  success: boolean;
  error?: string;
  deletedCollections?: string[];
}

export const userDeletionService = {
  // Delete all user data from Firestore
  async deleteUserData(userId: string): Promise<DeletionResult> {
    try {
      const batch = writeBatch(db);
      const deletedCollections: string[] = [];

      // Delete user profile
      try {
        const userDocRef = doc(db, 'users', userId);
        batch.delete(userDocRef);
        deletedCollections.push('users');
      } catch (error) {
        console.warn('Error deleting user profile:', error);
      }

      // Delete user categories
      try {
        const categoriesQuery = query(
          collection(db, 'categories'),
          where('userId', '==', userId)
        );
        const categoriesSnapshot = await getDocs(categoriesQuery);
        categoriesSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        if (!categoriesSnapshot.empty) {
          deletedCollections.push('categories');
        }
      } catch (error) {
        console.warn('Error deleting user categories:', error);
      }

      // Delete user transactions
      try {
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userId)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        transactionsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        if (!transactionsSnapshot.empty) {
          deletedCollections.push('transactions');
        }
      } catch (error) {
        console.warn('Error deleting user transactions:', error);
      }

      // Delete user notifications
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', userId)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        notificationsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        if (!notificationsSnapshot.empty) {
          deletedCollections.push('notifications');
        }
      } catch (error) {
        console.warn('Error deleting user notifications:', error);
      }

      // Delete user settings
      try {
        const settingsQuery = query(
          collection(db, 'userSettings'),
          where('userId', '==', userId)
        );
        const settingsSnapshot = await getDocs(settingsQuery);
        settingsSnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        if (!settingsSnapshot.empty) {
          deletedCollections.push('userSettings');
        }
      } catch (error) {
        console.warn('Error deleting user settings:', error);
      }

      // Commit all deletions
      await batch.commit();

      return {
        success: true,
        deletedCollections
      };
    } catch (error: any) {
      console.error('Error deleting user data:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user data'
      };
    }
  },

  // Delete specific collection for a user
  async deleteUserCollection(collectionName: string, userId: string): Promise<DeletionResult> {
    try {
      const batch = writeBatch(db);
      const queryRef = query(
        collection(db, collectionName),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(queryRef);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return {
        success: true,
        deletedCollections: [collectionName]
      };
    } catch (error: any) {
      console.error(`Error deleting ${collectionName}:`, error);
      return {
        success: false,
        error: error.message || `Failed to delete ${collectionName}`
      };
    }
  }
}; 