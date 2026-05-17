# Firebase Support Integration

This document explains how Firebase is integrated into the Bachat app for collecting and managing support data including help center articles, contact submissions, and feedback.

## Overview

The Firebase integration provides three main services:
1. **Help Center Service** - Manages help articles with categories and search functionality
2. **Contact Service** - Handles contact form submissions from users
3. **Feedback Service** - Manages user feedback and feature requests

## Firebase Collections

The following Firestore collections are used:

- `helpArticles` - Stores help center articles
- `contactSubmissions` - Stores user contact requests
- `feedbackSubmissions` - Stores user feedback

## Setup Instructions

### 1. Firebase Configuration

The Firebase configuration is already set up in `app/firebaseConfig.ts`. The following collections are exported:

```typescript
export const helpArticlesCollection = collection(db, 'helpArticles');
export const contactSubmissionsCollection = collection(db, 'contactSubmissions');
export const feedbackSubmissionsCollection = collection(db, 'feedbackSubmissions');
```

### 2. Populate Sample Data

To populate your Firebase database with sample help articles, run the provided script:

```bash
cd bachat
node scripts/populate-help-articles.js
```

This will create 10 sample help articles covering various topics like getting started, transactions, categories, account management, and troubleshooting.

## Services Overview

### Help Center Service (`helpCenterService`)

**Methods:**
- `getPublishedArticles()` - Get all published help articles
- `getArticlesByCategory(category)` - Get articles filtered by category
- `searchArticles(searchTerm)` - Search articles by title, content, or tags

**Article Structure:**
```typescript
interface HelpArticle {
  id?: string;
  title: string;
  content: string;
  category: 'getting-started' | 'transactions' | 'categories' | 'account' | 'troubleshooting';
  tags: string[];
  isPublished: boolean;
  createdAt?: any;
  updatedAt?: any;
}
```

### Contact Service (`contactService`)

**Methods:**
- `submitContact(data)` - Submit a new contact request
- `getUserContacts(userId)` - Get contact submissions for a specific user
- `updateContactStatus(contactId, status)` - Update contact status (admin function)

**Contact Structure:**
```typescript
interface ContactSubmission {
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
```

### Feedback Service (`feedbackService`)

**Methods:**
- `submitFeedback(data)` - Submit new feedback
- `getUserFeedback(userId)` - Get feedback submissions for a specific user
- `updateFeedbackStatus(feedbackId, status)` - Update feedback status (admin function)

**Feedback Structure:**
```typescript
interface FeedbackSubmission {
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
```

## Usage Examples

### Submitting Contact Request

```typescript
import { contactService } from '../services/supportService';

const handleSubmitContact = async () => {
  try {
    await contactService.submitContact({
      userId: user?.uid,
      userEmail: user?.email,
      subject: 'App Issue',
      message: 'I\'m experiencing a problem with...',
      contactMethod: 'email'
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Submitting Feedback

```typescript
import { feedbackService } from '../services/supportService';

const handleSubmitFeedback = async () => {
  try {
    await feedbackService.submitFeedback({
      userId: user?.uid,
      userEmail: user?.email,
      feedbackType: 'feature',
      title: 'Dark Mode Request',
      description: 'I would love to see a dark mode option...',
      rating: 5
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Loading Help Articles

```typescript
import { helpCenterService } from '../services/supportService';

const loadArticles = async () => {
  try {
    const articles = await helpCenterService.getPublishedArticles();
    setArticles(articles);
  } catch (error) {
    // Handle error
  }
};
```

## Components

### Updated Components

1. **Contact Form** (`app/support/contact.tsx`)
   - Now submits data to Firebase
   - Includes loading states and error handling
   - Automatically captures user information

2. **Feedback Form** (`app/support/feedback.tsx`)
   - Submits feedback to Firebase
   - Supports different feedback types
   - Includes rating system

3. **Help Center** (`app/support/help-center.tsx`)
   - Fetches articles from Firebase
   - Includes search and category filtering
   - Displays articles in a clean interface

4. **Article Detail** (`app/support/article-detail.tsx`)
   - Displays full article content
   - Includes helpful/not helpful feedback
   - Links to contact support

## Admin Functions

For admin users, the following functions are available:

### Update Contact Status
```typescript
await contactService.updateContactStatus(contactId, 'resolved');
```

### Update Feedback Status
```typescript
await feedbackService.updateFeedbackStatus(feedbackId, 'in-progress');
```

## Security Rules

Make sure your Firestore security rules allow the following operations:

```javascript
// Help Articles - Read access for all users
match /helpArticles/{document} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.admin == true;
}

// Contact Submissions - Users can create, read their own
match /contactSubmissions/{document} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
  allow update: if request.auth != null && request.auth.token.admin == true;
}

// Feedback Submissions - Users can create, read their own
match /feedbackSubmissions/{document} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && 
    (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
  allow update: if request.auth != null && request.auth.token.admin == true;
}
```

## Error Handling

All services include proper error handling:

```typescript
try {
  const result = await service.method();
  // Handle success
} catch (error) {
  console.error('Service error:', error);
  // Show user-friendly error message
  Alert.alert('Error', 'Failed to complete the operation. Please try again.');
}
```

## Testing

To test the integration:

1. Run the populate script to add sample data
2. Test contact form submission
3. Test feedback form submission
4. Test help center search and filtering
5. Verify data appears in Firebase Console

## Future Enhancements

Potential improvements for the support system:

1. **Email Notifications** - Send email confirmations for contact/feedback submissions
2. **Admin Dashboard** - Web interface for managing submissions
3. **Article Analytics** - Track which articles are most helpful
4. **User Feedback Tracking** - Store helpful/not helpful responses
5. **Auto-categorization** - Automatically categorize contact submissions
6. **Response Templates** - Pre-written responses for common issues

## Support

For questions or issues with the Firebase integration, please refer to:
- Firebase Documentation: https://firebase.google.com/docs
- Firestore Documentation: https://firebase.google.com/docs/firestore
- React Native Firebase: https://rnfirebase.io/ 