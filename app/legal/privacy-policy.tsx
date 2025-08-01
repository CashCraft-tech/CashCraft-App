import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

export default function PrivacyPolicy() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last updated: December 2024</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Information We Collect</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We collect information you provide directly to us, such as when you create an account, 
              add transactions, or contact our support team. This may include:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Personal information (name, email, phone number)</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Financial transaction data</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Category and budget information</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Device and usage information</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. How We Use Your Information</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We use the information we collect to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Provide and maintain our services</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Process your transactions and generate reports</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Send you important updates and notifications</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Improve our app and user experience</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Respond to your support requests</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Information Sharing</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except in the following circumstances:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• With your explicit consent</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• To comply with legal obligations</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• To protect our rights and safety</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• With trusted service providers who assist in app operations</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Data Security</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We implement appropriate security measures to protect your personal information:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Encryption of data in transit and at rest</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Secure authentication and access controls</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Regular security audits and updates</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Limited access to personal data on a need-to-know basis</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Your Rights</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              You have the right to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Access your personal information</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Correct inaccurate data</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Delete your account and data</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Export your data</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Opt out of marketing communications</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Data Retention</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We retain your personal information for as long as your account is active or as needed 
              to provide services. You may delete your account at any time, and we will delete your 
              data within 30 days of account deletion.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Cookies and Tracking</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We use cookies and similar technologies to enhance your experience, analyze app usage, 
              and provide personalized content. You can control cookie settings through your device 
              preferences.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Children's Privacy</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              Our app is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected such 
              information, please contact us immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Changes to This Policy</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date. Your 
              continued use of the app after changes constitutes acceptance of the updated policy.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>10. Contact Us</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us at:
            </Text>
            <View style={[styles.contactInfo, { backgroundColor: theme.surface }]}>
              <Text style={[styles.contactText, { color: theme.textSecondary }]}>Email: prasadpansare02@gmail.com</Text>
              <Text style={[styles.contactText, { color: theme.textSecondary }]}>Address:  Hillview Residency, Behind Mahatma Society, Kothrud, Pune 411038</Text>
              <Text style={[styles.contactText, { color: theme.textSecondary }]}>Phone: +91 9765559032</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  contactInfo: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 