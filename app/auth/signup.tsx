import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { categoriesService } from '../services/categoriesService';

export default function Signup() {
  const router = useRouter();
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

  const handleChange = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSignup = async () => {
    setError("");
    setSuccess("");
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
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} placeholder="Enter your full name" value={form.fullName} onChangeText={v => handleChange("fullName", v)} />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} placeholder="Enter your phone number" value={form.phone} onChangeText={v => handleChange("phone", v)} keyboardType="phone-pad" />
      <Text style={styles.label}>Gender</Text>
      <TextInput style={styles.input} placeholder="Enter your gender" value={form.gender} onChangeText={v => handleChange("gender", v)} />
      <Text style={styles.label}>Profession</Text>
      <TextInput style={styles.input} placeholder="Enter your profession" value={form.profession} onChangeText={v => handleChange("profession", v)} />
      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} placeholder="Choose a username" value={form.username} onChangeText={v => handleChange("username", v)} autoCapitalize="none" />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} placeholder="Enter your email" value={form.email} onChangeText={v => handleChange("email", v)} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} placeholder="Create a password" value={form.password} onChangeText={v => handleChange("password", v)} secureTextEntry />
              <TouchableOpacity style={styles.createButton} onPress={handleSignup} disabled={loading}>
          <Text style={styles.createText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>
        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        {success ? <Text style={{ color: 'green', marginBottom: 8 }}>{success}</Text> : null}
        <View style={styles.loginContainer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}> 
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
        
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
      </ScrollView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#eaf7ec",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 8,
    marginTop: 10,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    height: 44,
    fontSize: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  createButton: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  loginText: {
    color: "#4caf50",
    fontWeight: "bold",
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