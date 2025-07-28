import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      console.log('Attempting to sign in with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', userCredential.user.email);
      
      // Show success message briefly before navigation
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 1500);
      
    } catch (err: any) {
      console.error('Sign in error:', err);
      let errorMessage = 'Sign in failed. Please try again.';
      
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = err.message || 'Sign in failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Here you would implement Google OAuth
    console.log('Google sign in clicked');
    // For now, just navigate to main app
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAwareScrollView
    contentContainerStyle={styles.container}
    enableOnAndroid={true}
    extraScrollHeight={20}
    keyboardShouldPersistTaps="handled"
    enableAutomaticScroll={true}
  >
      
        <View style={styles.header}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.title}>Bachat</Text>
        </View>
        <Text style={styles.subtitle}>Smart expense tracking made simple</Text>

        <View style={styles.box}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue tracking your expenses</Text>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}> 
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
          <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Image source={require("../../assets/images/icon.png")} style={styles.googleLogo} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>
        <View style={styles.signUpContainer}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}> 
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        </View>
        <Text style={styles.termsText}>
          By continuing, you agree to our <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      
      {/* Loading Modal */}
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4caf50" />
            <Text style={styles.loadingText}>Signing you in...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we verify your credentials</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf7ec",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
   
  },
  logo: {
    width: 44,
    height: 44,
    marginHorizontal:20,
    marginVertical:20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4caf50",
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
  forgot: {
    color: "#4caf50",
    alignSelf: "flex-end",
    marginBottom: 16,
    marginRight: 8,
  },
  signInButton: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  signInText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  orText: {
    marginHorizontal: 8,
    color: "#888",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4caf50",
    width: "100%",
    paddingVertical: 12,
    justifyContent: "center",
    marginBottom: 16,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleText: {
    color: "#4caf50",
    fontWeight: "bold",
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  signUpText: {
    color: "#4caf50",
    fontWeight: "bold",
  },
  termsText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  link: {
    color: "#4caf50",
    textDecorationLine: "underline",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 