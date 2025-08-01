# OTP Verification System for CashCraft

This document explains the OTP (One-Time Password) verification system implemented in CashCraft for password reset functionality.

## 📱 Features

- **6-digit OTP codes** - Secure 6-digit verification codes
- **Email delivery** - OTP sent via Firebase password reset email
- **15-minute expiration** - OTP codes expire after 15 minutes
- **3-attempt limit** - Maximum 3 failed attempts per OTP
- **Auto-focus inputs** - Automatic focus on next input field
- **Resend functionality** - 60-second cooldown between resends
- **Firestore storage** - OTP codes stored securely in Firestore

## 🚀 How It Works

### 1. Request OTP
1. User goes to **Forgot Password** screen
2. Enters their email address
3. Clicks **"Send OTP"**
4. System generates 6-digit OTP and stores it in Firestore
5. Firebase sends password reset email to user

### 2. Verify OTP
1. User receives email with password reset link
2. User goes to **OTP Verification** screen
3. Enters the 6-digit code from email
4. System verifies OTP against Firestore data
5. If valid, user can reset their password

### 3. Security Features
- **Expiration**: OTP expires after 15 minutes
- **Attempt limits**: Maximum 3 failed attempts
- **Cooldown**: 60-second delay between resend requests
- **Auto-cleanup**: Expired OTPs are automatically deleted

## 🔧 Implementation

### OTP Service (`otpService.ts`)

```typescript
// Send OTP
const result = await otpService.sendOTP(email);

// Verify OTP
const result = await otpService.verifyOTP(email, otpCode);

// Resend OTP
const result = await otpService.resendOTP(email);
```

### Firestore Structure

```typescript
// Collection: otpCodes
// Document ID: email address
{
  email: "user@example.com",
  otp: "123456",
  timestamp: Timestamp,
  attempts: 0,
  verified: false
}
```

## 📱 User Flow

### Forgot Password Flow
1. **Login Screen** → Click "Forgot password?"
2. **Forgot Password Screen** → Enter email → Click "Send OTP"
3. **OTP Verification Screen** → Enter 6-digit code → Click "Verify OTP"
4. **Success** → Return to login screen

### OTP Verification Screen Features
- **6 input boxes** for 6-digit code
- **Auto-focus** on next input when digit entered
- **Error handling** for invalid codes
- **Loading states** during verification
- **Resend button** with 60-second cooldown
- **Countdown timer** for resend cooldown

## 🔐 Security Rules

### Firestore Security Rules
```javascript
// OTP codes - allow creation and reading for password reset
match /otpCodes/{email} {
  allow read, write: if request.auth != null;
}
```

### OTP Validation Rules
- **Length**: Must be exactly 6 digits
- **Expiration**: 15 minutes from creation
- **Attempts**: Maximum 3 failed attempts
- **Format**: Numbers only (0-9)

## 🧪 Testing

### Test OTP Flow
1. **Go to Login Screen**
2. **Click "Forgot password?"**
3. **Enter your email address**
4. **Click "Send OTP"**
5. **Check your email** for password reset link
6. **Go to OTP Verification Screen**
7. **Enter the 6-digit code**
8. **Click "Verify OTP"**

### Test Resend Functionality
1. **Wait for 60-second cooldown**
2. **Click "Resend" button**
3. **Check countdown timer**
4. **Verify new OTP is sent**

## 🚨 Error Handling

### Common Error Messages
- **"Please enter your email address"** - Email field is empty
- **"Invalid email address"** - Email format is incorrect
- **"No account found with this email address"** - Email not registered
- **"OTP not found. Please request a new code."** - OTP expired or invalid
- **"OTP has expired. Please request a new code."** - OTP older than 15 minutes
- **"Too many failed attempts. Please request a new code."** - 3+ failed attempts
- **"Invalid OTP code. Please try again."** - Wrong 6-digit code

### Error Recovery
- **Expired OTP**: Click "Resend" to get new code
- **Too many attempts**: Wait for cooldown, then resend
- **Invalid email**: Check email format and try again
- **Network error**: Check internet connection and retry

## 📧 Email Integration

### Firebase Password Reset
The system uses Firebase's built-in password reset email functionality:
- **Sender**: Firebase Authentication
- **Subject**: "Reset your CashCraft password"
- **Content**: Password reset link with action code
- **Template**: Firebase default template

### Custom Email Service (Future)
For production, consider implementing:
- **Custom email templates** with CashCraft branding
- **Email service providers** (SendGrid, Mailgun, etc.)
- **Custom OTP delivery** via SMS or email
- **Email verification** for new accounts

## 🔄 State Management

### OTP Verification States
```typescript
interface OTPState {
  otp: string[];           // 6-digit code array
  loading: boolean;        // Verification in progress
  error: string;          // Error message
  resendLoading: boolean; // Resend in progress
  resendDisabled: boolean; // Resend button disabled
  countdown: number;      // Resend cooldown timer
}
```

### Auto-focus Implementation
```typescript
const inputRefs = useRef<TextInput[]>([]);

// Auto-focus next input
if (value && index < 5) {
  inputRefs.current[index + 1]?.focus();
}
```

## 🎯 Best Practices

### Security
1. **Never store OTPs in plain text**
2. **Use secure random generation**
3. **Implement rate limiting**
4. **Set reasonable expiration times**
5. **Limit failed attempts**

### User Experience
1. **Clear error messages**
2. **Loading indicators**
3. **Auto-focus inputs**
4. **Resend functionality**
5. **Countdown timers**

### Performance
1. **Clean up expired OTPs**
2. **Optimize Firestore queries**
3. **Handle network errors**
4. **Cache user email**

## 🚀 Future Enhancements

### Planned Features
- **SMS OTP delivery** - Send codes via SMS
- **Email templates** - Custom branded emails
- **Multi-factor authentication** - 2FA for login
- **Biometric verification** - Fingerprint/Face ID
- **Backup codes** - Recovery codes for 2FA

### Technical Improvements
- **Cloud Functions** - Server-side OTP generation
- **Redis caching** - Faster OTP storage
- **Rate limiting** - Prevent abuse
- **Analytics** - Track OTP usage patterns

## 📚 Additional Resources

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native TextInput](https://reactnative.dev/docs/textinput)
- [Expo Router](https://docs.expo.dev/router/introduction/)

## 🎯 Troubleshooting

### Common Issues
1. **OTP not received**: Check spam folder, verify email
2. **Invalid OTP**: Ensure 6 digits, check for typos
3. **Expired OTP**: Request new code after 15 minutes
4. **Too many attempts**: Wait for cooldown period
5. **Network errors**: Check internet connection

### Debug Steps
1. **Check console logs** for error messages
2. **Verify Firestore rules** are deployed
3. **Test with valid email** address
4. **Check Firebase project** configuration
5. **Verify email templates** are set up 