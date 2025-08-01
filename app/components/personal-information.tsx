import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  profession: string;
  username: string;
  address?: string;
  dateOfBirth?: string;
}

export default function PersonalInformation() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  console.log('PersonalInformation component - user:', user?.email, 'uid:', user?.uid);
  console.log('PersonalInformation component - user object:', user);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    profession: '',
    username: '',
    address: '',
    dateOfBirth: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Test function to manually check Firestore data
  const testFirestoreData = async () => {
    if (!user) return;
    
    try {
      console.log('=== TESTING FIRESTORE DATA ===');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('Document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('Raw Firestore data:', JSON.stringify(data, null, 2));
        console.log('Field names:', Object.keys(data));
        console.log('fullName:', data.fullName);
        console.log('phone:', data.phone);
        console.log('gender:', data.gender);
        console.log('profession:', data.profession);
        console.log('username:', data.username);
      }
      console.log('=== END TEST ===');
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log('No user found in AuthContext');
        return;
      }
      
      console.log('Fetching user data for UID:', user.uid);
      
      // Run test function first
      await testFirestoreData();
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        console.log('User document exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data from Firestore:', userData);
          console.log('Available fields:', Object.keys(userData));
          
          setPersonalInfo({
            fullName: userData.fullName || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            gender: userData.gender || '',
            profession: userData.profession || '',
            username: userData.username || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || '',
          });
          
          console.log('Personal info set to:', {
            fullName: userData.fullName || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            gender: userData.gender || '',
            profession: userData.profession || '',
            username: userData.username || '',
          });
        } else {
          console.log('User document does not exist in Firestore');
          // Create user document with basic info from Firebase Auth
          try {
            const basicUserData = {
              uid: user.uid,
              email: user.email || '',
              fullName: user.displayName || '',
              phone: '',
              gender: '',
              profession: '',
              username: '',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await setDoc(doc(db, 'users', user.uid), basicUserData);
            console.log('Created basic user document in Firestore');
            
            setPersonalInfo({
              fullName: user.displayName || '',
              email: user.email || '',
              phone: '',
              gender: '',
              profession: '',
              username: '',
              address: '',
              dateOfBirth: '',
            });
          } catch (createError) {
            console.error('Error creating user document:', createError);
            // Still set basic info from Firebase Auth
            setPersonalInfo({
              fullName: user.displayName || '',
              email: user.email || '',
              phone: '',
              gender: '',
              profession: '',
              username: '',
              address: '',
              dateOfBirth: '',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const pickImage = async () => {
    try {
      Alert.alert('Image Picker', 'Image picker functionality would be implemented here');
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        ...personalInfo,
        updatedAt: new Date(),
      });
      Alert.alert('Success', 'Personal information updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values by refetching from Firestore
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPersonalInfo({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || '',
            profession: userData.profession || '',
            username: userData.username || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || '',
          });
        }
      });
    }
    setIsEditing(false);
  };

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Check if user has any profile data
  const hasProfileData = personalInfo.fullName || personalInfo.phone || personalInfo.gender || personalInfo.profession || personalInfo.username;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top','left','right','bottom']}>
        <StatusBar style={theme.statusBarStyle} />
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          enableAutomaticScroll={true}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading your information...</Text>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  // Show empty state if no profile data
  if (!hasProfileData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top','left','right','bottom']}>
        <StatusBar style={theme.statusBarStyle} />
        <KeyboardAwareScrollView
          contentContainerStyle={{
            paddingTop: 24,
            paddingBottom: 40,
            paddingHorizontal: 20,
          }}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          enableAutomaticScroll={true}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Information</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Complete your profile to get started</Text>
          </View>

          {/* Empty State */}
          <View style={[styles.emptyStateContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.emptyStateAvatar, { backgroundColor: theme.surface }]}>
              <FontAwesome5 name="user-circle" size={80} color={theme.primary} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>Complete Your Profile</Text>
            <Text style={[styles.emptyStateMessage, { color: theme.textSecondary }]}>
              Add your personal information to personalize your CashCraft experience. 
              Your profile helps us provide better insights and recommendations.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: theme.primary }]} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={[styles.emptyStateButtonText, { color: theme.textInverse }]}>Start Adding Information</Text>
            </TouchableOpacity>
          </View>

          {/* Basic Information Section (in edit mode) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, !isEditing && styles.disabledInput]}
                  value={personalInfo.fullName}
                  onChangeText={(text) => updateField('fullName', text)}
                  editable={isEditing}
                  placeholder="Enter your full name"
                  placeholderTextColor="#888"
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.inputWithIcon, !isEditing && styles.disabledInput]}
                  value={personalInfo.email}
                  onChangeText={(text) => updateField('email', text)}
                  editable={isEditing}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  placeholderTextColor="#888"
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.inputWithIcon, !isEditing && styles.disabledInput]}
                  value={personalInfo.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  editable={isEditing}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#888"
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, !isEditing && styles.disabledInput]}
                  value={personalInfo.gender}
                  onChangeText={(text) => updateField('gender', text)}
                  editable={isEditing}
                  placeholder="Enter your gender"
                  placeholderTextColor="#888"
                />
              </View>
            </View>

            {/* Profession */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Profession</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, !isEditing && styles.disabledInput]}
                  value={personalInfo.profession}
                  onChangeText={(text) => updateField('profession', text)}
                  editable={isEditing}
                  placeholder="Enter your profession"
                  placeholderTextColor="#888"
                />
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, !isEditing && styles.disabledInput]}
                  value={personalInfo.username}
                  onChangeText={(text) => updateField('username', text)}
                  editable={isEditing}
                  placeholder="Enter your username"
                  placeholderTextColor="#888"
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top','left','right','bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Personal Information</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Manage your profile details</Text>
        </View>

        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                <Text style={[styles.avatarText, { color: theme.textInverse }]}>{getInitials(personalInfo.fullName)}</Text>
              </View>
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: theme.primary }]}>
              <Ionicons name="camera" size={16} color={theme.textInverse} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>{personalInfo.fullName || 'Add your name'}</Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{personalInfo.email || 'Add your email'}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.primary }]} 
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? "checkmark" : "pencil"} size={20} color={theme.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Basic Information Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
          
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                editable={isEditing}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.email}
                onChangeText={(text) => updateField('email', text)}
                editable={isEditing}
                placeholder="Enter your email"
                keyboardType="email-address"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Phone Number</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="call-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.phone}
                onChangeText={(text) => updateField('phone', text)}
                editable={isEditing}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Gender</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.gender}
                onChangeText={(text) => updateField('gender', text)}
                editable={isEditing}
                placeholder="Enter your gender"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Profession */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Profession</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.profession}
                onChangeText={(text) => updateField('profession', text)}
                editable={isEditing}
                placeholder="Enter your profession"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Username</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.textInput, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.username}
                onChangeText={(text) => updateField('username', text)}
                editable={isEditing}
                placeholder="Enter your username"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* Additional Information Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Information</Text>
          
          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Address</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="location-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.address}
                onChangeText={(text) => updateField('address', text)}
                editable={isEditing}
                placeholder="Enter your address"
                multiline
                numberOfLines={2}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Date of Birth</Text>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.inputWithIcon, !isEditing && styles.disabledInput, { color: theme.text, backgroundColor: theme.surface }]}
                value={personalInfo.dateOfBirth}
                onChangeText={(text) => updateField('dateOfBirth', text)}
                editable={isEditing}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.primary }]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.textInverse} />
              ) : (
                <Text style={[styles.saveButtonText, { color: theme.textInverse }]}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#101828',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profilePhotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhotoWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4FC3F7',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePhotoInfo: {
    flex: 1,
  },
  profilePhotoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101828',
    marginBottom: 4,
  },
  profilePhotoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  changePhotoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  changePhotoText: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101828',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#101828',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#101828',
    paddingVertical: 12,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  disabledInput: {
    color: '#666',
    backgroundColor: '#F5F5F5',
  },
  datePickerIcon: {
    padding: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  editButton: {
    backgroundColor: '#101828',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#101828',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#101828',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#4caf50',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#101828',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    marginTop: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
   margin:20,
   padding:10,
   borderRadius:12,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4FC3F7',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#101828',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
}); 