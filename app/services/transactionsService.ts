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
  serverTimestamp,
  limit,
  startAfter,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Helper function to safely convert Firestore Timestamp to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

export interface Transaction {
  id?: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date | any; // Allow both Date and Firestore Timestamp
  location?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export const transactionsService = {
  // Get transactions for a user with pagination
  async getUserTransactions(
    userId: string, 
    limitCount: number = 20, 
    lastTransaction?: any
  ): Promise<Transaction[]> {
    try {
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      if (lastTransaction) {
        q = query(q, startAfter(lastTransaction));
      }

      const querySnapshot = await getDocs(q);
      
      const transactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: convertTimestampToDate(data.date) // Convert Firestore timestamp to Date
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get transactions by date range
  async getTransactionsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: convertTimestampToDate(data.date)
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  },

  // Add a new transaction
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        date: Timestamp.fromDate(transaction.date), // Convert to Firestore Timestamp
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      
      // Convert date to Timestamp if it exists in updates
      const updateData = { ...updates };
      if (updateData.date) {
        updateData.date = Timestamp.fromDate(updateData.date as Date);
      }
      
      await updateDoc(transactionRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Get transaction statistics
  async getTransactionStats(userId: string, startDate?: Date, endDate?: Date): Promise<TransactionStats> {
    try {
      let transactions: Transaction[];
      
      if (startDate && endDate) {
        transactions = await this.getTransactionsByDateRange(userId, startDate, endDate);
      } else {
        transactions = await this.getUserTransactions(userId, 1000); // Get all transactions
      }

      const stats: TransactionStats = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: transactions.length
      };

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          stats.totalIncome += transaction.amount;
        } else {
          stats.totalExpense += transaction.amount;
        }
      });

      stats.balance = stats.totalIncome - stats.totalExpense;
      
      return stats;
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      throw error;
    }
  },

  // Get transactions by category
  async getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('categoryId', '==', categoryId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          date: convertTimestampToDate(data.date)
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions by category:', error);
      throw error;
    }
  }
};

// Default export to satisfy router requirements
export default transactionsService; 