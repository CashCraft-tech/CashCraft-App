import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image } from "react-native";
import { Ionicons, MaterialIcons, Feather, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { formatDateShort } from '../utils/dateUtils';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Profile() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName?: string; firstName?: string; lastName?: string }>({});
  const router = useRouter();

  const { user: authUser } = useAuth();
  
  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            fullName: userData.fullName,
            firstName: userData.firstName,
            lastName: userData.lastName
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  // User data from auth context and Firestore
  const user = {
    name: userProfile.fullName || userProfile.firstName || authUser?.displayName || authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || 'No email',
    memberSince: authUser?.metadata?.creationTime ? formatDateShort(authUser.metadata.creationTime) : 'Unknown',
    avatarColor: ['#7B61FF', '#4F8CFF'],
  };

  const handleEditProfile = () => Alert.alert('Edit Profile', 'Edit profile clicked!');
  const handleChangeAvatar = () => Alert.alert('Feature Coming Soon!', 'Profile image upload functionality will be available in the next update.');
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await authService.signOut();
              if (result.success) {
                router.replace('/auth/login');
              } else {
                Alert.alert('Error', result.error?.message || 'Failed to sign out. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Title */}
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 2 }}>Profile</Text>
          <Text style={{ fontSize: 14, color: '#888' }}>Manage your account</Text>
        </View>
        {/* Profile Summary Card */}
        <View style={profileStyles.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={profileStyles.avatarWrap}>
              <View style={profileStyles.avatarCircle}>
                <Text style={profileStyles.avatarInitial}>{user.name[0]}</Text>
                <TouchableOpacity style={profileStyles.avatarCamera} onPress={handleChangeAvatar}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </TouchableOpacity>
                <View style={profileStyles.comingSoonBadge}>
                  <Text style={profileStyles.comingSoonText}>Soon</Text>
                </View>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={profileStyles.name}>{user.name}</Text>
              <Text style={profileStyles.email}>{user.email}</Text>
              <Text style={profileStyles.memberSince}>Member since {user.memberSince}</Text>
            </View>
           
          </View>
        
        </View>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/personal-information')}>
            <View style={styles.iconWrap}><Ionicons name="person-outline" size={22} color="#B0B0B0" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Personal Information</Text>
              <Text style={styles.rowSub}>Update your profile details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/components/manage-categories')}>
            <View style={styles.iconWrap}><MaterialIcons name="category" size={22} color="#B0B0B0" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Manage Categories</Text>
              <Text style={styles.rowSub}>Customize spending categories</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}><Feather name="bell" size={22} color="#82B1FF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Push Notifications</Text>
              <Text style={styles.rowSub}>Get notified about transactions</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E0E0E0', true: '#82B1FF' }}
              thumbColor={pushEnabled ? '#2979FF' : '#fff'}
            />
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.iconWrap}><Feather name="lock" size={22} color="#43A047" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Change Password</Text>
              <Text style={styles.rowSub}>Update your password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <View style={styles.row}>
            <View style={styles.iconWrap}><MaterialIcons name="security" size={22} color="#43A047" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Two-Factor Authentication</Text>
              <Text style={styles.rowSub}>Add extra security</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: '#E0E0E0', true: '#43A047' }}
              thumbColor={twoFactorEnabled ? '#43A047' : '#fff'}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.iconWrap}><FontAwesome5 name="fingerprint" size={22} color="#43A047" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Biometric Login</Text>
              <Text style={styles.rowSub}>Use fingerprint or face ID</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#E0E0E0', true: '#43A047' }}
              thumbColor={biometricEnabled ? '#43A047' : '#fff'}
            />
          </View>
        </View>

        {/* Preferences Section */}
        {/* <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}><Feather name="moon" size={22} color="#9575CD" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <Text style={styles.rowSub}>Switch to dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#9575CD' }}
              thumbColor={darkMode ? '#9575CD' : '#fff'}
            />
          </View>
          <TouchableOpacity style={styles.row}>
            <View style={styles.iconWrap}><MaterialIcons name="language" size={22} color="#7C4DFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Language</Text>
              <Text style={styles.rowSub}>English (US)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={styles.iconWrap}><FontAwesome name="globe" size={22} color="#AB47BC" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Currency</Text>
              <Text style={styles.rowSub}>Indian Rupee (₹)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View> */}

        {/* Support & Legal Section */}
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/support' as any)}>
            <View style={styles.iconWrap}><Feather name="help-circle" size={22} color="#FF9800" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Help Center</Text>
              <Text style={styles.rowSub}>Get help and support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/support/contact' as any)}>
            <View style={styles.iconWrap}><Feather name="mail" size={22} color="#FF9800" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Contact Us</Text>
              <Text style={styles.rowSub}>Reach our support team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/support/feedback' as any)}>
            <View style={styles.iconWrap}><Feather name="message-circle" size={22} color="#FF9800" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Send Feedback</Text>
              <Text style={styles.rowSub}>Share your thoughts with us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/legal' as any)}>
            <View style={styles.iconWrap}><MaterialIcons name="gavel" size={22} color="#FF9800" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Legal Documents</Text>
              <Text style={styles.rowSub}>Privacy Policy & Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={[styles.card, { marginBottom: 32 }]}> 
          <TouchableOpacity style={[styles.row]} onPress={handleSignOut}> 
            <View style={styles.iconWrap}><MaterialIcons name="logout" size={22} color="#FF5252" /></View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: '#FF5252' }]}>Sign Out</Text>
              <Text style={styles.rowSub}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex:1,justifyContent:'center',alignItems:'center',marginBottom:64}}>
        <Text style={{fontSize:12,color:'#888'}}>Version 1.0.0</Text>

          <Text style={{fontSize:12,color:'#888'}}>Copyright © 2025 CashCraft. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Increased padding to account for tab bar
    marginTop: 16,
    backgroundColor: '#F8F9FB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    marginTop: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: '#F0F0F0',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  rowSub: {
    fontSize: 12,
    color: '',
  },
}); 

const profileStyles = StyleSheet.create({
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  avatarWrap: { marginRight: 8 },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#7B61FF',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  avatarInitial: { color: '#fff', fontWeight: 'bold', fontSize: 32 },
  avatarCamera: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#7B61FF', borderRadius: 12, padding: 4,
    borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  email: { fontSize: 14, color: '#888', marginBottom: 2 },
  memberSince: { fontSize: 12, color: '#888' },
  editBtn: {
    backgroundColor: '#F4F6FF', borderRadius: 16, padding: 8,
    borderWidth: 1, borderColor: '#E0E0E0',
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#888' },
  comingSoonBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
}); 