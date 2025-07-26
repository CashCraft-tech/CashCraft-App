# 🔧 Bachat - Technical Documentation

Comprehensive technical documentation for the Bachat personal finance management application.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Firebase Setup](#firebase-setup)
3. [Data Models](#data-models)
4. [Authentication Flow](#authentication-flow)
5. [State Management](#state-management)
6. [API Services](#api-services)
7. [Navigation Structure](#navigation-structure)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Security Implementation](#security-implementation)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Guide](#deployment-guide)

## 🏗 Architecture Overview

### Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + Local State
- **Styling**: React Native StyleSheet

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Expo Router   │    │   Firebase      │
│   Components    │◄──►│   Navigation    │◄──►│   Backend       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local State   │    │   Auth Context  │    │   Firestore     │
│   Management    │    │   Global State  │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔥 Firebase Setup

### Project Configuration

#### 1. Firebase Project Creation
```bash
# Create new Firebase project
1. Go to Firebase Console
2. Create new project: "bachat-app"
3. Enable Google Analytics (optional)
```

#### 2. Authentication Setup
```javascript
// Enable Email/Password authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password provider
3. Configure password requirements
4. Set up password reset email templates
```

#### 3. Firestore Database Setup
```javascript
// Create Firestore database
1. Go to Firestore Database
2. Create database in production mode
3. Choose location (us-central1 recommended)
4. Set up security rules
```

#### 4. Security Rules Configuration
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can manage their own categories
    match /categories/{categoryId} {
      allow read, write, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Users can manage their own transactions
    match /transactions/{transactionId} {
      allow read, write, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### 5. Configuration Files
```typescript
// app/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Collection references
export const usersRef = collection(db, 'users');
export const categoriesRef = collection(db, 'categories');
export const transactionsRef = collection(db, 'transactions');
```

## 📊 Data Models

### TypeScript Interfaces

#### User Interface
```typescript
interface User {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  gender: string;
  profession: string;
  username: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  userId: string;
  createdAt: Timestamp;
}
```

#### Transaction Interface
```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  date: Timestamp;
  userId: string;
  createdAt: Timestamp;
}
```

#### Transaction Stats Interface
```typescript
interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}
```

## 🔐 Authentication Flow

### Implementation Details

#### 1. Auth Context Setup
```typescript
// app/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### 2. Signup Process
```typescript
// app/auth/signup.tsx
const handleSignup = async () => {
  try {
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      form.email, 
      form.password
    );
    
    // 2. Save user profile to Firestore
    const userProfile = {
      uid: userCredential.user.uid,
      email: form.email,
      fullName: form.fullName,
      phone: form.phone,
      gender: form.gender,
      profession: form.profession,
      username: form.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    
    // 3. Create default categories
    await categoriesService.createDefaultCategories(userCredential.user.uid);
    
  } catch (error) {
    // Handle specific Firebase errors
    console.error('Signup error:', error);
  }
};
```

#### 3. Login Process
```typescript
// app/auth/login.tsx
const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Navigation handled by AuthContext
  } catch (error) {
    // Handle login errors
    console.error('Login error:', error);
  }
};
```

## 🎯 State Management

### Global State (Auth Context)
```typescript
// Authentication state
const { user, loading } = useAuth();

// Usage in components
if (loading) return <LoadingScreen />;
if (!user) return <LoginScreen />;
```

### Local State Management
```typescript
// Component state
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

// State updates
const fetchData = async () => {
  setLoading(true);
  try {
    const data = await transactionsService.getUserTransactions(user.uid);
    setTransactions(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
```

## 🔧 API Services

### Categories Service
```typescript
// app/services/categoriesService.ts
export const categoriesService = {
  // Get user categories
  async getUserCategories(userId: string): Promise<Category[]> {
    const q = query(
      categoriesRef,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  },

  // Create new category
  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<void> {
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: serverTimestamp()
    });
  },

  // Update category
  async updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
    await updateDoc(doc(categoriesRef, categoryId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    await deleteDoc(doc(categoriesRef, categoryId));
  },

  // Create default categories for new user
  async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      { name: 'Food & Dining', type: 'expense', color: '#FF6B6B', icon: 'utensils' },
      { name: 'Transportation', type: 'expense', color: '#4ECDC4', icon: 'car' },
      { name: 'Shopping', type: 'expense', color: '#45B7D1', icon: 'shopping-cart' },
      { name: 'Bills', type: 'expense', color: '#96CEB4', icon: 'receipt' },
      { name: 'Salary', type: 'income', color: '#FFEAA7', icon: 'dollar-sign' },
      { name: 'Freelance', type: 'income', color: '#DDA0DD', icon: 'laptop' }
    ];

    for (const category of defaultCategories) {
      await this.createCategory({
        ...category,
        userId
      });
    }
  }
};
```

### Transactions Service
```typescript
// app/services/transactionsService.ts
export const transactionsService = {
  // Get user transactions
  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    let q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    if (limit) {
      q = query(q, limit(limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  },

  // Create transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(transactionsRef, {
      ...transaction,
      createdAt: serverTimestamp()
    });
  },

  // Get transaction statistics
  async getTransactionStats(userId: string): Promise<TransactionStats> {
    const transactions = await this.getUserTransactions(userId, 1000);
    
    const stats = transactions.reduce((acc, tx) => {
      if (tx.type === 'income') {
        acc.totalIncome += tx.amount;
      } else {
        acc.totalExpense += tx.amount;
      }
      acc.transactionCount++;
      return acc;
    }, {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0
    });
    
    stats.balance = stats.totalIncome - stats.totalExpense;
    return stats;
  }
};
```

## 🧭 Navigation Structure

### File-based Routing (Expo Router)
```
app/
├── _layout.tsx                    # Root layout with AuthProvider
├── index.tsx                     # Entry point (redirect logic)
├── (tabs)/                       # Tab navigation
│   ├── _layout.tsx              # Tab layout
│   ├── home.tsx                 # Home screen
│   ├── dashboard.tsx            # Dashboard screen
│   ├── add.tsx                  # Add transaction
│   ├── transactions.tsx         # Transactions list
│   └── profile.tsx              # Profile screen
├── auth/                         # Authentication screens
│   ├── login.tsx                # Login
│   ├── signup.tsx               # Signup
│   ├── forgot-password.tsx      # Password reset
│   └── otp-verification.tsx     # OTP verification
├── components/                   # Reusable components
│   ├── personal-information.tsx
│   ├── manage-categories.tsx
│   └── transaction-details.tsx
├── support/                      # Support pages
│   ├── index.tsx                # Support hub
│   ├── help-center.tsx          # FAQ
│   ├── contact.tsx              # Contact support
│   └── feedback.tsx             # Feedback form
└── legal/                        # Legal pages
    ├── index.tsx                # Legal hub
    ├── privacy-policy.tsx       # Privacy policy
    └── terms-of-service.tsx     # Terms of service
```

### Navigation Implementation
```typescript
// Navigation between screens
import { router } from 'expo-router';

// Navigate to specific screen
router.push('/support');
router.push('/legal/privacy-policy');
router.push('/components/transaction-details');

// Go back
router.back();

// Replace current screen
router.replace('/auth/login');
```

## ⚠️ Error Handling

### Firebase Error Handling
```typescript
// Authentication errors
const handleAuthError = (error: any) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Firestore errors
const handleFirestoreError = (error: any) => {
  if (error.code === 'permission-denied') {
    return 'You don\'t have permission to perform this action.';
  }
  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.';
  }
  return 'An error occurred while saving data.';
};
```

### Component Error Boundaries
```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
```

## ⚡ Performance Optimization

### Firestore Query Optimization
```typescript
// Efficient queries with proper indexing
const getUserTransactions = async (userId: string, limit = 50) => {
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limit)
  );
  
  return getDocs(q);
};

// Client-side sorting to avoid index issues
const getCategories = async (userId: string) => {
  const q = query(categoriesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  // Sort client-side to avoid composite index requirements
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
```

### Component Optimization
```typescript
// Memoized components
const TransactionItem = React.memo(({ transaction, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(transaction)}>
      {/* Transaction item content */}
    </TouchableOpacity>
  );
});

// Optimized list rendering
const TransactionsList = ({ transactions }) => {
  const renderItem = useCallback(({ item }) => (
    <TransactionItem transaction={item} onPress={handleTransactionPress} />
  ), []);

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
};
```

## 🔒 Security Implementation

### Data Validation
```typescript
// Input validation
const validateTransaction = (transaction: Partial<Transaction>) => {
  const errors: string[] = [];
  
  if (!transaction.description?.trim()) {
    errors.push('Description is required');
  }
  
  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!transaction.categoryId) {
    errors.push('Category is required');
  }
  
  return errors;
};

// Sanitize user input
const sanitizeInput = (input: string) => {
  return input.trim().replace(/[<>]/g, '');
};
```

### Authentication Security
```typescript
// Password requirements
const validatePassword = (password: string) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (password.length < minLength) {
    return 'Password must be at least 6 characters long';
  }
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return 'Password must contain uppercase, lowercase, and numbers';
  }
  
  return null;
};
```

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Service testing
describe('CategoriesService', () => {
  it('should create default categories for new user', async () => {
    const userId = 'test-user-id';
    await categoriesService.createDefaultCategories(userId);
    
    const categories = await categoriesService.getUserCategories(userId);
    expect(categories).toHaveLength(6);
    expect(categories[0].userId).toBe(userId);
  });
});

// Component testing
describe('TransactionItem', () => {
  it('should render transaction details correctly', () => {
    const transaction = mockTransaction;
    const { getByText } = render(<TransactionItem transaction={transaction} />);
    
    expect(getByText(transaction.description)).toBeTruthy();
    expect(getByText(`₹${transaction.amount}`)).toBeTruthy();
  });
});
```

### Integration Testing
```typescript
// Authentication flow testing
describe('Authentication Flow', () => {
  it('should sign up user and create profile', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User'
    };
    
    // Sign up
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    // Verify profile created
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    expect(userDoc.exists()).toBe(true);
    expect(userDoc.data().fullName).toBe(userData.fullName);
  });
});
```

## 🚀 Deployment Guide

### Development Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for development
eas build --profile development --platform all
```

### Production Build
```bash
# Build for production
eas build --profile production --platform all

# Submit to app stores
eas submit --platform all
```

### Environment Configuration
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### App Store Preparation
```bash
# iOS App Store
1. Create App Store Connect app
2. Upload build via EAS
3. Add app metadata and screenshots
4. Submit for review

# Google Play Store
1. Create Play Console app
2. Upload APK/AAB via EAS
3. Add store listing
4. Submit for review
```

## 📊 Monitoring & Analytics

### Firebase Analytics
```typescript
// Track user events
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Track transaction creation
logEvent(analytics, 'transaction_created', {
  transaction_type: 'expense',
  category: 'food',
  amount: 25.50
});

// Track user engagement
logEvent(analytics, 'screen_view', {
  screen_name: 'home',
  screen_class: 'HomeScreen'
});
```

### Error Monitoring
```typescript
// Crash reporting
import { getCrashlytics, log } from 'firebase/crashlytics';

const crashlytics = getCrashlytics();

// Log errors
try {
  // Risky operation
} catch (error) {
  log(crashlytics, error);
  console.error('Error:', error);
}
```

## 🔄 Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: eas build --platform all --non-interactive
```

---

This technical documentation provides a comprehensive guide for developers working on the Bachat application. For additional support, refer to the main README.md file or contact the development team. 