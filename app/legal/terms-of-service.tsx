import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsOfService() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>

          <View style={styles.section}>
            <Text style={styles.sectionText}>
              Welcome to Bachat! These Terms of Service ("Terms") govern your use of the Bachat mobile 
              application and related services (collectively, the "Service"). By using our Service, 
              you agree to these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree 
              with any part of these Terms, you may not access the Service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.sectionText}>
              Bachat is a personal finance management application that allows users to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Track income and expenses</Text>
              <Text style={styles.bulletItem}>• Categorize transactions</Text>
              <Text style={styles.bulletItem}>• Generate financial reports and analytics</Text>
              <Text style={styles.bulletItem}>• Set and monitor budgets</Text>
              <Text style={styles.bulletItem}>• Export financial data</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.sectionText}>
              To use certain features of the Service, you must create an account. You are responsible for:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Providing accurate and complete information</Text>
              <Text style={styles.bulletItem}>• Maintaining the security of your account credentials</Text>
              <Text style={styles.bulletItem}>• All activities that occur under your account</Text>
              <Text style={styles.bulletItem}>• Notifying us immediately of any unauthorized use</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
            <Text style={styles.sectionText}>
              You agree to use the Service only for lawful purposes and in accordance with these Terms. 
              You agree not to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Use the Service for any illegal or unauthorized purpose</Text>
              <Text style={styles.bulletItem}>• Attempt to gain unauthorized access to our systems</Text>
              <Text style={styles.bulletItem}>• Interfere with or disrupt the Service</Text>
              <Text style={styles.bulletItem}>• Share your account credentials with others</Text>
              <Text style={styles.bulletItem}>• Upload malicious code or content</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data and Privacy</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Our collection and use of personal information is 
              governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
            <Text style={styles.sectionText}>
              The Service and its original content, features, and functionality are owned by Bachat 
              and are protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Disclaimers</Text>
            <Text style={styles.sectionText}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. 
              WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Warranties of merchantability and fitness for a particular purpose</Text>
              <Text style={styles.bulletItem}>• Warranties that the Service will be uninterrupted or error-free</Text>
              <Text style={styles.bulletItem}>• Warranties regarding the accuracy of financial calculations</Text>
              <Text style={styles.bulletItem}>• Warranties that defects will be corrected</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              IN NO EVENT SHALL BACHAT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, 
              OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Indemnification</Text>
            <Text style={styles.sectionText}>
              You agree to defend, indemnify, and hold harmless Bachat and its officers, directors, 
              employees, and agents from and against any claims, damages, obligations, losses, 
              liabilities, costs, or debt arising from your use of the Service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Termination</Text>
            <Text style={styles.sectionText}>
              We may terminate or suspend your account and access to the Service immediately, without 
              prior notice, for any reason, including breach of these Terms. Upon termination, your 
              right to use the Service will cease immediately.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Governing Law</Text>
            <Text style={styles.sectionText}>
              These Terms shall be governed by and construed in accordance with the laws of India, 
              without regard to its conflict of law provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right to modify these Terms at any time. We will notify users of any 
              material changes by posting the new Terms on this page. Your continued use of the 
              Service after changes constitutes acceptance of the updated Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. Contact Information</Text>
            <Text style={styles.sectionText}>
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>Email: legal@bachat.app</Text>
              <Text style={styles.contactText}>Address: [Your Company Address]</Text>
              <Text style={styles.contactText}>Phone: +91 1800-123-4567</Text>
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
    backgroundColor: '#F8F9FB',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
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
    color: '#333',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  contactInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
}); 