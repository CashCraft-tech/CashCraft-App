import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HelpArticle } from '../services/supportService';
import { useTheme } from '../context/ThemeContext';

export default function ArticleDetail() {
  const { theme } = useTheme();
  const { article } = useLocalSearchParams();
  const articleData: HelpArticle = article ? JSON.parse(article as string) : null;

  if (!articleData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.statusBarStyle} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.textTertiary} />
          <Text style={[styles.errorTitle, { color: theme.textSecondary }]}>Article Not Found</Text>
          <Text style={[styles.errorMessage, { color: theme.textTertiary }]}>The requested article could not be loaded.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: theme.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Help Article</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Article Content */}
        <View style={[styles.articleContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.articleTitle, { color: theme.text }]}>{articleData.title}</Text>
          
          <View style={styles.articleMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {formatDate(articleData.createdAt)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {articleData.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          </View>

          <View style={styles.tagsContainer}>
            {articleData.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.surface }]}>
                <Text style={[styles.tagText, { color: theme.textSecondary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.contentContainer}>
            <Text style={[styles.contentText, { color: theme.text }]}>{articleData.content}</Text>
          </View>
        </View>

        {/* Related Actions */}
        <View style={[styles.actionsContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.actionsTitle, { color: theme.text }]}>Was this article helpful?</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[
              styles.actionButton, 
              styles.helpfulButton, 
              { 
                backgroundColor: theme.surface,
                borderColor: '#4caf50' 
              }
            ]}>
              <Ionicons name="thumbs-up" size={20} color="#4caf50" />
              <Text style={styles.helpfulButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[
              styles.actionButton, 
              styles.notHelpfulButton, 
              { 
                backgroundColor: theme.surface,
                borderColor: '#f44336' 
              }
            ]}>
              <Ionicons name="thumbs-down" size={20} color="#f44336" />
              <Text style={styles.notHelpfulButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Support */}
        <View style={[styles.contactSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.contactTitle, { color: theme.text }]}>Still need help?</Text>
          <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
            If this article didn't answer your question, our support team is here to help.
          </Text>
          <TouchableOpacity 
            style={[styles.contactButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/support/contact')}
          >
            <Ionicons name="mail" size={20} color="#fff" />
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  articleContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 32,
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  helpfulButton: {
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  notHelpfulButton: {
    borderWidth: 1,
    borderColor: '#f44336',
  },
  helpfulButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
  },
  notHelpfulButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
  },
  contactSection: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 