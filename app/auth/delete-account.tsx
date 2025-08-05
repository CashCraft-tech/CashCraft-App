import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeleteAccount() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    setError("");
    if (!password.trim()) {
      setError('Please enter your password to confirm account deletion');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This is your final warning. Deleting your account will:\n\n• Permanently remove all your data\n• Delete all your transactions\n• Remove your profile information\n• This action cannot be undone\n\nAre you absolutely sure you want to proceed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
                         try {
               const result = await authService.deleteAccount(password);
               
               if (result.success) {
                 // Force sign out to clear auth state
                 await authService.signOut();
                 
                 Alert.alert(
                   'Account Deleted',
                   'Your account has been permanently deleted. Thank you for using CashCraft.',
                   [
                     {
                       text: 'OK',
                                               onPress: () => {
                          // Navigate to login and clear navigation stack
                          router.replace('/auth/login');
                        },
                     },
                   ]
                 );
               } else {
                 setError(result.error?.message || 'Failed to delete account. Please try again.');
               }
             } catch (err: any) {
               console.error('Delete account error:', err);
               setError('Failed to delete account. Please try again.');
             } finally {
               setLoading(false);
             }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    gradientContainer: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: 20,
      paddingTop: 40,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    warningIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 82, 82, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FF5252',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 20,
      opacity: 0.9,
      lineHeight: 24,
    },
    box: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    warningTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FF5252',
      marginBottom: 8,
      textAlign: 'center',
    },
    warningText: {
      fontSize: 14,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333333',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      backgroundColor: '#F8F9FA',
    },
    textInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#333333',
    },
    passwordToggle: {
      padding: 12,
    },
    errorText: {
      color: '#E74C3C',
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    deleteButton: {
      backgroundColor: '#FF5252',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    deleteButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButtonDisabled: {
      backgroundColor: '#B0B0B0',
    },
    cancelButton: {
      backgroundColor: '#6C757D',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    cancelButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
    },
    footerText: {
      color: '#ffffff',
      fontSize: 14,
    },
    footerLink: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });

  return (
    <LinearGradient
      colors={['#002219', '#008361', '#002219']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={40} color="#FF5252" />
              </View>
              <Text style={styles.title}>Delete Account</Text>
              <Text style={styles.subtitle}>
                This action will permanently delete your account and all associated data. This cannot be undone.
              </Text>
            </View>

            <View style={styles.box}>
              <Text style={styles.warningTitle}>⚠️ Final Warning</Text>
              <Text style={styles.warningText}>
                By deleting your account, you will lose access to all your financial data, transaction history, and account settings permanently.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter your password to confirm</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999999"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#666666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete My Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Changed your mind? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
} 