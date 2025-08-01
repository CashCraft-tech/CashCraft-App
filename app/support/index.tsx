import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

interface SupportOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  route: string;
}

const supportOptions: SupportOption[] = [
  {
    id: 'help-center',
    title: 'Help Center',
    subtitle: 'Find answers to common questions',
    icon: 'help-circle',
    iconColor: '#4caf50',
    route: '/support/help-center'
  },
  {
    id: 'contact',
    title: 'Contact Support',
    subtitle: 'Get in touch with our team',
    icon: 'mail',
    iconColor: '#2196f3',
    route: '/support/contact'
  },
  {
    id: 'feedback',
    title: 'Send Feedback',
    subtitle: 'Share your thoughts with us',
    icon: 'chatbubble',
    iconColor: '#ff9800',
    route: '/support/feedback'
  }
];

export default function SupportIndex() {
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={[styles.welcomeIcon, { backgroundColor: theme.surface }]}>
            <FontAwesome5 name="headset" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>How can we help you?</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            Choose an option below to get the support you need
          </Text>
        </View>

        {/* Support Options */}
        <View style={styles.optionsContainer}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(option.route as any)}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.iconColor + '20' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.iconColor} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.text }]}>{option.title}</Text>
                <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tips */}
        <View style={[styles.tipsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>Quick Tips</Text>
          <View style={styles.tipItem}>
            <MaterialIcons name="lightbulb" size={16} color={theme.warning} />
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Check our Help Center first for quick answers</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="schedule" size={16} color={theme.warning} />
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Support team responds within 24 hours</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="security" size={16} color={theme.warning} />
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Your data is secure and private</Text>
          </View>
        </View>

                                   {/* Contact Info */}
          <View style={[styles.contactSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.contactTitle, { color: theme.text }]}>Need immediate help?</Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={16} color="#ff4444" />
                <Text style={[styles.contactText, { color: theme.textSecondary }]}>+91 9765559032</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={16} color="#ff4444" />
                <Text style={[styles.contactText, { color: theme.textSecondary }]}>prasadpansare02@gmail.com</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="time" size={16} color="#ff4444" />
                <Text style={[styles.contactText, { color: theme.textSecondary }]}>9 AM - 6 PM IST (Mon-Fri)</Text>
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
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  optionCard: {
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
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tipsSection: {
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
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
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
    marginBottom: 16,
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
}); 