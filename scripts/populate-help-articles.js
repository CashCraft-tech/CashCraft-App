const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyBAQp3DAHj-16bmWi9JwbnEvpfmXKhySoI",
  authDomain: "bachat-991f9.firebaseapp.com",
  projectId: "bachat-991f9",
  storageBucket: "bachat-991f9.firebasestorage.app",
  messagingSenderId: "888504934769",
  appId: "1:888504934769:android:ebf8927e8ab117606156d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample help articles data
const helpArticles = [
  {
    title: "Getting Started with Bachat",
    content: "Welcome to Bachat! This guide will help you get started with managing your expenses and income effectively.\n\n1. Create your first transaction by tapping the '+' button on the bottom tab bar\n2. Choose between Income or Expense\n3. Enter the amount and description\n4. Select a category or create a new one\n5. Add any additional notes\n6. Tap 'Save Transaction' to complete\n\nYour transaction will now appear in your transaction list and contribute to your spending analytics.",
    category: "getting-started",
    tags: ["first time", "setup", "transactions", "basics"],
    isPublished: true
  },
  {
    title: "How to Add Your First Transaction",
    content: "Adding transactions is the core feature of Bachat. Here's how to do it step by step:\n\n1. Navigate to the 'Add' tab in the bottom navigation\n2. Select the transaction type (Income or Expense)\n3. Enter the amount in the amount field\n4. Provide a clear description of the transaction\n5. Choose an appropriate category from the dropdown\n6. Optionally add notes for additional context\n7. Tap the 'Save Transaction' button\n\nYour transaction will be saved and you'll see a confirmation message. The transaction will immediately appear in your transaction list and update your dashboard analytics.",
    category: "getting-started",
    tags: ["transactions", "add", "first time", "income", "expense"],
    isPublished: true
  },
  {
    title: "Managing Transaction Categories",
    content: "Categories help you organize and track your spending patterns. Here's how to manage them:\n\nCreating Categories:\n- Go to Profile → Manage Categories\n- Tap the '+' button to add a new category\n- Choose an icon and color that represents the category\n- Enter a name for your category\n- Save the category\n\nEditing Categories:\n- Tap on any existing category to edit its details\n- You can change the name, icon, or color\n- Save your changes\n\nDeleting Categories:\n- Swipe left on a category to reveal the delete option\n- Note: Categories with existing transactions cannot be deleted\n\nDefault categories are provided, but you can create custom ones that better fit your spending habits.",
    category: "categories",
    tags: ["categories", "manage", "custom", "organization"],
    isPublished: true
  },
  {
    title: "Understanding Your Dashboard",
    content: "The Dashboard provides a comprehensive overview of your financial activity:\n\nKey Features:\n1. Monthly Overview: See your total income and expenses for the current month\n2. Spending Breakdown: Visual representation of expenses by category\n3. Recent Transactions: Quick access to your latest transactions\n4. Monthly Trends: Track your spending patterns over time\n\nUnderstanding the Charts:\n- The pie chart shows your spending distribution across categories\n- The bar chart displays monthly trends for income vs expenses\n- Tap on any chart segment to see detailed information\n\nTips for Better Insights:\n- Regularly categorize your transactions\n- Review your dashboard weekly to track spending patterns\n- Use the insights to identify areas where you can save money",
    category: "transactions",
    tags: ["dashboard", "analytics", "charts", "insights", "trends"],
    isPublished: true
  },
  {
    title: "Filtering and Searching Transactions",
    content: "Finding specific transactions is easy with Bachat's filtering and search features:\n\nSearch Function:\n- Use the search bar at the top of the Transactions tab\n- Search by description, amount, or category\n- Results update in real-time as you type\n\nFiltering Options:\n- Filter by transaction type (Income/Expense)\n- Filter by category\n- Filter by date range\n- Combine multiple filters for precise results\n\nSorting:\n- Sort by date (newest/oldest first)\n- Sort by amount (highest/lowest)\n- Sort alphabetically by description\n\nAdvanced Tips:\n- Use specific keywords in transaction descriptions for better search results\n- Create consistent category names for easier filtering\n- Regularly review and clean up your transaction list",
    category: "transactions",
    tags: ["search", "filter", "find", "organize", "sort"],
    isPublished: true
  },
  {
    title: "Editing and Deleting Transactions",
    content: "Need to correct a transaction? Here's how to edit or delete transactions:\n\nEditing Transactions:\n1. Tap on any transaction in your transaction list\n2. Tap the 'Edit' button in the transaction details\n3. Modify any field (amount, description, category, etc.)\n4. Tap 'Save' to update the transaction\n\nDeleting Transactions:\n1. Tap on the transaction you want to delete\n2. Tap the 'Delete' button in the transaction details\n3. Confirm the deletion in the popup dialog\n\nImportant Notes:\n- Editing a transaction will update all related analytics and reports\n- Deleted transactions cannot be recovered\n- Consider editing instead of deleting if you want to maintain transaction history\n- Changes are automatically synced across all your devices",
    category: "transactions",
    tags: ["edit", "delete", "modify", "correct", "update"],
    isPublished: true
  },
  {
    title: "Updating Your Profile Information",
    content: "Keep your profile information up to date for a personalized experience:\n\nAccessing Profile Settings:\n- Go to the Profile tab in the bottom navigation\n- Tap on 'Personal Information'\n- Tap the 'Edit' button to make changes\n\nEditable Information:\n- Full Name\n- Email Address\n- Phone Number\n- Profile Picture\n- Date of Birth\n- Address Information\n\nSaving Changes:\n- Make your desired changes\n- Tap 'Save' to update your profile\n- Changes are automatically synced to your account\n\nPrivacy and Security:\n- Your personal information is securely stored\n- Only you can view and edit your profile information\n- Profile data is used to personalize your app experience",
    category: "account",
    tags: ["profile", "personal information", "settings", "update", "privacy"],
    isPublished: true
  },
  {
    title: "Resetting Your Password",
    content: "Forgot your password? No worries! Here's how to reset it:\n\nPassword Reset Process:\n1. On the login screen, tap 'Forgot Password?'\n2. Enter your registered email address\n3. Tap 'Send Reset Link'\n4. Check your email for the password reset link\n5. Click the link in your email\n6. Enter your new password\n7. Confirm the new password\n8. Tap 'Reset Password'\n\nSecurity Tips:\n- Use a strong, unique password\n- Don't share your password with anyone\n- Enable two-factor authentication if available\n- Regularly update your password\n\nTroubleshooting:\n- Check your spam folder if you don't receive the email\n- Ensure you're using the correct email address\n- Wait a few minutes before requesting another reset link\n- Contact support if you continue to have issues",
    category: "account",
    tags: ["password", "reset", "forgot", "security", "login"],
    isPublished: true
  },
  {
    title: "Troubleshooting Common Issues",
    content: "Experiencing issues with Bachat? Here are solutions to common problems:\n\nApp Not Loading:\n- Check your internet connection\n- Restart the app\n- Clear app cache and data\n- Update to the latest version\n\nTransactions Not Saving:\n- Ensure you have a stable internet connection\n- Check if all required fields are filled\n- Try closing and reopening the app\n- Contact support if the issue persists\n\nSync Issues:\n- Verify your internet connection\n- Pull down to refresh the transaction list\n- Log out and log back in\n- Check if your account is properly connected\n\nPerformance Issues:\n- Close other apps to free up memory\n- Restart your device\n- Update your device's operating system\n- Clear app cache\n\nIf you're still experiencing issues, please contact our support team with specific details about the problem.",
    category: "troubleshooting",
    tags: ["troubleshoot", "issues", "problems", "fix", "support"],
    isPublished: true
  },
  {
    title: "Data Backup and Recovery",
    content: "Your data is important! Here's how Bachat protects and backs up your information:\n\nAutomatic Backup:\n- All your data is automatically backed up to the cloud\n- Transactions, categories, and settings are synced in real-time\n- Your data is available across all your devices\n\nData Recovery:\n- If you reinstall the app, simply log in to restore your data\n- All your transactions and settings will be automatically restored\n- No manual backup process is required\n\nData Export:\n- Export your transaction data for external analysis\n- Available formats: CSV, PDF\n- Access export options in the Transactions tab\n\nPrivacy and Security:\n- Your data is encrypted and securely stored\n- Only you have access to your personal information\n- Regular security updates protect your data\n\nBest Practices:\n- Keep your app updated to the latest version\n- Use a strong password for your account\n- Enable two-factor authentication if available\n- Regularly review your transaction data for accuracy",
    category: "account",
    tags: ["backup", "recovery", "data", "export", "security", "privacy"],
    isPublished: true
  }
];

// Function to populate the database
async function populateHelpArticles() {
  try {
    console.log('Starting to populate help articles...');
    
    for (const article of helpArticles) {
      const articleData = {
        ...article,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'helpArticles'), articleData);
      console.log(`Added article: "${article.title}" with ID: ${docRef.id}`);
    }
    
    console.log('Successfully populated all help articles!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating help articles:', error);
    process.exit(1);
  }
}

// Run the population script
populateHelpArticles(); 