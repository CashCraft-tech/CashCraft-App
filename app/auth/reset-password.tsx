import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
  const router = useRouter();
  const [actionCode, setActionCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!actionCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const passwordValidation = authService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await authService.confirmPasswordReset(actionCode.trim(), newPassword);
      if (result.success) {
        setSuccess(true);
        Alert.alert(
          'Password Reset',
          'Your password has been reset successfully! You can now sign in with your new password.',
          [
            {
              text: 'OK',
              onPress: () => router.push("/auth/login")
            }
          ]
        );
      } else {
        setError(result.error?.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
    colors={['#002219', '#008361', '#002219']}
    style={styles.gradientContainer}
    >
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.box}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the reset code from your email and your new password
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reset Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the reset code from your email"
            value={actionCode}
            onChangeText={setActionCode}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
          />
        </View>

                 <View style={styles.inputContainer}>
           <Text style={styles.label}>New Password</Text>
           <View style={styles.passwordInputContainer}>
             <TextInput
               style={styles.passwordInput}
               placeholder="Enter your new password"
               value={newPassword}
               onChangeText={setNewPassword}
               secureTextEntry={!showNewPassword}
               autoCapitalize="none"
               autoCorrect={false}
             />
             <TouchableOpacity
               onPress={() => setShowNewPassword(!showNewPassword)}
               style={styles.eyeIcon}
             >
               <Ionicons
                 name={showNewPassword ? "eye-off" : "eye"}
                 size={20}
                 color="#666"
               />
             </TouchableOpacity>
           </View>
         </View>

         <View style={styles.inputContainer}>
           <Text style={styles.label}>Confirm New Password</Text>
           <View style={styles.passwordInputContainer}>
             <TextInput
               style={styles.passwordInput}
               placeholder="Confirm your new password"
               value={confirmPassword}
               onChangeText={setConfirmPassword}
               secureTextEntry={!showConfirmPassword}
               autoCapitalize="none"
               autoCorrect={false}
             />
             <TouchableOpacity
               onPress={() => setShowConfirmPassword(!showConfirmPassword)}
               style={styles.eyeIcon}
             >
               <Ionicons
                 name={showConfirmPassword ? "eye-off" : "eye"}
                 size={20}
                 color="#666"
               />
             </TouchableOpacity>
           </View>
         </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to get the reset code:</Text>
          <Text style={styles.instructionsText}>
            1. Check your email for the password reset link{'\n'}
            2. Copy the link from the email{'\n'}
            3. Open Google Chrome or any browser{'\n'}
            4. Paste the link and press Enter{'\n'}
            5. Copy the reset code shown on the page{'\n'}
            6. Enter that code above
          </Text>
        </View>
      </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: "#4caf50",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#4caf50",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
  },
  instructions: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4caf50",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
}); 