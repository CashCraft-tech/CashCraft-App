import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { categoriesService } from '../services/categoriesService';
import { SafeAreaView } from "react-native-safe-area-context";


export default function Signup() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    gender: "",
    profession: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleChange = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleInputFocus = () => {
    // Scroll to the focused input after a short delay
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    
    // Validation
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password should be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Attempting to create account for:', form.email);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);
      
      // Save user profile to Firestore
      const userProfile = {
        uid: user.uid,
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        gender: form.gender,
        profession: form.profession,
        username: form.username,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('User profile saved to Firestore');
      
      // Create default categories for the new user
      await categoriesService.createDefaultCategories(user.uid);
      console.log('Default categories created');
      
      setSuccess("Account created successfully!");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Signup failed. Please try again.';
      
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = err.message || 'Signup failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1,backgroundColor: "#eaf7ec" }}>
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.header}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
          <Text style={styles.title}>Bachat</Text>
        </View>
        <Text style={styles.subtitle}>Smart expense tracking made simple</Text>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Create Account</Text>
          <Text style={styles.boxSubtitle}>Join us to start tracking your expenses</Text>
          
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={form.fullName}
              onChangeText={v => handleChange("fullName", v)}
              placeholderTextColor="#888"
              onFocus={handleInputFocus}
            />
          </View>

          <Text style={styles.label}>Email *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChangeText={v => handleChange("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
              onFocus={handleInputFocus}
            />
          </View>

          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Create a password (min 6 characters)"
              value={form.password}
              onChangeText={v => handleChange("password", v)}
              secureTextEntry
              placeholderTextColor="#888"
              onFocus={handleInputFocus}
            />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={form.phone}
              onChangeText={v => handleChange("phone", v)}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
              onFocus={handleInputFocus}
            />
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[styles.genderOption, form.gender === 'Male' && styles.genderOptionActive]} 
              onPress={() => handleChange("gender", "Male")}
            >
              <Text style={[styles.genderText, form.gender === 'Male' && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderOption, form.gender === 'Female' && styles.genderOptionActive]} 
              onPress={() => handleChange("gender", "Female")}
            >
              <Text style={[styles.genderText, form.gender === 'Female' && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderOption, form.gender === 'Other' && styles.genderOptionActive]} 
              onPress={() => handleChange("gender", "Other")}
            >
              <Text style={[styles.genderText, form.gender === 'Other' && styles.genderTextActive]}>Other</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Profession</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your profession"
              value={form.profession}
              onChangeText={v => handleChange("profession", v)}
              placeholderTextColor="#888"
              onFocus={handleInputFocus}
            />
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={form.username}
              onChangeText={v => handleChange("username", v)}
              autoCapitalize="none"
              placeholderTextColor="#888"
              onFocus={handleInputFocus}
            />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
            <Text style={styles.signupText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}> 
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.termsText}>
          By creating an account, you agree to our <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </ScrollView>
      
      {/* Loading Modal */}
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4caf50" />
            <Text style={styles.loadingText}>Creating your account...</Text>
            <Text style={styles.loadingSubtext}>Please wait while we set up your profile</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf7ec",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  scrollContentAndroid: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logo: {
    width: 44,
    height: 44,
    marginHorizontal: 20,
    marginVertical: 20,
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
  box: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  boxTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#222",
  },
  boxSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 4,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  inputContainer: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  genderOption: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  genderOptionActive: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
  },
  genderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  genderTextActive: {
    color: "#fff",
  },
  signupButton: {
    backgroundColor: "#4caf50",
    borderRadius: 12,
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#4caf50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  successText: {
    color: '#4caf50',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  loginPrompt: {
    color: "#666",
    fontSize: 14,
  },
  loginText: {
    color: "#4caf50",
    fontWeight: "bold",
    fontSize: 14,
  },
  termsText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
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
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
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