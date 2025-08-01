import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { helpCenterService, HelpArticle } from '../services/supportService';

const HELP_CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', icon: 'rocket' },
  { id: 'transactions', title: 'Transactions', icon: 'card' },
  { id: 'categories', title: 'Categories', icon: 'folder' },
  { id: 'account', title: 'Account', icon: 'person' },
  { id: 'troubleshooting', title: 'Troubleshooting', icon: 'help-circle' },
];

export default function HelpCenter() {
  const { theme } = useTheme();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const allArticles = await helpCenterService.getPublishedArticles();
      setArticles(allArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      Alert.alert('Error', 'Failed to load help articles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleArticlePress = (article: HelpArticle) => {
    // Navigate to article detail page
    router.push({
      pathname: '/support/article-detail',
      params: { article: JSON.stringify(article) }
    });
  };

  const renderCategoryItem = ({ item }: { item: typeof HELP_CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        { backgroundColor: theme.card },
        selectedCategory === item.id && { backgroundColor: theme.primary }
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={24} 
        color={selectedCategory === item.id ? '#fff' : theme.textSecondary} 
      />
      <Text style={[
        styles.categoryTitle,
        { color: theme.textSecondary },
        selectedCategory === item.id && { color: '#fff' }
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderArticleItem = ({ item }: { item: HelpArticle }) => (
    <TouchableOpacity
      style={[styles.articleItem, { backgroundColor: theme.card }]}
      onPress={() => handleArticlePress(item)}
    >
      <View style={styles.articleHeader}>
        <Text style={[styles.articleTitle, { color: theme.text }]}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      </View>
      <Text style={[styles.articlePreview, { color: theme.textSecondary }]} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.articleTags}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={[styles.tag, { backgroundColor: theme.surface }]}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.statusBarStyle} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading help articles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBarStyle} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Help Center</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search help articles..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={theme.textTertiary}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <FlatList
            data={HELP_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Articles */}
        <View style={styles.articlesSection}>
          <View style={styles.articlesHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedCategory 
                ? HELP_CATEGORIES.find(cat => cat.id === selectedCategory)?.title 
                : 'All Articles'
              }
            </Text>
            <Text style={[styles.articlesCount, { color: theme.textSecondary }]}>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {filteredArticles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No Articles Found</Text>
              <Text style={[styles.emptyMessage, { color: theme.textTertiary }]}>
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No help articles available for this category'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredArticles}
              renderItem={renderArticleItem}
              keyExtractor={item => item.id || ''}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  articlesSection: {
    flex: 1,
  },
  articlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  articlesCount: {
    fontSize: 14,
  },
  articleItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  articlePreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  articleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
}); 