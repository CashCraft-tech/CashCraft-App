import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export interface AuthError {
  code: string;
  message: string;
}

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: AuthError }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ success: boolean; user?: User; error?: AuthError }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Send password reset email
  async sendPasswordReset(email: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Confirm password reset with action code
  async confirmPasswordReset(actionCode: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Re-authenticate user
  async reauthenticateUser(email: string, password: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: {
            code: 'auth/user-not-found',
            message: 'No user is currently signed in.'
          }
        };
      }

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Update password (requires re-authentication)
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return {
          success: false,
          error: {
            code: 'auth/user-not-found',
            message: 'No user is currently signed in.'
          }
        };
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  },

  // Get user-friendly error messages
  getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      // Sign in errors
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      
      // Sign up errors
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      
      // Password reset errors
      case 'auth/missing-email':
        return 'Email address is required.';
      case 'auth/invalid-action-code':
        return 'Invalid or expired reset link. Please request a new one.';
      case 'auth/expired-action-code':
        return 'Reset link has expired. Please request a new one.';
      
      // Password update errors
      case 'auth/requires-recent-login':
        return 'Please sign in again to change your password.';
      case 'auth/wrong-password':
        return 'Current password is incorrect.';
      
      // General errors
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed.';
      case 'auth/user-token-expired':
        return 'Your session has expired. Please sign in again.';
      case 'auth/user-mismatch':
        return 'The provided credentials do not correspond to the previously signed in user.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code.';
      case 'auth/invalid-verification-id':
        return 'Invalid verification ID.';
      
      default:
        return 'An error occurred. Please try again.';
    }
  },

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long.'
      };
    }
    
    return {
      isValid: true,
      message: 'Password is valid.'
    };
  }
}; 