# Firestore Security Rules for CashCraft

This document provides the recommended Firestore security rules for the CashCraft app, including rules for notification tokens.

## 🔐 Complete Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own categories
    match /categories/{categoryId} {
      allow read, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth != null && resource.data != null && request.auth.uid == resource.data.userId;
    }
    
    // Users can read and write their own transactions
    match /transactions/{transactionId} {
      allow read, update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow delete: if request.auth != null && resource.data != null && request.auth.uid == resource.data.userId;
    }

    // Users can read and write their own notification tokens
    match /notificationTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read and write their own notifications
    match /notifications/{notificationId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // OTP codes - allow creation and reading for password reset (no auth required)
    match /otpCodes/{email} {
      allow read, write: if true;
    }

    // Help Articles - Read access for all authenticated users
    match /helpArticles/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Contact Submissions - Users can create and read their own
    match /contactSubmissions/{document} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Feedback Submissions - Users can create and read their own
    match /feedbackSubmissions/{document} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📱 Notification Token Rules

The key addition is the `notificationTokens` collection:

```javascript
match /notificationTokens/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

This ensures that:
- Users can only access their own notification tokens
- Authentication is required
- Users can read and write their own tokens
- The document ID matches the user's UID

## 🚨 Permission Issues

If you're getting "Missing or insufficient permissions" errors:

### 1. Check Authentication
Make sure the user is properly authenticated before accessing Firestore.

### 2. Verify User ID
Ensure the document ID matches the authenticated user's UID.

### 3. Update Rules
Deploy the security rules above to your Firestore project.

### 4. Test Rules
Use the Firestore Rules Playground to test your rules.

## 🔧 Deployment

### Via Firebase Console
1. Go to Firestore Database
2. Click on "Rules" tab
3. Paste the rules above
4. Click "Publish"

### Via Firebase CLI
```bash
firebase deploy --only firestore:rules
```

## 📋 Testing Rules

### Test Notification Token Access
```javascript
// This should work for authenticated users
const tokenRef = doc(db, 'notificationTokens', user.uid);
await setDoc(tokenRef, {
  token: 'expo-push-token',
  platform: 'ios',
  userId: user.uid
});
```

### Test User Data Access
```javascript
// This should work for authenticated users
const userRef = doc(db, 'users', user.uid);
await setDoc(userRef, {
  email: user.email,
  fullName: 'John Doe'
});
```

## 🛡️ Security Best Practices

1. **Always authenticate users** before allowing Firestore access
2. **Validate user ownership** of documents
3. **Use specific rules** for each collection
4. **Test rules thoroughly** before deployment
5. **Monitor access patterns** for suspicious activity
6. **Regularly review and update** security rules

## 🔍 Debugging

### Enable Firestore Logging
```javascript
// In your app
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Temporarily disable network to see local changes
await disableNetwork(db);
// Re-enable network
await enableNetwork(db);
```

### Check Authentication State
```javascript
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is authenticated:', user.uid);
  } else {
    console.log('User is not authenticated');
  }
});
```

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices) 