import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface Category {
  id?: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  isDefault?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export const categoriesService = {
  // Get all categories for a user
  async getUserCategories(userId: string): Promise<Category[]> {
    try {
      const q = query(
        collection(db, 'categories'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        } as Category);
      });
      
      // Sort in memory instead of in the query
      return categories.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        }
        return 0;
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Add a new category
  async addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Update a category
  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete a category and move its transactions to "Others"
  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    try {
      // First, get or create the "Others" category
      const othersCategory = await this.getOthersCategory(userId);

      // Get all transactions for this category
      const { transactionsService } = await import('./transactionsService');
      const transactions = await transactionsService.getTransactionsByCategory(userId, categoryId);

      // Only update transactions if there are any
      if (transactions && transactions.length > 0) {
        console.log(`Moving ${transactions.length} transactions to "Others" category`);
        
        // Update all transactions to use "Others" category
        const updatePromises = transactions.map(transaction => 
          transactionsService.updateTransaction(transaction.id!, {
            categoryId: othersCategory.id!,
            categoryName: othersCategory.name,
            categoryIcon: othersCategory.icon,
            categoryColor: othersCategory.color
          })
        );

        // Wait for all transaction updates to complete
        await Promise.all(updatePromises);
        console.log('All transactions moved successfully');
      } else {
        console.log('No transactions found for this category');
      }

      // Now delete the category
      await deleteDoc(doc(db, 'categories', categoryId));
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Check if a category has any transactions
  async hasTransactions(userId: string, categoryId: string): Promise<boolean> {
    try {
      const { transactionsService } = await import('./transactionsService');
      const transactions = await transactionsService.getTransactionsByCategory(userId, categoryId);
      return transactions && transactions.length > 0;
    } catch (error) {
      console.error('Error checking transactions:', error);
      return false;
    }
  },

  // Get the "Others" category for a user, create if it doesn't exist
  async getOthersCategory(userId: string): Promise<Category> {
    try {
      const q = query(
        collection(db, 'categories'),
        where('userId', '==', userId),
        where('name', '==', 'Others')
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create "Others" category if it doesn't exist
        const othersCategoryId = await this.addCategory({
          userId,
          name: 'Others',
          icon: 'ellipsis-h',
          color: '#9E9E9E',
          type: 'expense',
          isDefault: true
        });
        
        return {
          id: othersCategoryId,
          userId,
          name: 'Others',
          icon: 'ellipsis-h',
          color: '#9E9E9E',
          type: 'expense',
          isDefault: true
        };
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Category;
    } catch (error) {
      console.error('Error getting/creating Others category:', error);
      throw error;
    }
  },

  // Create default categories for a new user
  async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { userId, name: 'Food', icon: 'restaurant', color: '#FF9900', type: 'expense', isDefault: true },
      { userId, name: 'Transport', icon: 'car-sport', color: '#4FC3F7', type: 'expense', isDefault: true },
      { userId, name: 'Bills', icon: 'receipt', color: '#FF5252', type: 'expense', isDefault: true },
      { userId, name: 'Shopping', icon: 'shopping-bag', color: '#B388FF', type: 'expense', isDefault: true },
      { userId, name: 'Entertainment', icon: 'movie', color: '#4CAF50', type: 'expense', isDefault: true },
      { userId, name: 'Health', icon: 'heart', color: '#F06292', type: 'expense', isDefault: true },
      { userId, name: 'Others', icon: 'ellipsis-h', color: '#9E9E9E', type: 'expense', isDefault: true },
      { userId, name: 'Salary', icon: 'cash', color: '#4CAF50', type: 'income', isDefault: true },
      { userId, name: 'Freelance', icon: 'laptop', color: '#2196F3', type: 'income', isDefault: true },
    ];

    try {
      for (const category of defaultCategories) {
        await this.addCategory(category);
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
      throw error;
    }
  }
};

// Default export to satisfy router requirements
export default categoriesService; 