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

// Help Center Service
export const helpCenterService = {
  // Get all published help articles
  async getPublishedArticles(): Promise<HelpArticle[]> {
    try {
      const q = query(
        collection(db, 'helpArticles'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpArticle[];
    } catch (error) {
      console.error('Error fetching help articles:', error);
      throw error;
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
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpArticle[];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      throw error;
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
      const articles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpArticle[];
      
      // Filter by search term (Firestore doesn't support full-text search)
      return articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
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