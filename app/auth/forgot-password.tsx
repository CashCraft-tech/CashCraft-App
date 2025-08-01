import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import { authService } from "../services/authService";
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    if (!authService.validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await authService.sendPasswordReset(email.trim());
      
      if (result.success) {
        setSuccess(true);
        Alert.alert(
          'Reset Email Sent',
          'A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
          [
            {
              text: 'OK',
              onPress: () => router.push("/auth/login")
            }
          ]
        );
      } else {
        setError(result.error?.message || 'Failed to send reset email. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      setError('Failed to send reset email. Please try again.');
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
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
      >
      <View style={styles.header}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.title}>CashCraft</Text>
      </View>
      <Text style={styles.subtitle}>Smart expense tracking made simple</Text>

      <View style={styles.box}>
        <Text style={styles.Welcometitle}>Forgot Password</Text>
        <Text style={styles.Welcomesubtitle}>Enter your email address to receive a password reset link</Text>
        
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!success}
          />
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              ✅ Reset email sent successfully! Check your inbox for the password reset link.
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.sendButton, (loading || success) && styles.sendButtonDisabled]} 
          onPress={handleSendResetEmail}
          disabled={loading || success}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendText}>
              {success ? 'Email Sent' : 'Send Reset Link'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push("/auth/login")}> 
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 44,
    height: 44,
    marginHorizontal: 20,
   
  },
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  Welcometitle: {
    fontSize: 28,
    color: "black",
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
    color: "white",
  },
  Welcomesubtitle: {
    fontSize: 15,
    color: "black",
    marginBottom: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "white",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 8,
    marginTop: 10,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backText: {
    color: "#4caf50",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4caf50",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  successText: {
    color: "#2e7d32",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
}); 