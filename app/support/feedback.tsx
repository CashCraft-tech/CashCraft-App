import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { feedbackService } from '../services/supportService';
import { useAuth } from '../context/AuthContext';

interface FeedbackType {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

const feedbackTypes: FeedbackType[] = [
  {
    id: 'bug',
    title: 'Bug Report',
    icon: 'bug',
    color: '#f44336',
    description: 'Report a technical issue or error'
  },
  {
    id: 'feature',
    title: 'Feature Request',
    icon: 'bulb',
    color: '#2196f3',
    description: 'Suggest a new feature or improvement'
  },
  {
    id: 'general',
    title: 'General Feedback',
    icon: 'chatbubble',
    color: '#4caf50',
    description: 'Share your thoughts and suggestions'
  },
  {
    id: 'praise',
    title: 'Praise',
    icon: 'heart',
    color: '#e91e63',
    description: 'Tell us what you love about the app'
  }
];

export default function Feedback() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await feedbackService.submitFeedback({
        userId: user?.uid || undefined,
        userEmail: email.trim() || user?.email || undefined,
        feedbackType: selectedType as 'bug' | 'feature' | 'general' | 'praise',
        title: title.trim(),
        description: description.trim(),
        rating: rating > 0 ? rating : undefined
      });

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We appreciate your input and will review it carefully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedType('');
              setTitle('');
              setDescription('');
              setEmail('');
              setRating(0);
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#ffc107' : theme.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top','left','right','bottom']}>
      <StatusBar style={theme.statusBarStyle} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
      >
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Send Feedback</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Feedback Type Selection */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>What type of feedback?</Text>
          <View style={styles.feedbackTypes}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.feedbackTypeCard,
                  { borderColor: theme.border },
                  selectedType === type.id && { borderColor: type.color, backgroundColor: type.color + '10' }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                  <Ionicons name={type.icon as any} size={24} color={type.color} />
                </View>
                <View style={styles.typeContent}>
                  <Text style={[styles.typeTitle, { color: theme.text }]}>{type.title}</Text>
                  <Text style={[styles.typeDescription, { color: theme.textSecondary }]}>{type.description}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  { borderColor: theme.border },
                  selectedType === type.id && { borderColor: type.color }
                ]}>
                  {selectedType === type.id && (
                    <View style={[styles.radioFill, { backgroundColor: type.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Rating */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rate your experience</Text>
          <View style={styles.ratingContainer}>
            {renderStars()}
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {rating === 0 ? 'Tap to rate' : `${rating} out of 5 stars`}
            </Text>
          </View>
        </View>

        {/* Feedback Form */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tell us more</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[styles.textInput, { 
                borderColor: theme.border, 
                color: theme.text, 
                backgroundColor: theme.background 
              }]}
              placeholder="Brief summary of your feedback"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput, { 
                borderColor: theme.border, 
                color: theme.text, 
                backgroundColor: theme.background 
              }]}
              placeholder="Please provide detailed feedback..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Email (Optional)</Text>
            <TextInput
              style={[styles.textInput, { 
                borderColor: theme.border, 
                color: theme.text, 
                backgroundColor: theme.background 
              }]}
              placeholder="Your email for follow-up"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  feedbackTypes: {
    gap: 12,
  },
  feedbackTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
  },
  submitSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
}); 