# 🚀 Bachat - Setup Guide

Complete setup instructions for the Bachat personal finance management app.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase account
- Git

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd bachat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "bachat-app"
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

#### Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select location (us-central1 recommended)
5. Click "Done"

#### Get Firebase Configuration
1. In Firebase Console, go to "Project Settings"
2. Scroll down to "Your apps" section
3. Click "Add app" and choose "Web"
4. Register app with name "Bachat Web"
5. Copy the configuration object

### 4. Configure Firebase in Your App

#### Create Firebase Config File
1. Copy `app/firebaseConfig.example.ts` to `app/firebaseConfig.ts`
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

#### Download Google Services File (Android)
1. In Firebase Console, go to "Project Settings"
2. Scroll down to "Your apps" section
3. Click "Add app" and choose "Android"
4. Enter package name: "com.bachat.app"
5. Download `google-services.json`
6. Place it in the project root directory

### 5. Set Up Firestore Security Rules

In Firebase Console, go to "Firestore Database" > "Rules" and paste:

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

### 6. Start Development Server
```bash
npx expo start
```

### 7. Run on Device/Simulator
- **Android**: Press 'a' or scan QR code with Expo Go app
- **iOS**: Press 'i' or scan QR code with Camera app
- **Web**: Press 'w'

## 🔒 Security Checklist

Before pushing to GitHub, ensure:

- ✅ `google-services.json` is in `.gitignore`
- ✅ `app/firebaseConfig.ts` is in `.gitignore`
- ✅ No API keys are hardcoded in source code
- ✅ Environment variables are used for sensitive data
- ✅ Firebase security rules are properly configured

## 🚨 Important Notes

### Never Commit Sensitive Files
- `google-services.json` - Contains Firebase credentials
- `app/firebaseConfig.ts` - Contains API keys
- `.env` files - May contain secrets
- Any files with API keys or passwords

### Environment Variables
For production, use environment variables:

```bash
# .env.local (not committed to git)
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
```

### Testing
After setup, test:
1. User registration
2. User login
3. Creating categories
4. Adding transactions
5. Data synchronization

## 🆘 Troubleshooting

### Common Issues

#### Firebase Connection Error
- Verify Firebase configuration in `firebaseConfig.ts`
- Check if `google-services.json` is in project root
- Ensure Firestore rules are properly set

#### Authentication Issues
- Verify Email/Password provider is enabled
- Check Firebase project settings
- Ensure proper error handling in auth flow

#### Data Not Syncing
- Check Firestore security rules
- Verify user authentication state
- Check network connectivity

## 📞 Support

If you encounter issues:
1. Check the [README.md](README.md) for detailed documentation
2. Review [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)
3. Check Firebase Console for errors
4. Verify all setup steps are completed

---

**Happy coding! 🎉** 