import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { contactService } from '../services/supportService';
import { useAuth } from '../context/AuthContext';

export default function ContactSupport() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'chat' | 'call'>('email');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await contactService.submitContact({
        userId: user?.uid || undefined,
        userEmail: user?.email || undefined,
        subject: subject.trim(),
        message: message.trim(),
        contactMethod
      });
      
      Alert.alert(
        'Message Sent',
        'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting contact:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      id: 'email' as const,
      title: 'Email Support',
      subtitle: 'Get a response within 24 hours',
      icon: 'mail',
      color: '#4caf50',
      description: 'Send us a detailed message and we\'ll respond via email.'
    },
    {
      id: 'chat' as const,
      title: 'Live Chat',
      subtitle: 'Available 9 AM - 6 PM IST',
      icon: 'chatbubble',
      color: '#2196f3',
      description: 'Chat with our support team in real-time for immediate assistance.'
    },
    {
      id: 'call' as const,
      title: 'Phone Support',
      subtitle: 'Call us directly',
      icon: 'call',
      color: '#ff9800',
      description: 'Speak with our support team directly for urgent issues.'
    }
  ];

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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Contact Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Contact Methods */}
        <View style={styles.contactMethods}>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.contactMethodCard,
                { backgroundColor: theme.card },
                contactMethod === method.id && { borderColor: theme.primary }
              ]}
              onPress={() => setContactMethod(method.id)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={24} color={method.color} />
              </View>
              <View style={styles.methodContent}>
                <Text style={[styles.methodTitle, { color: theme.text }]}>{method.title}</Text>
                <Text style={[styles.methodSubtitle, { color: theme.textSecondary }]}>{method.subtitle}</Text>
                <Text style={[styles.methodDescription, { color: theme.textTertiary }]}>{method.description}</Text>
              </View>
              <View style={[
                styles.radioButton,
                { borderColor: theme.border },
                contactMethod === method.id && { borderColor: method.color }
              ]}>
                {contactMethod === method.id && (
                  <View style={[styles.radioFill, { backgroundColor: method.color }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Form */}
        {contactMethod === 'email' && (
          <View style={[styles.formSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Send us a message</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Subject</Text>
              <TextInput
                style={[styles.textInput, { 
                  borderColor: theme.border, 
                  color: theme.text, 
                  backgroundColor: theme.background 
                }]}
                placeholder="Brief description of your issue"
                value={subject}
                onChangeText={setSubject}
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.messageInput, { 
                  borderColor: theme.border, 
                  color: theme.text, 
                  backgroundColor: theme.background 
                }]}
                placeholder="Please describe your issue in detail..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Direct Contact Info */}
        {contactMethod === 'chat' && (
          <View style={[styles.directContact, { backgroundColor: theme.card }]}>
            <View style={styles.contactInfoCard}>
              <Ionicons name="time" size={24} color="#2196f3" />
              <Text style={[styles.contactInfoTitle, { color: theme.text }]}>Live Chat Hours</Text>
              <Text style={[styles.contactInfoText, { color: theme.textSecondary }]}>Monday - Friday: 9:00 AM - 6:00 PM IST</Text>
              <Text style={[styles.contactInfoText, { color: theme.textSecondary }]}>Saturday: 10:00 AM - 4:00 PM IST</Text>
              <Text style={[styles.contactInfoText, { color: theme.textSecondary }]}>Sunday: Closed</Text>
            </View>
            
            <TouchableOpacity style={styles.chatButton}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
              <Text style={styles.chatButtonText}>Start Live Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {contactMethod === 'call' && (
          <View style={[styles.directContact, { backgroundColor: theme.card }]}>
            <View style={styles.contactInfoCard}>
              <Ionicons name="call" size={24} color="#ff9800" />
              <Text style={[styles.contactInfoTitle, { color: theme.text }]}>Call Us</Text>
              <Text style={[styles.contactInfoText, { color: theme.textSecondary }]}>Support: +91 1800-123-4567</Text>
              <Text style={[styles.contactInfoText, { color: theme.textSecondary }]}>Technical: +91 1800-123-4568</Text>
              <Text style={[styles.contactInfoText, { color: theme.textSecondary }]}>Available: 9:00 AM - 6:00 PM IST</Text>
            </View>
            
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Info */}
        <View style={[styles.additionalInfo, { backgroundColor: theme.card }]}>
          <Text style={[styles.additionalInfoTitle, { color: theme.text }]}>Before contacting us</Text>
          <View style={styles.infoItem}>
            <MaterialIcons name="check-circle" size={16} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>Check our Help Center for quick answers</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="check-circle" size={16} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>Have your account details ready</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="check-circle" size={16} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>Include screenshots if reporting a bug</Text>
          </View>
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
  contactMethods: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contactMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    lineHeight: 16,
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
  formSection: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  directContact: {
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
  contactInfoCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  contactInfoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  chatButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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