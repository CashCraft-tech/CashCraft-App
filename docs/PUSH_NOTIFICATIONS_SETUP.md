# Push Notifications Setup Guide for CashCraft

This guide explains how to set up and use push notifications in your CashCraft app.

## 📱 Features

- **Local Notifications**: Immediate notifications sent from the app
- **Scheduled Notifications**: Notifications scheduled for specific times
- **Permission Management**: Automatic permission requests
- **Token Management**: Push tokens stored in Firestore
- **Test Notifications**: Built-in testing functionality

## 🚀 Quick Start

### 1. Automatic Setup

Notifications are automatically initialized when users sign in. The system will:
- Request notification permissions
- Get push notification tokens
- Save tokens to Firestore
- Send welcome notifications

### 2. Manual Testing

Use the NotificationSettings component to:
- Check permission status
- Test different notification types
- Schedule recurring notifications
- Manage notification preferences

## 📋 Notification Types

### Low Balance Alerts
- **Trigger**: When balance is below 10% of total income
- **Content**: Warning about low balance
- **Purpose**: Prevent overspending and financial issues

## 🔧 Configuration

### App.json Settings

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#4caf50",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
}
```

### Android Channel Configuration

The app automatically creates a notification channel for Android with:
- **Name**: "default"
- **Importance**: MAX
- **Vibration**: [0, 250, 250, 250]
- **Light Color**: #4caf50
- **Sound**: Default

## 📱 Usage Examples

### Send Immediate Notification

```typescript
import { notificationService } from '../services/notificationService';

// Send a simple notification
await notificationService.sendLocalNotification(
  'Hello! 👋',
  'This is a test notification',
  { type: 'test' }
);
```

### Schedule Recurring Notification

```typescript
// Schedule weekly summary every Monday at 9 AM
await notificationService.sendWeeklySummaryReminder();
```

### Custom Scheduled Notification

```typescript
// Schedule custom notification
await notificationService.scheduleNotification(
  'Custom Reminder',
  'Don\'t forget your appointment!',
  {
    hour: 14,
    minute: 30,
    repeats: true,
    weekday: 2 // Tuesday
  } as Notifications.CalendarTriggerInput,
  { type: 'custom' }
);
```

### Low Balance Alert

```typescript
// Send low balance alert
await notificationService.sendLowBalanceAlert();
```

## 🔐 Permissions

### Automatic Permission Request

The app automatically requests notification permissions when:
- User signs in for the first time
- User opens notification settings
- User tries to send a test notification

### Manual Permission Check

```typescript
const hasPermission = await notificationService.requestPermissions();
if (hasPermission) {
  console.log('Notifications enabled');
} else {
  console.log('Notifications disabled');
}
```

## 🗄️ Firestore Integration

### Token Storage

Notification tokens are automatically saved to Firestore in the `notificationTokens` collection:

```typescript
interface NotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
  userId?: string;
}
```

### Token Retrieval

```typescript
const tokenData = await notificationService.getTokenFromFirestore(userId);
if (tokenData) {
  console.log('Token found:', tokenData.token);
}
```

## 🧪 Testing

### Test Notifications

Use the NotificationSettings component to test:
1. **Test Notification**: Basic notification test
2. **Expense Reminder**: Test expense tracking reminder
3. **Weekly Summary**: Schedule weekly summary reminder

### Manual Testing

```typescript
// Test immediate notification
await notificationService.sendLocalNotification(
  'Test 🔔',
  'This is a test notification'
);

// Test scheduled notification
await notificationService.scheduleNotification(
  'Scheduled Test',
  'This notification was scheduled',
  { seconds: 5 } // Send after 5 seconds
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Notifications not showing**
   - Check device notification settings
   - Verify app has notification permissions
   - Ensure device is not in Do Not Disturb mode

2. **Scheduled notifications not working**
   - Check if app is backgrounded
   - Verify notification channel settings (Android)
   - Check device battery optimization settings

3. **Push tokens not received**
   - Ensure using physical device (not simulator)
   - Check internet connection
   - Verify EAS project ID is correct

### Debug Logs

Enable debug logging to troubleshoot:

```typescript
// Check notification status
const scheduled = await notificationService.getScheduledNotifications();
console.log('Scheduled notifications:', scheduled.length);

// Check permissions
const { status } = await Notifications.getPermissionsAsync();
console.log('Permission status:', status);
```

## 📱 Platform Differences

### iOS
- Requires explicit permission request
- Supports rich notifications
- Background app refresh affects scheduling

### Android
- Automatic notification channel creation
- More flexible scheduling options
- Better background notification support

### Web
- Limited notification support
- Requires HTTPS
- Browser-specific limitations

## 🔄 Best Practices

1. **Request permissions early**: Ask for permissions when user first opens the app
2. **Provide value**: Only send notifications that provide real value to users
3. **Test thoroughly**: Test on both iOS and Android devices
4. **Handle errors gracefully**: Always wrap notification calls in try-catch blocks
5. **Respect user preferences**: Allow users to control notification types
6. **Use appropriate timing**: Don't send notifications at inappropriate hours

## 📚 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [iOS Push Notifications](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Channels](https://developer.android.com/guide/topics/ui/notifiers/notifications#ManageChannels)

## 🎯 Next Steps

To extend notification functionality:

1. **Add more notification types**: Customize notifications for specific events
2. **Implement push notifications**: Use Firebase Cloud Messaging for server-sent notifications
3. **Add notification actions**: Allow users to take actions from notifications
4. **Implement notification history**: Store and display past notifications
5. **Add notification analytics**: Track notification engagement and effectiveness 