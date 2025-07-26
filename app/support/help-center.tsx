import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I add my first transaction?",
    answer: "Tap the '+' button on the bottom tab bar, fill in the transaction details, select a category, and tap 'Save Transaction'.",
    category: "Getting Started"
  },
  {
    question: "How do I create custom categories?",
    answer: "Go to Profile → Manage Categories, tap the '+' button, choose an icon, set a color, and save your new category.",
    category: "Categories"
  },
  {
    question: "Can I edit or delete transactions?",
    answer: "Yes! Tap on any transaction in the list to view details, then use the edit or delete options.",
    category: "Transactions"
  },
  {
    question: "How do I filter my transactions?",
    answer: "In the Transactions tab, tap the 'Filter' button to filter by type (Income/Expense) or category.",
    category: "Transactions"
  },
  {
    question: "What if I forgot my password?",
    answer: "On the login screen, tap 'Forgot Password?' and follow the instructions to reset your password via email.",
    category: "Account"
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to Profile → Personal Information, tap 'Edit', make your changes, and save.",
    category: "Account"
  },
  {
    question: "Can I export my transaction data?",
    answer: "Yes! In the Transactions tab, tap the download icon to export your data as CSV or PDF.",
    category: "Data"
  },
  {
    question: "How do I understand my spending analytics?",
    answer: "Check the Dashboard tab for spending breakdowns, category analysis, and monthly trends.",
    category: "Analytics"
  }
];

export default function HelpCenter() {
  const categories = [...new Set(faqData.map(item => item.category))];
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Getting Started': return <FontAwesome5 name="rocket" size={20} color="#4caf50" />;
      case 'Categories': return <FontAwesome5 name="tags" size={20} color="#2196f3" />;
      case 'Transactions': return <FontAwesome5 name="receipt" size={20} color="#ff9800" />;
      case 'Account': return <FontAwesome5 name="user-cog" size={20} color="#9c27b0" />;
      case 'Data': return <FontAwesome5 name="database" size={20} color="#607d8b" />;
      case 'Analytics': return <FontAwesome5 name="chart-line" size={20} color="#e91e63" />;
      default: return <MaterialIcons name="help" size={20} color="#666" />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/support/contact')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="mail" size={24} color="#4caf50" />
            </View>
            <Text style={styles.quickActionTitle}>Contact Support</Text>
            <Text style={styles.quickActionSubtitle}>Get in touch with our team</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => router.push('/support/feedback')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="chatbubble" size={24} color="#2196f3" />
            </View>
            <Text style={styles.quickActionTitle}>Send Feedback</Text>
            <Text style={styles.quickActionSubtitle}>Share your thoughts with us</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Sections */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              {getCategoryIcon(category)}
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            
            {faqData
              .filter(item => item.category === category)
              .map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
              ))}
          </View>
        ))}

        {/* Additional Help */}
        <View style={styles.additionalHelp}>
          <Text style={styles.additionalHelpTitle}>Still need help?</Text>
          <Text style={styles.additionalHelpSubtitle}>
            Our support team is here to help you with any questions or issues.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push('/support/contact')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  categorySection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  additionalHelp: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalHelpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  additionalHelpSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 