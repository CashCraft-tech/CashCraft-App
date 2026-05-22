import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ViewShot from 'react-native-view-shot';
import { Alert, Dimensions, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionsScreenSkeleton } from '../components/skeleton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { notificationService } from '../services/notificationService';
import { Transaction, transactionsService } from '../services/transactionsService';
import { formatDateShort } from '../utils/dateUtils';
import { getIconComponent } from '../utils/iconUtils';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');
const tabBarHeight = 90; // Height of the tab bar
const headerHeight = 120; // Approximate height of header, search, and action buttons
const margin = 40; // Total margins (20 top + 20 bottom)

// Calculate flexible height for listCard
const listCardHeight = screenHeight - tabBarHeight - headerHeight - margin;

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Others'];
const TYPES = ['Income', 'Expense'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'High Amount', value: 'high' },
  { label: 'Low Amount', value: 'low' },
];

export default function Transactions() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { currency } = useCurrency();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  // Fetch transactions using React Query
  const { data: userTransactions, isLoading: loading, refetch } = useQuery({
    queryKey: ['transactions', user?.uid],
    queryFn: () => transactionsService.getUserTransactions(user?.uid!, 1000),
    enabled: !!user?.uid,
  });

  const transactions = userTransactions || [];

  // Refresh when tab comes into focus (when user navigates to this tab)
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refetch();
      }
    }, [user?.uid, refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Delete transaction function
  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!transaction.id) {
      Alert.alert('Error', 'Cannot delete transaction: Missing transaction ID');
      return;
    }

    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.description}" for ${currency}${transaction.amount}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const queryKey = ['transactions', user?.uid];
            const previousTransactions = queryClient.getQueryData<Transaction[]>(queryKey);

            // Optimistically update UI by removing the transaction from cache immediately
            if (previousTransactions) {
              queryClient.setQueryData(
                queryKey,
                previousTransactions.filter(t => t.id !== transaction.id)
              );
            }

            try {
              // Perform deletion on Firestore in the background
              await transactionsService.deleteTransaction(transaction.id!);

              // Silently invalidate queries in the background to ensure data sync
              queryClient.invalidateQueries({ queryKey });
              queryClient.invalidateQueries({ queryKey: ['homeData', user?.uid] });
              queryClient.invalidateQueries({ queryKey: ['dashboardData', user?.uid] });

              // Show success notification asynchronously
              Alert.alert('Success', 'Transaction deleted successfully');

              // Send notification in the background
              notificationService.sendLocalNotification(
                'Transaction Deleted',
                `"${transaction.description}" has been removed from your records.`,
                { type: 'transaction_deleted', icon: 'trash-outline' }
              ).catch(console.error);

            } catch (error) {
              console.error('Error deleting transaction:', error);
              // Rollback to previous state on failure
              if (previousTransactions) {
                queryClient.setQueryData(queryKey, previousTransactions);
              }
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };



  const generateCSV = (transactions: Transaction[]) => {
    const headers = 'Date,Description,Category,Type,Amount\n';
    const rows = transactions.map(tx =>
      `${formatDateShort(tx.date)},${tx.description},${tx.categoryName || 'Unknown'},${tx.type},${tx.amount}`
    ).join('\n');
    return headers + rows;
  };

  const generatePDF = (transactions: Transaction[]) => {
    const headers = 'Date\tDescription\tCategory\tType\tAmount\n';
    const rows = transactions.map(tx =>
      `${formatDateShort(tx.date)}\t${tx.description}\t${tx.categoryName || 'Unknown'}\t${tx.type}\t${tx.amount}`
    ).join('\n');
    return headers + rows;
  };

  const generateTable = (transactions: Transaction[]) => {
    // Create a nicely formatted table with borders
    const header = '┌──────────────┬──────────────────────┬──────────────┬──────────┬──────────┐\n';
    const separator = '├──────────────┼──────────────────────┼──────────────┼──────────┼──────────┤\n';
    const footer = '└──────────────┴──────────────────────┴──────────────┴──────────┴──────────┘\n';

    // Header row
    const headerRow = '│ Date          │ Description           │ Category      │ Type     │ Amount   │\n';

    // Data rows
    const dataRows = transactions.map(tx => {
      const date = formatDateShort(tx.date).padEnd(14);
      const description = (tx.description || '').substring(0, 20).padEnd(20);
      const category = (tx.categoryName || 'Unknown').substring(0, 12).padEnd(12);
      const type = tx.type.padEnd(8);
      const amount = `${currency}${tx.amount}`.padEnd(8);

      return `│ ${date} │ ${description} │ ${category} │ ${type} │ ${amount} │`;
    }).join('\n');

    // Summary
    const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome - totalExpense;

    const summary = `\n\nSUMMARY:\n`;
    const summaryRow1 = `Total Income:  ${currency}${totalIncome.toLocaleString()}\n`;
    const summaryRow2 = `Total Expense: ${currency}${totalExpense.toLocaleString()}\n`;
    const summaryRow3 = `Balance:       ${currency}${balance.toLocaleString()}\n`;
    const summaryRow4 = `Transactions:  ${transactions.length}\n`;

    return header + headerRow + separator + dataRows + '\n' + footer + summary + summaryRow1 + summaryRow2 + summaryRow3 + summaryRow4;
  };



  const downloadFile = async (content: string, filename: string, mimeType: string, UTI?: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          UTI,
          dialogTitle: 'Download Transaction Report'
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file.');
    }
  };

  const handleDownloadCSV = () => {
    setShowDownload(false);
    setTimeout(async () => {
      const csvContent = generateCSV(filteredTransactions);
      await downloadFile(csvContent, 'transactions.csv', 'text/csv', 'public.comma-separated-values-text');
    }, 500);
  };

  const handleDownloadPDF = () => {
    setShowDownload(false);
    setTimeout(async () => {
      const pdfContent = generatePDF(filteredTransactions);
      await downloadFile(pdfContent, 'transactions.txt', 'text/plain', 'public.plain-text');
    }, 500);
  };

  const handleDownloadTable = () => {
    setShowDownload(false);
    setTimeout(async () => {
      const tableContent = generateTable(filteredTransactions);
      await downloadFile(tableContent, 'transactions_table.txt', 'text/plain', 'public.plain-text');
    }, 500);
  };

  const handleDownloadImage = async () => {
    setShowDownload(false);
    try {
      setTimeout(async () => {
        if (viewShotRef.current?.capture) {
          const uri = await viewShotRef.current.capture();
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: 'image/png',
              UTI: 'public.png',
              dialogTitle: 'Download Transaction Receipt'
            });
          } else {
            Alert.alert('Sharing not available', 'Sharing is not available on this device.');
          }
        }
      }, 500);
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to generate image.');
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      // Enhanced full-text search across all fields
      const searchTerm = search.toLowerCase().trim();

      if (searchTerm) {
        // Create a comprehensive search string from all transaction fields
        const searchableText = [
          tx.description || '',
          tx.categoryName || '',
          tx.notes || '',
          tx.payment || '',
          tx.amount?.toString() || '',
          tx.type || '',
          // Format date for search
          typeof tx.date === 'object' ?
            tx.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) :
            tx.date?.toString() || '',
          // Add time if available
          tx.time || '',
        ].join(' ').toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesType = !filterType || tx.type === filterType.toLowerCase();
        const matchesCategory = !filterCategory || tx.categoryName?.toLowerCase() === filterCategory.toLowerCase();

        return matchesSearch && matchesType && matchesCategory;
      } else {
        // No search term, just apply filters
        const matchesType = !filterType || tx.type === filterType.toLowerCase();
        const matchesCategory = !filterCategory || tx.categoryName?.toLowerCase() === filterCategory.toLowerCase();

        // Debug logging
        if (filterCategory) { }

        return matchesType && matchesCategory;
      }
    })
    .sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'high':
          return b.amount - a.amount;
        case 'low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const totalAmount = filteredTransactions.reduce((sum, tx) => {
    return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
  }, 0);

  // Get unique categories from actual transaction data
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    transactions.forEach(tx => {
      if (tx.categoryName) {
        categories.add(tx.categoryName);
      }
    });
    return Array.from(categories).sort();
  };

  const uniqueCategories = getUniqueCategories();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.touchable,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    headerBellWrap: {
      marginRight: 8,
      position: 'relative',
    },
    bellCircle: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    headerDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.error,
      borderWidth: 2,
      borderColor: theme.card,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 10,
      marginHorizontal: 20,
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.border
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 10,
      gap: 10
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.border
    },
    actionBtnText: {
      marginLeft: 6,
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 15
    },
    listCard: {
      height: 480,
      backgroundColor: theme.card,
      borderRadius: 16,
      margin: 20,
      marginTop: 0,
      padding: 0,
      borderWidth: 1,
      borderColor: theme.border,
    },
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderColor: theme.borderLight
    },
    txContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    txIcon: {
      marginRight: 12,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 8
    },
    txLabel: {
      fontSize: 15,
      color: theme.text,
      fontWeight: 'bold'
    },
    txDate: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2
    },
    txAmount: {
      fontSize: 15,
      color: theme.text,
      fontWeight: 'bold',
      marginLeft: 8
    },
    deleteButton: {
      padding: 8,
      marginLeft: 10,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
      borderTopWidth: 1,
      borderColor: theme.border
    },
    fixedTotalRow: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
      borderTopWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    totalLabel: {
      fontWeight: 'bold',
      color: theme.text,
      fontSize: 15
    },
    totalAmount: {
      fontWeight: 'bold',
      color: theme.text,
      fontSize: 15
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.18)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalCard: {
      backgroundColor: theme.card,
      borderRadius: 18,
      width: '85%',
      maxWidth: 400,
      padding: 18,
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalOption: {
      paddingVertical: 12
    },
    modalOptionText: {
      fontSize: 16,
      color: theme.text
    },
    modalSectionTitle: {
      fontWeight: 'bold',
      color: theme.text,
      fontSize: 15,
      marginBottom: 8
    },
    filterChip: {
      backgroundColor: theme.touchable,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginRight: 8,
      marginBottom: 8
    },
    filterChipActive: {
      backgroundColor: theme.primary
    },
    filterChipText: {
      color: theme.text,
      fontWeight: 'bold'
    },
    filterChipTextActive: {
      color: theme.textInverse
    },
    clearBtn: {
      marginTop: 16,
      alignSelf: 'flex-end'
    },
    clearBtnText: {
      color: theme.primary,
      fontWeight: 'bold',
      fontSize: 15
    },
    downloadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.touchable,
      borderRadius: 10,
      padding: 14,
      marginTop: 10,
      gap: 8
    },
    downloadBtnText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 15
    },
    downloadSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 10
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyStateIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 3,
      borderColor: theme.primary,
      borderStyle: 'dashed',
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyStateMessage: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 28,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    emptyStateButtonText: {
      color: theme.textInverse,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  if (loading) {
    return <TransactionsScreenSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSubtitle}>Manage your financial records</Text>
          </View>
          <View style={styles.bellCircle}>
            <TouchableOpacity onPress={() => router.push('/components/notifications')}>
              <Ionicons name="notifications-outline" size={25} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={theme.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSort(true)}>
            <Ionicons name="funnel-outline" size={18} color={theme.text} />
            <Text style={styles.actionBtnText}>Sort</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="options-outline" size={18} color={theme.text} />
            <Text style={styles.actionBtnText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDownload(true)}>
            <Ionicons name="download-outline" size={18} color={theme.text} />
            <Text style={styles.actionBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        {filteredTransactions.length > 0 ? (
          <View style={styles.listCard}>
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <View style={styles.txRow}>
                  <TouchableOpacity
                    style={styles.txContent}
                    onPress={() => router.push({
                      pathname: '/components/transaction-details',
                      params: { transaction: JSON.stringify(item) }
                    })}
                  >
                    <View style={styles.txIcon}>
                      {getIconComponent(item.categoryIcon || 'category', item.categoryColor || '#4CAF50', 20)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txLabel}>{item.description}</Text>
                      <Text style={styles.txDate}>{formatDateShort(item.date)}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: item.type === 'income' ? theme.success : theme.error }]}>
                      {item.type === 'income' ? '+' : '-'}{currency} {item.amount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTransaction(item)}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.error} />
                  </TouchableOpacity>
                </View>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
              }
            />
            <View style={styles.fixedTotalRow}>
              <Text style={styles.totalLabel}>Net Balance ({filteredTransactions.length} transactions)</Text>
              <Text style={[styles.totalAmount, { color: totalAmount >= 0 ? theme.success : theme.error }]}>
                {totalAmount >= 0 ? `${currency}${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-${currency}${Math.abs(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <FontAwesome5 name="receipt" size={50} color={theme.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>No Transactions Found</Text>
            <Text style={styles.emptyStateMessage}>
              {search || filterType || filterCategory
                ? 'Try adjusting your search or filters to find more transactions.'
                : 'Start by adding your first transaction to track your finances.'}
            </Text>
            {!search && !filterType && !filterCategory && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sort Modal */}
        <Modal
          visible={showSort}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSort(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSort(false)}
          >
            <TouchableOpacity
              style={styles.modalCard}
              activeOpacity={1}
              onPress={() => { }}
            >
              <Text style={styles.modalSectionTitle}>Sort Transactions</Text>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.value} style={styles.modalOption} onPress={() => { setSort(opt.value); setShowSort(false); }}>
                  <Text style={[styles.modalOptionText, sort === opt.value && { color: theme.primary, fontWeight: 'bold' }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={showFilter}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFilter(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilter(false)}
          >
            <TouchableOpacity
              style={styles.modalCard}
              activeOpacity={1}
              onPress={() => { }}
            >
              <Text style={styles.modalSectionTitle}>Filter by Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, filterType === type && styles.filterChipActive]}
                    onPress={() => setFilterType(filterType === type ? null : type)}
                  >
                    <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalSectionTitle}>Filter by Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {uniqueCategories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
                    onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
                  >
                    <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.clearBtn} onPress={() => { setFilterType(null); setFilterCategory(null); setShowFilter(false); }}>
                <Text style={styles.clearBtnText}>Clear All Filters</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Download Modal */}
        <Modal
          visible={showDownload}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDownload(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDownload(false)}
          >
            <TouchableOpacity
              style={styles.modalCard}
              activeOpacity={1}
              onPress={() => { }}
            >
              <Text style={styles.modalSectionTitle}>Export Transactions</Text>
              <Text style={styles.downloadSubtitle}>Choose your preferred format</Text>

              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadCSV}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
                <Text style={styles.downloadBtnText}>Download as CSV</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF}>
                <Ionicons name="document-outline" size={20} color={theme.primary} />
                <Text style={styles.downloadBtnText}>Download as Text</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadImage}>
                <Ionicons name="image-outline" size={20} color={theme.primary} />
                <Text style={styles.downloadBtnText}>Download as Image</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
      {/* Hidden Bill Receipt for ViewShot */}
      <View style={{ position: 'absolute', top: 0, left: 0, opacity: 0.01, zIndex: -1000, pointerEvents: 'none' }}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
          <View style={{ backgroundColor: '#fff', padding: 24, width: 400, borderColor: '#111827', borderWidth: 2, borderRadius: 8 }}>
            
            {/* Top Official Seal/Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require("../../assets/images/icon.png")} style={{ width: 36, height: 36, marginRight: 10, borderRadius: 8 }} />
                <View>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: 1.5 }}>CASHCRAFT</Text>
                  <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Official Financial Ledger</Text>
                </View>
              </View>
              {/* Logo / Badge */}
              <View style={{ backgroundColor: '#EEF2FF', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="shield-checkmark" size={28} color="#4F46E5" />
              </View>
            </View>

            {/* Document Metadata Details */}
            <View style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '500' }}>DOCUMENT REF:</Text>
                <Text style={{ fontSize: 10, color: '#1F2937', fontWeight: '700', fontFamily: 'Courier' }}>CC-{Math.random().toString(36).substring(2, 8).toUpperCase()}-{new Date().getTime().toString().slice(-6)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '500' }}>ISSUED TO:</Text>
                <Text style={{ fontSize: 10, color: '#1F2937', fontWeight: '700' }}>{user?.email || 'Authenticated CashCraft User'}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '500' }}>SECURITY STATUS:</Text>
                <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '800', letterSpacing: 0.5 }}>✓ VERIFIED SECURE</Text>
              </View>
            </View>

            <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#111827', borderStyle: 'solid', marginBottom: 16 }} />
            
            {/* Header Columns */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B5563', flex: 2 }}>DETAILS</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B5563', flex: 1, textAlign: 'center' }}>CATEGORY</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B5563', flex: 1.2, textAlign: 'right' }}>AMOUNT</Text>
            </View>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 12 }} />

            {filteredTransactions.length > 0 ? filteredTransactions.map((tx, idx) => (
              <View key={tx.id || idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                <View style={{ flex: 2, paddingRight: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }} numberOfLines={1}>{tx.description}</Text>
                  <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 1 }}>{formatDateShort(tx.date)}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#4B5563', fontWeight: '500', flex: 1, textAlign: 'center' }} numberOfLines={1}>{tx.categoryName || 'Unknown'}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: tx.type === 'income' ? '#059669' : '#DC2626', flex: 1.2, textAlign: 'right' }}>
                  {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            )) : (
              <Text style={{ textAlign: 'center', color: '#9CA3AF', marginVertical: 24, fontSize: 12 }}>No transactions to display.</Text>
            )}
            
            <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#111827', borderStyle: 'solid', marginVertical: 16 }} />
            
            {/* Financial Summary */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, color: '#4B5563', fontWeight: '500' }}>Subtotal Income</Text>
              <Text style={{ fontSize: 12, color: '#1F2937', fontWeight: '600' }}>{currency}{filteredTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, color: '#4B5563', fontWeight: '500' }}>Subtotal Expense</Text>
              <Text style={{ fontSize: 12, color: '#1F2937', fontWeight: '600' }}>{currency}{filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', borderStyle: 'dashed', marginVertical: 8 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', textTransform: 'uppercase' }}>Net Balance</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: totalAmount >= 0 ? '#059669' : '#DC2626' }}>
                {totalAmount >= 0 ? `${currency}${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-${currency}${Math.abs(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Text>
            </View>
            
            <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#111827', borderStyle: 'solid', marginVertical: 16 }} />
            
            {/* Signature & Verification section */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              {/* Barcode representation */}
              <View style={{ width: 120, height: 40, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', height: 28, alignItems: 'stretch' }}>
                  {/* Fake barcode bars */}
                  {[1,3,1,2,4,1,2,3,1,4,1,2,1,3,2,1,4,1].map((width, idx) => (
                    <View key={idx} style={{ backgroundColor: '#111827', width: width, marginRight: idx % 3 === 0 ? 2 : 1 }} />
                  ))}
                </View>
                <Text style={{ fontSize: 7, color: '#6B7280', letterSpacing: 2, marginTop: 4, textAlign: 'center', fontFamily: 'Courier' }}>CASHCRAFT SECURE</Text>
              </View>

              {/* Digital Signature Stamp */}
              <View style={{ alignItems: 'center', borderWidth: 1, borderColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, transform: [{ rotate: '-3deg' }] }}>
                <Text style={{ fontSize: 8, color: '#4F46E5', fontWeight: '800', letterSpacing: 0.5 }}>DIGITALLY SIGNED</Text>
                <Text style={{ fontSize: 10, color: '#4F46E5', fontWeight: '900', fontFamily: 'Courier', marginVertical: 2 }}>CashCraft Labs</Text>
                <Text style={{ fontSize: 7, color: '#4F46E5', fontWeight: '600' }}>AUTHENTIC LEDGER</Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 24, paddingTop: 12 }}>
              <Text style={{ textAlign: 'center', fontSize: 9, color: '#9CA3AF', lineHeight: 12 }}>
                This is a computer-generated ledger certified by CashCraft cryptographic protocols. No physical signature is required. For security verifications, refer to the document reference identifier listed above.
              </Text>
            </View>
          </View>
        </ViewShot>
      </View>
    </SafeAreaView>
  );
}