import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

export default function TermsOfService() {
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last updated: December 2024</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              Welcome to CashCraft! These Terms of Service ("Terms") govern your use of the CashCraft mobile 
              application and related services (collectively, the "Service"). By using our Service, 
              you agree to these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree 
              with any part of these Terms, you may not access the Service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Description of Service</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              CashCraft is a personal finance management application that allows users to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Track income and expenses</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Categorize transactions</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Generate financial reports and analytics</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Set and monitor budgets</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Export financial data</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. User Accounts</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              To use certain features of the Service, you must create an account. You are responsible for:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Providing accurate and complete information</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Maintaining the security of your account credentials</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• All activities that occur under your account</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Notifying us immediately of any unauthorized use</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>4. User Responsibilities</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              You agree to use the Service only for lawful purposes and in accordance with these Terms. 
              You agree not to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Use the Service for any illegal or unauthorized purpose</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Attempt to gain unauthorized access to our systems</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Interfere with or disrupt the Service</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Share your account credentials with others</Text>
              <Text style={[styles.bulletItem, { color: theme.textSecondary }]}>• Upload malicious code or content</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Data and Privacy</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              Your privacy is important to us. Our collection and use of personal information is 
              governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Intellectual Property</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              The Service and its original content, features, and functionality are owned by CashCraft 
              and are protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Disclaimers</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              The Service is provided "as is" without warranties of any kind. We disclaim all warranties, 
              express or implied, including but not limited to warranties of merchantability, fitness for 
              a particular purpose, and non-infringement.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Limitation of Liability</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              In no event shall CashCraft be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Termination</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We may terminate or suspend your account and access to the Service immediately, without 
              prior notice, for any reason, including breach of these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>10. Changes to Terms</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              We reserve the right to modify these Terms at any time. We will notify users of any changes 
              by updating the "Last updated" date. Your continued use of the Service after changes 
              constitutes acceptance of the updated Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>11. Governing Law</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              These Terms shall be governed by and construed in accordance with the laws of India, 
              without regard to its conflict of law provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>12. Contact Information</Text>
            <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <View style={[styles.contactInfo, { backgroundColor: theme.surface }]}>
              <Text style={[styles.contactText, { color: theme.textSecondary }]}>Email: prasadpansare02@gmail.com</Text>
              <Text style={[styles.contactText, { color: theme.textSecondary }]}>Address: Hillview Residency, Behind Mahatma Society, Kothrud, Pune 411038</Text>
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