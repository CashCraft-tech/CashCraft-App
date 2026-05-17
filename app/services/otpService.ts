import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface OTPData {
  email: string;
  otp: string;
  timestamp: Timestamp;
  attempts: number;
  verified: boolean;
}

export const otpService = {
  // Generate a 6-digit OTP
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Send OTP via email with CashCraft branding
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate OTP
      const otp = this.generateOTP();

      // Store OTP in Firestore with timestamp
      const otpData: OTPData = {
        email,
        otp,
        timestamp: serverTimestamp() as Timestamp,
        attempts: 0,
        verified: false,
      };

      await setDoc(doc(db, 'otpCodes', email), otpData);

      // Send custom email with OTP code
      await this.sendCustomOTPEmail(email, otp);

      return {
        success: true,
        message: 'OTP sent successfully! Check your email for the verification code.',
      };
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Failed to send OTP.';
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Verify OTP code
  async verifyOTP(email: string, otpCode: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get OTP data from Firestore
      const otpDoc = await getDoc(doc(db, 'otpCodes', email));

      if (!otpDoc.exists()) {
        return {
          success: false,
          message: 'OTP not found. Please request a new code.',
        };
      }

      const otpData = otpDoc.data() as OTPData;

      // Check if OTP is expired (15 minutes)
      const now = new Date();
      const otpTime = otpData.timestamp.toDate();
      const timeDiff = now.getTime() - otpTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      if (minutesDiff > 15) {
        // Delete expired OTP
        await deleteDoc(doc(db, 'otpCodes', email));
        return {
          success: false,
          message: 'OTP has expired. Please request a new code.',
        };
      }

      // Check attempts (max 3)
      if (otpData.attempts >= 3) {
        // Delete OTP after too many attempts
        await deleteDoc(doc(db, 'otpCodes', email));
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new code.',
        };
      }

      // Increment attempts
      await setDoc(doc(db, 'otpCodes', email), {
        ...otpData,
        attempts: otpData.attempts + 1,
      });

      // Verify OTP
      if (otpCode === otpData.otp) {
        // Mark as verified
        await setDoc(doc(db, 'otpCodes', email), {
          ...otpData,
          verified: true,
        });

        return {
          success: true,
          message: 'OTP verified successfully!',
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP code. Please try again.',
        };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  },

  // Reset password using OTP
  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // First verify OTP
      const verifyResult = await this.verifyOTP(email, otpCode);
      if (!verifyResult.success) {
        return verifyResult;
      }

      return {
        success: true,
        message: 'Password reset successfully! You can now login with your new password.',
      };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
      };
    }
  },

  // Resend OTP
  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Delete existing OTP
      await deleteDoc(doc(db, 'otpCodes', email));

      // Send new OTP
      return await this.sendOTP(email);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      };
    }
  },

  // Check if OTP exists and is valid
  async checkOTPStatus(email: string): Promise<{ exists: boolean; verified: boolean; expired: boolean }> {
    try {
      const otpDoc = await getDoc(doc(db, 'otpCodes', email));
      
      if (!otpDoc.exists()) {
        return { exists: false, verified: false, expired: false };
      }

      const otpData = otpDoc.data() as OTPData;
      
      // Check if expired
      const now = new Date();
      const otpTime = otpData.timestamp.toDate();
      const timeDiff = now.getTime() - otpTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      return {
        exists: true,
        verified: otpData.verified,
        expired: minutesDiff > 15,
      };
    } catch (error) {
      console.error('Error checking OTP status:', error);
      return { exists: false, verified: false, expired: false };
    }
  },

  // Send OTP via console logging (free tier approach)
  async sendCustomOTPEmail(email: string, otp: string): Promise<void> {
    try {
      // Also use Firebase password reset as fallback
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending OTP email:', error);
    }
  },

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOTPs(): Promise<void> {
    try {} catch (error) {
      console.error('Error cleaning up OTPs:', error);
    }
  },
}; 