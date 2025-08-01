import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_PREFERENCE_KEY = 'push_notification_enabled';

export interface NotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId?: string;
  userId?: string;
}

class NotificationServiceImpl {
  
  // Check if push notifications are enabled (user preference)
  async isPushEnabled(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCE_KEY);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      
      // If no stored preference, check system permission
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking push notification status:', error);
      return false;
    }
  }

  // Enable push notifications
  async enablePushNotifications(): Promise<{ success: boolean; error?: string }> {
    try {
      // First, request permissions if not already granted
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          return {
            success: false,
            error: 'Permission denied. Please enable notifications in your device settings.'
          };
        }
      }

      // Store the preference
      await AsyncStorage.setItem(NOTIFICATION_PREFERENCE_KEY, JSON.stringify(true));
      
      return { success: true };
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return {
        success: false,
        error: 'Failed to enable push notifications'
      };
    }
  }

  // Disable push notifications
  async disablePushNotifications(): Promise<{ success: boolean; error?: string }> {
    try {
      // Store the preference as disabled
      await AsyncStorage.setItem(NOTIFICATION_PREFERENCE_KEY, JSON.stringify(false));
      
      return { success: true };
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      return {
        success: false,
        error: 'Failed to disable push notifications'
      };
    }
  }

  // Toggle push notifications
  async togglePushNotifications(): Promise<{ success: boolean; enabled: boolean; error?: string }> {
    try {
      const currentlyEnabled = await this.isPushEnabled();
      
      if (currentlyEnabled) {
        const result = await this.disablePushNotifications();
        return {
          success: result.success,
          enabled: false,
          error: result.error
        };
      } else {
        const result = await this.enablePushNotifications();
        return {
          success: result.success,
          enabled: true,
          error: result.error
        };
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      return {
        success: false,
        enabled: false,
        error: 'Failed to toggle push notifications'
      };
    }
  }

  // Get current notification permission status
  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'undetermined' as Notifications.PermissionStatus;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting notification permissions...');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4caf50',
          sound: 'default',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }
      
      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get push notification token
  async getPushToken(): Promise<string | null> {
    try {
      console.log('Getting push notification token...');
      
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'e9b9481b-8889-42b9-a96f-87f0961cbe8d', // Your EAS project ID
      });
      
      console.log('Push token received:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Save notification token to Firestore
  async saveTokenToFirestore(userId: string, token: string): Promise<boolean> {
    try {
      console.log('Saving notification token to Firestore...');
      
      const tokenData: NotificationToken = {
        token,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        deviceId: Device.deviceName || Device.modelName || undefined,
        userId,
      };

      await setDoc(doc(db, 'notificationTokens', userId), tokenData);
      console.log('Notification token saved to Firestore');
      return true;
    } catch (error) {
      console.error('Error saving notification token:', error);
      return false;
    }
  }

  // Get notification token from Firestore
  async getTokenFromFirestore(userId: string): Promise<NotificationToken | null> {
    try {
      const tokenDoc = await getDoc(doc(db, 'notificationTokens', userId));
      if (tokenDoc.exists()) {
        return tokenDoc.data() as NotificationToken;
      }
      return null;
    } catch (error) {
      console.error('Error getting notification token:', error);
      return null;
    }
  }

  // Send local notification and save to Firestore
  async sendLocalNotification(title: string, body: string, data?: any): Promise<string | null> {
    try {
      // Check if notifications are enabled by user
      const isEnabled = await this.isPushEnabled();
      if (!isEnabled) {
        console.log('Notifications disabled by user, skipping local notification');
        return null;
      }

      console.log('Sending local notification:', { title, body });
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
      
      console.log('Local notification sent with ID:', notificationId);
      
      // Also save to Firestore for notification screen
      await this.saveNotificationToFirestore(title, body, data);
      
      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }

  // Save notification to Firestore
  async saveNotificationToFirestore(title: string, body: string, data?: any): Promise<void> {
    try {
      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user, skipping Firestore save');
        return;
      }

      console.log('Saving notification to Firestore:', { title, body });
      
      const notificationData = {
        title,
        body,
        icon: data?.icon || 'notifications-outline',
        timestamp: new Date(),
        userId: currentUser.uid,
        type: data?.type || 'general',
        ...data,
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification saved to Firestore');
    } catch (error) {
      console.error('Error saving notification to Firestore:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(
    title: string, 
    body: string, 
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string | null> {
    try {
      // Check if notifications are enabled by user
      const isEnabled = await this.isPushEnabled();
      if (!isEnabled) {
        console.log('Notifications disabled by user, skipping scheduled notification');
        return null;
      }

      console.log('Scheduling notification:', { title, body, trigger });
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger,
      });
      
      console.log('Notification scheduled with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('Scheduled notifications:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Initialize notifications for a user
  async initializeForUser(userId: string): Promise<boolean> {
    try {
      console.log('Initializing notifications for user:', userId);
      
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No notification permissions');
        return false;
      }

      // Get push token
      const token = await this.getPushToken();
      if (!token) {
        console.log('No push token received');
        return false;
      }

      // Save token to Firestore
      const saved = await this.saveTokenToFirestore(userId, token);
      if (!saved) {
        console.log('Failed to save token to Firestore');
        return false;
      }

      console.log('Notifications initialized successfully for user:', userId);
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Send low balance alert (only notification type we need)
  async sendLowBalanceAlert(): Promise<string | null> {
    return this.sendLocalNotification(
      'Low Balance Alert! ⚠️',
      'Your balance is below 10% of your total income. Consider reviewing your spending.',
      { type: 'low_balance_alert', icon: 'alert-circle-outline' }
    );
  }

  // Send weekly summary reminder
  async sendWeeklySummaryReminder(): Promise<string | null> {
    return this.scheduleNotification(
      'Weekly Expense Summary 📊',
      'Check your spending patterns and insights for this week.',
      { 
        hour: 9, 
        minute: 0, 
        repeats: true,
        weekday: 1 // Monday
      } as Notifications.CalendarTriggerInput,
      { type: 'weekly_summary', icon: 'bar-chart-outline' }
    );
  }

  // Save notification to Firestore without sending local notification
  async saveNotificationOnly(title: string, body: string, data?: any): Promise<void> {
    await this.saveNotificationToFirestore(title, body, data);
  }
}

export const notificationService = new NotificationServiceImpl(); 