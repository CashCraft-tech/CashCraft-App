import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './services/notificationService';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  required: boolean;
  granted: boolean;
}

export default function PermissionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Receive important alerts about your spending, low balance warnings, and app updates',
      icon: 'notifications',
      required: false,
      granted: false,
    },
    {
      id: 'sound',
      title: 'Sound & Vibration',
      description: 'Play notification sounds and haptic feedback for better user experience',
      icon: 'volume-high',
      required: false,
      granted: true, // Usually granted by default
    },
    {
      id: 'storage',
      title: 'Local Storage',
      description: 'Store your transaction data locally for offline access and faster performance',
      icon: 'folder',
      required: true,
      granted: true, // Always granted on modern devices
    },
    {
      id: 'network',
      title: 'Internet Access',
      description: 'Sync your data with the cloud and access real-time financial information',
      icon: 'wifi',
      required: true,
      granted: true, // Always granted when app is installed
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      // Check notification permissions
      const notificationStatus = await notificationService.getPermissionStatus();
      const hasNotificationPermission = notificationStatus === 'granted';
      
      setPermissions(prev => prev.map(permission => 
        permission.id === 'notifications' 
          ? { ...permission, granted: hasNotificationPermission }
          : permission
      ));
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      setLoading(true);
      const granted = await notificationService.requestPermissions();
      
      setPermissions(prev => prev.map(permission => 
        permission.id === 'notifications' 
          ? { ...permission, granted }
          : permission
      ));

      if (granted) {
        Alert.alert('Success', 'Notification permissions granted! You\'ll receive important alerts about your finances.');
      } else {
        Alert.alert(
          'Permission Denied',
          'You can enable notifications later in the app settings if you change your mind.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (permissionId: string) => {
    if (permissionId === 'notifications') {
      await requestNotificationPermission();
    }
    // Other permissions are always granted
  };

  const handleContinue = async () => {
    try {
      // Mark that permissions have been shown for this specific user
      const permissionsKey = `permissionsShown_${user?.uid || 'anonymous'}`;
      await AsyncStorage.setItem(permissionsKey, 'true');
      
      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error saving permissions state:', error);
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = async () => {
    try {
      // Mark that permissions have been shown for this specific user
      const permissionsKey = `permissionsShown_${user?.uid || 'anonymous'}`;
      await AsyncStorage.setItem(permissionsKey, 'true');
      
      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error saving permissions state:', error);
      router.replace('/(tabs)/home');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      alignItems: 'center',
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    permissionCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    permissionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    permissionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    permissionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    permissionDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    permissionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    toggleButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.primary,
    },
    toggleButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: theme.border,
    },
    footer: {
      padding: 20,
      paddingBottom: 40,
    },
    continueButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    continueButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    skipButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    skipButtonText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    requiredBadge: {
      backgroundColor: theme.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      marginLeft: 8,
    },
    requiredBadgeText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.statusBarStyle === 'dark' ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome to CashCraft!</Text>
          <Text style={styles.subtitle}>
            To provide you with the best experience, we need a few permissions. 
            You can change these settings anytime in the app.
          </Text>
        </View>

        <View style={styles.content}>
          {permissions.map((permission) => (
            <View key={permission.id} style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <View style={styles.permissionIcon}>
                  <Ionicons name={permission.icon} size={20} color={theme.primary} />
                </View>
                <Text style={styles.permissionTitle}>{permission.title}</Text>
                {permission.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.permissionDescription}>{permission.description}</Text>
              
              <View style={styles.permissionStatus}>
                <Text style={styles.statusText}>
                  {permission.granted ? 'Granted' : 'Not granted'}
                </Text>
                
                {!permission.required && (
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      permission.granted && styles.disabledButton,
                      loading && styles.disabledButton,
                    ]}
                    onPress={() => handlePermissionToggle(permission.id)}
                    disabled={loading}
                  >
                    <Text style={styles.toggleButtonText}>
                      {permission.granted ? 'Granted' : 'Enable'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 