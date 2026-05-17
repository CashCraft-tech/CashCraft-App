import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import { ProfileFormSkeleton } from './skeleton';
import { UserService, PersonalInfo } from '../services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';
import { auth } from '../firebaseConfig';

export default function PersonalInformation() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Run network requests concurrently to speed up loading
        const [_, userData] = await Promise.all([
          user.reload().catch(e => {}),
          UserService.getUserProfile(auth.currentUser?.uid || user.uid)
        ]);
        
        const currentUser = auth.currentUser || user;
        const authEmail = currentUser.email || '';

        if (userData) {
          // If Firestore is completely missing the email, we just sync it quietly.
          // We only trigger the forced logout if Firestore HAS an email and it differs
          // (which means they successfully verified an email change).
          if (authEmail && userData.email && authEmail !== userData.email) {
            await UserService.syncEmail(currentUser.uid, authEmail);

            // Log the user out for security and to reset all session state
            Alert.alert(
              'Email Verified!',
              'For security reasons, we are logging you out. Please login again with the email you just verified.',
              [
                { 
                  text: 'OK', 
                  onPress: () => {
                    authService.signOut();
                  } 
                }
              ]
            );
            return; // Stop rendering this screen
          } else if (authEmail && !userData.email) {
            // Quietly backfill the email in Firestore if it was missing
            UserService.syncEmail(currentUser.uid, authEmail).catch(console.error);
          }

          setPersonalInfo({
            fullName: userData.fullName || '',
            email: authEmail || userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || '',
            profession: userData.profession || '',
            username: userData.username || '',
            address: userData.address || '',
            dateOfBirth: userData.dateOfBirth || '',
          });
        } else {
          const basicUserData = {
            uid: user.uid,
            email: user.email || '',
            fullName: user.displayName || '',
            phone: '',
            gender: '',
            profession: '',
            username: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          try {
            await UserService.createUserProfile(user.uid, basicUserData);
          } catch (createError) {
            console.error('Error creating user document:', createError);
          }

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
    Alert.alert('Coming Soon', 'Profile photo upload will be available soon.');
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const result = await UserService.updateUserProfile(user, personalInfo);

      if (result?.emailVerificationSent) {
        Alert.alert(
          'Verification Email Sent',
          `A verification link has been sent to ${personalInfo.email}. Your email will update after you click the link.`,
          [{ text: 'OK', onPress: () => setIsEditing(false) }]
        );
      } else {
        Alert.alert('Saved!', 'Your profile has been updated.');
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('Error updating user data:', error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Re-authentication Required', 'Please log out and log back in before changing your email.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Email Taken', 'That email is already linked to another account.');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      UserService.getUserProfile(user.uid).then((userData) => {
        if (userData) {
          setPersonalInfo({
            fullName: userData.fullName || '',
            email: user.email || userData.email || '',
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
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return <ProfileFormSkeleton />;
  }

  const gradientColors: [string, string] = isDark
    ? ['#1B3A1F', '#121212']
    : ['#2E7D32', '#4CAF50'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style={theme.statusBarStyle} />

      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Header ── */}
        <LinearGradient colors={gradientColors} style={styles.hero}>
          {/* Avatar */}
          <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{getInitials(personalInfo.fullName)}</Text>
              </View>
            )}
            <View style={styles.cameraChip}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.heroName}>{personalInfo.fullName || 'Your Name'}</Text>
          <Text style={styles.heroEmail}>{personalInfo.email || 'your@email.com'}</Text>

          {personalInfo.profession ? (
            <View style={styles.professionBadge}>
              <Ionicons name="briefcase-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.professionBadgeText}>{personalInfo.profession}</Text>
            </View>
          ) : null}

          {/* Edit / Done toggle */}
          <TouchableOpacity
            style={[styles.editToggle, isEditing && styles.editToggleActive]}
            onPress={() => (isEditing ? handleCancel() : setIsEditing(true))}
            activeOpacity={0.8}
          >
            <Ionicons name={isEditing ? 'close' : 'pencil'} size={15} color={isEditing ? '#F44336' : '#fff'} />
            <Text style={[styles.editToggleText, isEditing && { color: '#F44336' }]}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Completion Bar (only when not editing and profile incomplete) ── */}
        {!isEditing && (() => {
          const fields = [personalInfo.fullName, personalInfo.phone, personalInfo.gender, personalInfo.profession, personalInfo.username, personalInfo.address, personalInfo.dateOfBirth];
          const filled = fields.filter(Boolean).length;
          const pct = Math.round((filled / fields.length) * 100);
          if (pct === 100) return null;
          return (
            <View style={[styles.completionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.completionRow}>
                <Text style={[styles.completionLabel, { color: theme.text }]}>Profile Completion</Text>
                <Text style={[styles.completionPct, { color: theme.primary }]}>{pct}%</Text>
              </View>
              <View style={[styles.completionTrack, { backgroundColor: theme.surface }]}>
                <View style={[styles.completionFill, { width: `${pct}%` as any, backgroundColor: theme.primary }]} />
              </View>
              <Text style={[styles.completionHint, { color: theme.textTertiary }]}>
                Tap <Text style={{ color: theme.primary }}>Edit Profile</Text> to complete your info
              </Text>
            </View>
          );
        })()}

        {/* ── Basic Info Section ── */}
        <SectionCard title="Basic Information" icon="person-outline" theme={theme}>
          <FieldRow
            label="Full Name"
            icon="person-outline"
            value={personalInfo.fullName}
            editable={isEditing}
            focused={focusedField === 'fullName'}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('fullName', t)}
            placeholder="Enter your full name"
            theme={theme}
          />
          <FieldRow
            label="Username"
            icon="at-outline"
            value={personalInfo.username}
            editable={isEditing}
            focused={focusedField === 'username'}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('username', t)}
            placeholder="@username"
            theme={theme}
          />
          <FieldRow
            label="Profession"
            icon="briefcase-outline"
            value={personalInfo.profession}
            editable={isEditing}
            focused={focusedField === 'profession'}
            onFocus={() => setFocusedField('profession')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('profession', t)}
            placeholder="e.g. Software Engineer"
            theme={theme}
          />
          <FieldRow
            label="Gender"
            icon="male-female-outline"
            value={personalInfo.gender}
            editable={isEditing}
            focused={focusedField === 'gender'}
            onFocus={() => setFocusedField('gender')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('gender', t)}
            placeholder="e.g. Male / Female"
            theme={theme}
            isLast
          />
        </SectionCard>

        {/* ── Contact Section ── */}
        <SectionCard title="Contact Details" icon="call-outline" theme={theme}>
          <FieldRow
            label="Email Address"
            icon="mail-outline"
            value={personalInfo.email}
            editable={isEditing}
            focused={focusedField === 'email'}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('email', t)}
            placeholder="your@email.com"
            keyboardType="email-address"
            theme={theme}
          />
          <FieldRow
            label="Phone Number"
            icon="call-outline"
            value={personalInfo.phone}
            editable={isEditing}
            focused={focusedField === 'phone'}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('phone', t)}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
            theme={theme}
          />
          <FieldRow
            label="Address"
            icon="location-outline"
            value={personalInfo.address || ''}
            editable={isEditing}
            focused={focusedField === 'address'}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('address', t)}
            placeholder="Your address"
            multiline
            theme={theme}
            isLast
          />
        </SectionCard>

        {/* ── Additional Section ── */}
        <SectionCard title="Additional Info" icon="calendar-outline" theme={theme}>
          <FieldRow
            label="Date of Birth"
            icon="calendar-outline"
            value={personalInfo.dateOfBirth || ''}
            editable={isEditing}
            focused={focusedField === 'dob'}
            onFocus={() => setFocusedField('dob')}
            onBlur={() => setFocusedField(null)}
            onChangeText={t => updateField('dateOfBirth', t)}
            placeholder="DD / MM / YYYY"
            theme={theme}
            isLast
          />
        </SectionCard>

        {/* ── Save Button ── */}
        {isEditing && (
          <View style={styles.saveBtnWrap}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function SectionCard({ title, icon, children, theme }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  theme: any;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: theme.primary + '18' }]}>
          <Ionicons name={icon as any} size={16} color={theme.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function FieldRow({
  label, icon, value, editable, focused, onFocus, onBlur,
  onChangeText, placeholder, keyboardType, multiline, theme, isLast,
}: {
  label: string;
  icon: string;
  value: string;
  editable: boolean;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: any;
  multiline?: boolean;
  theme: any;
  isLast?: boolean;
}) {
  const borderColor = focused ? theme.primary : 'transparent';

  return (
    <View style={[styles.fieldRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon as any} size={14} color={theme.textTertiary} style={{ marginRight: 5 }} />
        <Text style={[styles.fieldLabel, { color: theme.textTertiary }]}>{label}</Text>
      </View>
      {editable ? (
        <View style={[styles.fieldInputWrap, { borderColor, backgroundColor: theme.surface }]}>
          <TextInput
            style={[styles.fieldInput, { color: theme.text }]}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.textTertiary}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 2 : 1}
          />
        </View>
      ) : (
        <Text style={[styles.fieldValue, { color: value ? theme.text : theme.textTertiary }]}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */

const styles = StyleSheet.create({
  /* Hero */
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  cameraChip: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
    textAlign: 'center',
  },
  professionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  professionBadgeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editToggleActive: {
    backgroundColor: 'rgba(244,67,54,0.12)',
    borderColor: 'rgba(244,67,54,0.4)',
  },
  editToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  /* Completion bar */
  completionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  completionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  completionPct: {
    fontSize: 13,
    fontWeight: '700',
  },
  completionTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionFill: {
    height: 6,
    borderRadius: 3,
  },
  completionHint: {
    fontSize: 12,
    marginTop: 8,
  },

  /* Section card */
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  /* Field row */
  fieldRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  fieldInputWrap: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
    minHeight: 38,
  },

  /* Save button */
  saveBtnWrap: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});