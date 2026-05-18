import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { router, useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  // Fetch transactions from Firebase
  const fetchTransactions = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userTransactions = await transactionsService.getUserTransactions(user.uid, 1000); // Get all transactions
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Refresh when tab comes into focus (when user navigates to this tab)
  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
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
            try {
              await transactionsService.deleteTransaction(transaction.id!);

              // Remove from local state
              setTransactions(prev => prev.filter(tx => tx.id !== transaction.id));

              // Show success notification
              Alert.alert('Success', 'Transaction deleted successfully');

              // Send notification
              await notificationService.sendLocalNotification(
                'Transaction Deleted',
                `"${transaction.description}" has been removed from your records.`,
                { type: 'transaction_deleted', icon: 'trash-outline' }
              );
            } catch (error) {
              console.error('Error deleting transaction:', error);
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

  const generateImageContent = (transactions: Transaction[]) => {
    // Create HTML content that can be converted to image
    const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome - totalExpense;

    // Get active filters
    const activeFilters = [];
    if (filterType) activeFilters.push(`Type: ${filterType}`);
    if (filterCategory) activeFilters.push(`Category: ${filterCategory}`);
    if (search) activeFilters.push(`Search: "${search}"`);
    if (sort !== 'newest') activeFilters.push(`Sort: ${SORT_OPTIONS.find(opt => opt.value === sort)?.label || sort}`);

    const filterText = activeFilters.length > 0 ? activeFilters.join(' • ') : 'All transactions';

    // Show all transactions when no filters, or filtered transactions
    const transactionsToShow = filteredTransactions;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Transaction Report</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .filters {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
          }
          .filters h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 16px;
            font-weight: bold;
          }
          .filters p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
          }
          .transactions {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
          }
          .transactions h2 {
            color: #333;
            margin: 0 0 20px 0;
            font-size: 20px;
          }
          .transaction {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .transaction:last-child {
            margin-bottom: 0;
          }
          .transaction-info {
            flex: 1;
          }
          .transaction-title {
            font-weight: bold;
            color: #333;
            font-size: 16px;
            margin-bottom: 5px;
          }
          .transaction-meta {
            color: #666;
            font-size: 14px;
          }
          .transaction-amount {
            font-weight: bold;
            font-size: 18px;
            padding: 8px 15px;
            border-radius: 20px;
            color: white;
          }
          .income {
            background: linear-gradient(135deg, #4CAF50, #45a049);
          }
          .expense {
            background: linear-gradient(135deg, #f44336, #d32f2f);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 CashCraft Transaction Report</h1>
            <p>Your financial summary at a glance</p>
          </div>
          
          <div class="filters">
            <h3>🔍 Applied Filters</h3>
            <p>${filterText}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Income</h3>
              <div class="amount">${currency}${totalIncome.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <h3>Total Expense</h3>
              <div class="amount">${currency}${totalExpense.toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <h3>Balance</h3>
              <div class="amount">${currency}${balance.toLocaleString()}</div>
            </div>
          </div>
          
          <div class="transactions">
            <h2>📊 Transactions (${transactionsToShow.length})</h2>
            ${transactionsToShow.length > 0 ? transactionsToShow.map(tx => `
              <div class="transaction">
                <div class="transaction-info">
                  <div class="transaction-title">${tx.description}</div>
                  <div class="transaction-meta">${formatDateShort(tx.date)} • ${tx.categoryName || 'Unknown'}</div>
                </div>
                <div class="transaction-amount ${tx.type}">
                  ${tx.type === 'income' ? '+' : '-'}${currency}${tx.amount.toLocaleString()}
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">No Transactions Found</div>
                <div style="font-size: 14px;">Try adjusting your filters to see more results.</div>
              </div>
            `}
          </div>
          
          <div class="footer">
            Generated by CashCraft • ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
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

  const handleDownloadImage = () => {
    setShowDownload(false);
    setTimeout(async () => {
      const imageContent = generateImageContent(filteredTransactions);
      await downloadFile(imageContent, 'transactions_report.html', 'text/html', 'public.html');
    }, 500);
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

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

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
              <Text style={styles.totalLabel}>Total ({filteredTransactions.length} transactions)</Text>
              <Text style={styles.totalAmount}>{currency} {totalAmount.toLocaleString()}</Text>
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
    </SafeAreaView>
  );
}