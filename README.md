# 🏦 Bachat - Personal Finance Management App

A comprehensive personal finance management application built with React Native, Expo, and Firebase. Track your income, expenses, and gain insights into your spending habits with beautiful analytics and intuitive user experience.

## 📱 Features

### 🔐 Authentication & User Management
- **Email/Password Authentication** - Secure signup and login
- **Persistent Login** - Stay logged in across app sessions
- **User Profiles** - Manage personal information and preferences
- **Account Security** - Logout and session management

### 💰 Financial Tracking
- **Transaction Management** - Add, edit, delete income and expenses
- **Category System** - Custom categories with icons and colors
- **Real-time Sync** - Instant updates across all devices
- **Data Export** - Export transactions as CSV/PDF

### 📊 Analytics & Insights
- **Spending Dashboard** - Visual breakdown of expenses by category
- **Income vs Expense** - Track your financial balance
- **Trend Analysis** - Monthly and yearly spending patterns
- **Category Analytics** - Top spending categories with percentages

### 🎨 User Experience
- **Beautiful UI** - Modern, intuitive interface design
- **Empty States** - Helpful guidance when no data exists
- **Pull-to-Refresh** - Easy data synchronization
- **Loading States** - Smooth user experience during operations

### 🛠 Support & Legal
- **Help Center** - Comprehensive FAQ and guides
- **Contact Support** - Multiple ways to get help
- **Feedback System** - Share your thoughts and suggestions
- **Legal Documentation** - Privacy policy and terms of service

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bachat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Download `google-services.json` and place in project root
   - Update Firebase configuration in `app/firebaseConfig.ts`

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Scan QR code with Expo Go app (Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## 🏗 Project Structure

```
bachat/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── home.tsx             # Home screen with overview
│   │   ├── dashboard.tsx        # Analytics dashboard
│   │   ├── add.tsx              # Add transaction screen
│   │   ├── transactions.tsx     # Transaction list
│   │   └── profile.tsx          # User profile
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx            # Login screen
│   │   ├── signup.tsx           # Signup screen
│   │   ├── forgot-password.tsx  # Password reset
│   │   └── otp-verification.tsx # OTP verification
│   ├── components/               # Reusable components
│   │   ├── personal-information.tsx
│   │   ├── manage-categories.tsx
│   │   └── transaction-details.tsx
│   ├── services/                 # Business logic
│   │   ├── categoriesService.ts
│   │   └── transactionsService.ts
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx
│   ├── utils/                    # Utility functions
│   │   └── dateUtils.ts
│   ├── support/                  # Support pages
│   │   ├── index.tsx
│   │   ├── help-center.tsx
│   │   ├── contact.tsx
│   │   └── feedback.tsx
│   ├── legal/                    # Legal pages
│   │   ├── index.tsx
│   │   ├── privacy-policy.tsx
│   │   └── terms-of-service.tsx
│   ├── firebaseConfig.ts         # Firebase configuration
│   └── _layout.tsx              # Root layout
├── assets/                       # Static assets
│   ├── images/                  # App images and icons
│   └── fonts/                   # Custom fonts
├── google-services.json          # Firebase configuration
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🔥 Firebase Configuration

### Database Structure

#### Users Collection
```typescript
users/{userId} {
  uid: string,
  email: string,
  fullName: string,
  phone: string,
  gender: string,
  profession: string,
  username: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Categories Collection
```typescript
categories/{categoryId} {
  id: string,
  name: string,
  type: 'income' | 'expense',
  color: string,
  icon: string,
  userId: string,
  createdAt: Timestamp
}
```

#### Transactions Collection
```typescript
transactions/{transactionId} {
  id: string,
  description: string,
  amount: number,
  type: 'income' | 'expense',
  categoryId: string,
  categoryName: string,
  categoryColor: string,
  categoryIcon: string,
  date: Timestamp,
  userId: string,
  createdAt: Timestamp
}
```

### Security Rules
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

## 🛠 Development

### Key Technologies
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **Firebase** - Backend as a Service (Auth, Firestore)
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation between screens

### State Management
- **React Context** - Global authentication state
- **Local State** - Component-specific state management
- **Firebase Real-time** - Live data synchronization

### Styling
- **StyleSheet** - React Native styling
- **Consistent Design System** - Colors, typography, spacing
- **Responsive Design** - Works on all screen sizes

## 📱 Screens & Features

### Authentication Flow
1. **Login Screen** - Email/password authentication
2. **Signup Screen** - User registration with profile data
3. **Forgot Password** - Password recovery
4. **OTP Verification** - Two-factor authentication

### Main App Flow
1. **Home Screen** - Overview, recent transactions, category spending
2. **Dashboard** - Analytics, charts, spending insights
3. **Add Transaction** - Create new income/expense entries
4. **Transactions List** - View, edit, delete transactions
5. **Profile** - User settings, categories, support, legal

### Support & Legal
1. **Help Center** - FAQ and troubleshooting guides
2. **Contact Support** - Multiple contact methods
3. **Feedback** - User feedback submission
4. **Privacy Policy** - Data protection information
5. **Terms of Service** - Usage terms and conditions

## 🔧 API Services

### Categories Service
```typescript
// Key functions
- getUserCategories(userId: string): Promise<Category[]>
- createCategory(category: Category): Promise<void>
- updateCategory(categoryId: string, updates: Partial<Category>): Promise<void>
- deleteCategory(categoryId: string): Promise<void>
- createDefaultCategories(userId: string): Promise<void>
```

### Transactions Service
```typescript
// Key functions
- getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>
- createTransaction(transaction: Transaction): Promise<void>
- updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void>
- deleteTransaction(transactionId: string): Promise<void>
- getTransactionStats(userId: string): Promise<TransactionStats>
```

## 🎨 UI Components

### Empty States
- **Beautiful empty states** for all main screens
- **Contextual messaging** based on data availability
- **Call-to-action buttons** to guide users
- **Consistent design** across the app

### Loading States
- **Activity indicators** during data operations
- **Skeleton loading** for better UX
- **Pull-to-refresh** for manual data sync
- **Error handling** with user-friendly messages

## 🚀 Deployment

### Development
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo run:ios
npx expo run:android
```

### Production Build
```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

## 📊 Performance

### Optimizations
- **Efficient Firestore queries** with proper indexing
- **Client-side sorting** to avoid query limitations
- **Data caching** for better performance
- **Optimized images** and assets
- **Lazy loading** for large datasets

### Monitoring
- **Firebase Analytics** for user behavior
- **Crash reporting** for error tracking
- **Performance monitoring** for app metrics

## 🔒 Security

### Authentication
- **Firebase Auth** with email/password
- **Secure token management**
- **Session persistence**
- **Logout functionality**

### Data Protection
- **User data isolation** in Firestore
- **Encrypted data transmission**
- **Secure API endpoints**
- **Privacy compliance**

## 🧪 Testing

### Manual Testing
- **Cross-platform testing** (iOS/Android)
- **Authentication flow** testing
- **Data synchronization** testing
- **Error handling** testing

### Automated Testing
- **Unit tests** for services
- **Component tests** for UI
- **Integration tests** for flows
- **E2E tests** for critical paths

## 📈 Analytics

### User Metrics
- **User engagement** tracking
- **Feature usage** analytics
- **Error tracking** and monitoring
- **Performance metrics**

### Business Metrics
- **User acquisition** tracking
- **Retention rates** analysis
- **Feature adoption** rates
- **User feedback** collection

## 🛠 Troubleshooting

### Common Issues

#### Firebase Connection Issues
```bash
# Check Firebase configuration
- Verify google-services.json is in project root
- Check Firebase project settings
- Ensure Firestore rules are correct
```

#### Navigation Issues
```bash
# Fix navigation problems
- Check route definitions
- Verify navigation imports
- Test navigation flow
```

#### Data Sync Issues
```bash
# Resolve sync problems
- Check internet connection
- Verify Firestore rules
- Test data fetching logic
```

## 📚 Resources

### Documentation
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Navigation Documentation](https://reactnavigation.org/)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Expo Community](https://forums.expo.dev/)
- [Firebase Community](https://firebase.google.com/community)

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- **React Native** team for the amazing framework
- **Expo** team for the development platform
- **Firebase** team for the backend services
- **React Navigation** team for navigation solutions

## 📞 Support

For support and questions:
- **Email**: support@bachat.app
- **Documentation**: [Help Center](/support)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Bachat** - Your Personal Finance Companion 💰📱
