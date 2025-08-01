import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

interface LegalDocument {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  route: string;
  lastUpdated: string;
}

const legalDocuments: LegalDocument[] = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your data',
    icon: 'shield-checkmark',
    iconColor: '#4caf50',
    route: '/legal/privacy-policy',
    lastUpdated: 'December 2024'
  },
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    subtitle: 'Rules and guidelines for using our app',
    icon: 'document-text',
    iconColor: '#2196f3',
    route: '/legal/terms-of-service',
    lastUpdated: 'December 2024'
  }
];

export default function LegalIndex() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Legal</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={[styles.welcomeIcon, { backgroundColor: theme.surface }]}>
            <FontAwesome5 name="balance-scale" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>Legal Information</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            Important legal documents and policies for using CashCraft
          </Text>
        </View>

        {/* Legal Documents */}
        <View style={styles.documentsContainer}>
          {legalDocuments.map((document) => (
            <TouchableOpacity
              key={document.id}
              style={[styles.documentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(document.route as any)}
            >
              <View style={[styles.documentIcon, { backgroundColor: document.iconColor + '20' }]}>
                <Ionicons name={document.icon as any} size={24} color={document.iconColor} />
              </View>
              <View style={styles.documentContent}>
                <Text style={[styles.documentTitle, { color: theme.text }]}>{document.title}</Text>
                <Text style={[styles.documentSubtitle, { color: theme.textSecondary }]}>{document.subtitle}</Text>
                <Text style={[styles.documentDate, { color: theme.textTertiary }]}>Last updated: {document.lastUpdated}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Important Notice */}
        <View style={[styles.noticeSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.noticeHeader}>
            <MaterialIcons name="info" size={20} color={theme.primary} />
            <Text style={[styles.noticeTitle, { color: theme.text }]}>Important Notice</Text>
          </View>
          <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
            These legal documents govern your use of CashCraft. By using our app, you agree to be bound 
            by these terms. Please read them carefully and contact us if you have any questions.
          </Text>
        </View>

        {/* Contact Legal */}
        <View style={[styles.contactSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.contactTitle, { color: theme.text }]}>Questions about our legal documents?</Text>
          <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
            Our legal team is here to help clarify any questions you may have.
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#4caf50" />
              <Text style={styles.contactText}>prasadpansare02@gmail.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#4caf50" />
              <Text style={styles.contactText}>+91 9765559032</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time" size={16} color="#4caf50" />
              <Text style={styles.contactText}>Response within 48 hours</Text>
            </View>
          </View>
        </View>

        {/* Data Protection */}
        <View style={styles.protectionSection}>
          <Text style={styles.protectionTitle}>Your Data Protection</Text>
          <View style={styles.protectionItem}>
            <MaterialIcons name="security" size={16} color="#4caf50" />
            <Text style={styles.protectionText}>Your data is encrypted and secure</Text>
          </View>
          <View style={styles.protectionItem}>
            <MaterialIcons name="privacy-tip" size={16} color="#4caf50" />
            <Text style={styles.protectionText}>We never sell your personal information</Text>
          </View>
          <View style={styles.protectionItem}>
            <MaterialIcons name="verified-user" size={16} color="#4caf50" />
            <Text style={styles.protectionText}>GDPR and local privacy law compliant</Text>
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
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4caf50',
    borderStyle: 'dashed',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  documentsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#999',
  },
  noticeSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  protectionSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  protectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  protectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  protectionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
}); 