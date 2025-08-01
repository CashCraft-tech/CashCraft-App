import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [settings, setSettings] = useState({
    lowBalanceAlerts: true,
  });

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    setLoading(true);
    try {
      const hasPermission = await notificationService.requestPermissions();
      setPermissionsGranted(hasPermission);
    } catch (error) {
      console.error('Error checking notification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const testNotification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await notificationService.sendLocalNotification(
        'Test Notification 🔔',
        'This is a test notification from CashCraft!',
        { type: 'test', icon: 'notifications-outline' }
      );
      Alert.alert('Success', 'Test notification sent! Check the notification screen.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const sendLowBalanceAlert = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await notificationService.sendLowBalanceAlert();
      Alert.alert('Success', 'Low balance alert sent! Check the notification screen.');
    } catch (error) {
      console.error('Error sending low balance alert:', error);
      Alert.alert('Error', 'Failed to send low balance alert');
    } finally {
      setLoading(false);
    }
  };

  const saveTestNotification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await notificationService.saveNotificationOnly(
        'Saved Notification 📝',
        'This notification was saved directly to Firestore without sending a local notification.',
        { type: 'saved', icon: 'save-outline' }
      );
      Alert.alert('Success', 'Notification saved to Firestore! Check the notification screen.');
    } catch (error) {
      console.error('Error saving notification:', error);
      Alert.alert('Error', 'Failed to save notification');
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    setLoading(true);
    try {
      const granted = await notificationService.requestPermissions();
      setPermissionsGranted(granted);
      if (granted) {
        Alert.alert('Success', 'Notification permissions granted!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in your device settings to receive alerts.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>Manage your notification preferences</Text>
      </View>

      {/* Permission Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Status</Text>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Notifications</Text>
            <View style={[styles.statusIndicator, { backgroundColor: permissionsGranted ? '#4caf50' : '#f44336' }]}>
              <Text style={styles.statusText}>
                {permissionsGranted ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          {!permissionsGranted && (
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
              <Text style={styles.permissionButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notification Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Low Balance Alerts</Text>
            <Text style={styles.settingDescription}>Warnings when your balance is below 10% of income</Text>
          </View>
          <Switch
            value={settings.lowBalanceAlerts}
            onValueChange={() => handleSettingToggle('lowBalanceAlerts')}
            trackColor={{ false: '#767577', true: '#4caf50' }}
            thumbColor={settings.lowBalanceAlerts ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Test Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        <Text style={styles.sectionDescription}>
          Test different types of notifications to make sure they're working properly
        </Text>
        
        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={sendLowBalanceAlert}>
          <Text style={styles.testButtonText}>Test Low Balance Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={saveTestNotification}>
          <Text style={styles.testButtonText}>Save Test Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Close Button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  permissionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  permissionButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#666',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 