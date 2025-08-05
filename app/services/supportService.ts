import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Types
export interface HelpArticle {
  id?: string;
  title: string;
  content: string;
  category: 'getting-started' | 'transactions' | 'categories' | 'account' | 'troubleshooting';
  tags: string[];
  isPublished: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ContactSubmission {
  id?: string;
  userId?: string;
  userEmail?: string;
  subject: string;
  message: string;
  contactMethod: 'email' | 'chat' | 'call';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt?: any;
  updatedAt?: any;
}

export interface FeedbackSubmission {
  id?: string;
  userId?: string;
  userEmail?: string;
  feedbackType: 'bug' | 'feature' | 'general' | 'praise';
  title: string;
  description: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt?: any;
  updatedAt?: any;
}

// Default help articles (fallback when Firestore is not available)
const DEFAULT_HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'getting-started-1',
    title: "Getting Started with CashCraft",
    content: "Welcome to CashCraft! This guide will help you get started with managing your expenses and income effectively.\n\n1. Create your first transaction by tapping the '+' button on the bottom tab bar\n2. Choose between Income or Expense\n3. Enter the amount and description\n4. Select a category or create a new one\n5. Add any additional notes\n6. Tap 'Save Transaction' to complete\n\nYour transaction will now appear in your transaction list and contribute to your spending analytics.",
    category: "getting-started",
    tags: ["first time", "setup", "transactions", "basics"],
    isPublished: true
  },
  {
    id: 'getting-started-2',
    title: "How to Add Your First Transaction",
    content: "Adding transactions is the core feature of CashCraft. Here's how to do it step by step:\n\n1. Navigate to the 'Add' tab in the bottom navigation\n2. Select the transaction type (Income or Expense)\n3. Enter the amount in the amount field\n4. Provide a clear description of the transaction\n5. Choose an appropriate category from the dropdown\n6. Optionally add notes for additional context\n7. Tap the 'Save Transaction' button\n\nYour transaction will be saved and you'll see a confirmation message. The transaction will immediately appear in your transaction list and update your dashboard analytics.",
    category: "getting-started",
    tags: ["transactions", "add", "first time", "income", "expense"],
    isPublished: true
  },
  {
    id: 'categories-1',
    title: "Managing Transaction Categories",
    content: "Categories help you organize and track your spending patterns. Here's how to manage them:\n\nCreating Categories:\n- Go to Profile → Manage Categories\n- Tap the '+' button to add a new category\n- Choose an icon and color that represents the category\n- Enter a name for your category\n- Save the category\n\nEditing Categories:\n- Tap on any existing category to edit its details\n- You can change the name, icon, or color\n- Save your changes\n\nDeleting Categories:\n- Swipe left on a category to reveal the delete option\n- Note: Categories with existing transactions cannot be deleted\n\nDefault categories are provided, but you can create custom ones that better fit your spending habits.",
    category: "categories",
    tags: ["categories", "manage", "custom", "organization"],
    isPublished: true
  },
  {
    id: 'transactions-1',
    title: "Understanding Your Dashboard",
    content: "The Dashboard provides a comprehensive overview of your financial activity:\n\nKey Features:\n1. Monthly Overview: See your total income and expenses for the current month\n2. Spending Breakdown: Visual representation of expenses by category\n3. Recent Transactions: Quick access to your latest transactions\n4. Monthly Trends: Track your spending patterns over time\n\nUnderstanding the Charts:\n- The pie chart shows your spending distribution across categories\n- The bar chart displays monthly trends for income vs expenses\n- Tap on any chart segment to see detailed information\n\nTips for Better Insights:\n- Regularly categorize your transactions\n- Review your dashboard weekly to track spending patterns\n- Use the insights to identify areas where you can save money",
    category: "transactions",
    tags: ["dashboard", "analytics", "charts", "insights", "trends"],
    isPublished: true
  },
  {
    id: 'transactions-2',
    title: "Filtering and Searching Transactions",
    content: "Finding specific transactions is easy with CashCraft's filtering and search features:\n\nSearch Function:\n- Use the search bar at the top of the Transactions tab\n- Search by description, amount, or category\n- Results update in real-time as you type\n\nFiltering Options:\n- Filter by transaction type (Income/Expense)\n- Filter by category\n- Filter by date range\n- Combine multiple filters for precise results\n\nSorting:\n- Sort by date (newest/oldest first)\n- Sort by amount (highest/lowest)\n- Sort alphabetically by description\n\nAdvanced Tips:\n- Use specific keywords in transaction descriptions for better search results\n- Create consistent category names for easier filtering\n- Regularly review and clean up your transaction list",
    category: "transactions",
    tags: ["search", "filter", "find", "organize", "sort"],
    isPublished: true
  },
  {
    id: 'account-1',
    title: "Updating Your Profile Information",
    content: "Keep your profile information up to date for a personalized experience:\n\nAccessing Profile Settings:\n- Go to the Profile tab in the bottom navigation\n- Tap on 'Personal Information'\n- Tap the 'Edit' button to make changes\n\nEditable Information:\n- Full Name\n- Email Address\n- Phone Number\n- Profile Picture\n- Date of Birth\n- Address Information\n\nSaving Changes:\n- Make your desired changes\n- Tap 'Save' to update your profile\n- Changes are automatically synced to your account\n\nPrivacy and Security:\n- Your personal information is securely stored\n- Only you can view and edit your profile information\n- Profile data is used to personalize your app experience",
    category: "account",
    tags: ["profile", "personal information", "settings", "update", "privacy"],
    isPublished: true
  },
  {
    id: 'account-2',
    title: "Resetting Your Password",
    content: "Forgot your password? No worries! Here's how to reset it:\n\nPassword Reset Process:\n1. On the login screen, tap 'Forgot Password?'\n2. Enter your registered email address\n3. Tap 'Send Reset Link'\n4. Check your email for the password reset link\n5. Click the link in your email\n6. Enter your new password\n7. Confirm the new password\n8. Tap 'Reset Password'\n\nSecurity Tips:\n- Use a strong, unique password\n- Don't share your password with anyone\n- Enable two-factor authentication if available\n- Regularly update your password\n\nTroubleshooting:\n- Check your spam folder if you don't receive the email\n- Ensure you're using the correct email address\n- Wait a few minutes before requesting another reset link\n- Contact support if you continue to have issues",
    category: "account",
    tags: ["password", "reset", "forgot", "security", "login"],
    isPublished: true
  },
  {
    id: 'troubleshooting-1',
    title: "Troubleshooting Common Issues",
    content: "Experiencing issues with CashCraft? Here are solutions to common problems:\n\nApp Not Loading:\n- Check your internet connection\n- Restart the app\n- Clear app cache and data\n- Update to the latest version\n\nTransactions Not Saving:\n- Ensure you have a stable internet connection\n- Check if all required fields are filled\n- Try closing and reopening the app\n- Contact support if the issue persists\n\nSync Issues:\n- Verify your internet connection\n- Pull down to refresh the transaction list\n- Log out and log back in\n- Check if your account is properly connected\n\nPerformance Issues:\n- Close other apps to free up memory\n- Restart your device\n- Update your device's operating system\n- Clear app cache\n\nIf you're still experiencing issues, please contact our support team with specific details about the problem.",
    category: "troubleshooting",
    tags: ["troubleshoot", "issues", "problems", "fix", "support"],
    isPublished: true
  }
];

// Help Center Service
export const helpCenterService = {
  // Get all published help articles
  async getPublishedArticles(): Promise<HelpArticle[]> {
    try {
      // Try to fetch from Firestore first
      const q = query(
        collection(db, 'helpArticles'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const firestoreArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpArticle[];
      
      // If Firestore has articles, return them
      if (firestoreArticles.length > 0) {
        return firestoreArticles;
      }
      
      // Otherwise, return default articles
      console.log('No Firestore articles found, using default articles');
      return DEFAULT_HELP_ARTICLES;
    } catch (error) {
      console.error('Error fetching help articles from Firestore, using defaults:', error);
      // Return default articles on error
      return DEFAULT_HELP_ARTICLES;
    }
  },

  // Get articles by category
  async getArticlesByCategory(category: string): Promise<HelpArticle[]> {
    try {
      const q = query(
        collection(db, 'helpArticles'),
        where('category', '==', category),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const firestoreArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpArticle[];
      
      // If Firestore has articles for this category, return them
      if (firestoreArticles.length > 0) {
        return firestoreArticles;
      }
      
      // Otherwise, filter default articles by category
      return DEFAULT_HELP_ARTICLES.filter(article => article.category === category);
    } catch (error) {
      console.error('Error fetching articles by category from Firestore, using defaults:', error);
      // Return default articles filtered by category
      return DEFAULT_HELP_ARTICLES.filter(article => article.category === category);
    }
  },

  // Search articles
  async searchArticles(searchTerm: string): Promise<HelpArticle[]> {
    try {
      const q = query(
        collection(db, 'helpArticles'),
        where('isPublished', '==', true),
        orderBy('title')
      );
      const querySnapshot = await getDocs(q);
      const firestoreArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpArticle[];
      
      // If Firestore has articles, search through them
      if (firestoreArticles.length > 0) {
        return firestoreArticles.filter(article => 
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Otherwise, search through default articles
      return DEFAULT_HELP_ARTICLES.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching articles from Firestore, using defaults:', error);
      // Search through default articles
      return DEFAULT_HELP_ARTICLES.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  }
};

// Contact Service
export const contactService = {
  // Submit a new contact request
  async submitContact(data: Omit<ContactSubmission, 'id' | 'status' | 'priority' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const contactData = {
        ...data,
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'contactSubmissions'), contactData);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting contact:', error);
      throw error;
    }
  },

  // Get contact submissions for a user
  async getUserContacts(userId: string): Promise<ContactSubmission[]> {
    try {
      const q = query(
        collection(db, 'contactSubmissions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactSubmission[];
    } catch (error) {
      console.error('Error fetching user contacts:', error);
      throw error;
    }
  },

  // Update contact status (admin function)
  async updateContactStatus(contactId: string, status: ContactSubmission['status']): Promise<void> {
    try {
      const contactRef = doc(db, 'contactSubmissions', contactId);
      await updateDoc(contactRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      throw error;
    }
  }
};

// Feedback Service
export const feedbackService = {
  // Submit new feedback
  async submitFeedback(data: Omit<FeedbackSubmission, 'id' | 'status' | 'priority' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const feedbackData = {
        ...data,
        status: 'new' as const,
        priority: 'medium' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'feedbackSubmissions'), feedbackData);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get feedback submissions for a user
  async getUserFeedback(userId: string): Promise<FeedbackSubmission[]> {
    try {
      const q = query(
        collection(db, 'feedbackSubmissions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedbackSubmission[];
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      throw error;
    }
  },

  // Update feedback status (admin function)
  async updateFeedbackStatus(feedbackId: string, status: FeedbackSubmission['status']): Promise<void> {
    try {
      const feedbackRef = doc(db, 'feedbackSubmissions', feedbackId);
      await updateDoc(feedbackRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  }
}; 