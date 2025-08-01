import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Dimensions, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { transactionsService, Transaction } from '../services/transactionsService';
import { useAuth } from '../context/AuthContext';
import { formatDateShort } from '../utils/dateUtils';
import { notificationService } from '../services/notificationService';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');
const tabBarHeight = 90; // Height of the tab bar
const headerHeight = 120; // Approximate height of header, search, and action buttons
const margin = 40; // Total margins (20 top + 20 bottom)

// Calculate flexible height for listCard
const listCardHeight = screenHeight - tabBarHeight - headerHeight - margin;

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health'];
const TYPES = ['Income', 'Expense'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'High Amount', value: 'high' },
  { label: 'Low Amount', value: 'low' },
];

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterType, setFilterType] = useState<string|null>(null);
  const [filterCategory, setFilterCategory] = useState<string|null>(null);
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

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const getIconComponent = (iconName: string, color: string, size: number = 24) => {
    const iconMap: { [key: string]: any } = {
      // FontAwesome5 icons (from manage categories)
      'cart': <FontAwesome5 name="shopping-cart" size={size} color={color} />,
      'car': <FontAwesome5 name="car" size={size} color={color} />,
      'home': <FontAwesome5 name="home" size={size} color={color} />,
      'utensils': <FontAwesome5 name="utensils" size={size} color={color} />,
      'gamepad': <FontAwesome5 name="gamepad" size={size} color={color} />,
      'plane': <FontAwesome5 name="plane" size={size} color={color} />,
      'gift': <FontAwesome5 name="gift" size={size} color={color} />,
      'heart': <FontAwesome5 name="heart" size={size} color={color} />,
      'credit-card': <FontAwesome5 name="credit-card" size={size} color={color} />,
      'shopping-bag': <FontAwesome5 name="shopping-bag" size={size} color={color} />,
      'bolt': <FontAwesome5 name="bolt" size={size} color={color} />,
      'dollar-sign': <FontAwesome5 name="dollar-sign" size={size} color={color} />,
      'music': <FontAwesome5 name="music" size={size} color={color} />,
      'film': <FontAwesome5 name="film" size={size} color={color} />,
      'book': <FontAwesome5 name="book" size={size} color={color} />,
      'medkit': <FontAwesome5 name="medkit" size={size} color={color} />,
      'paw': <FontAwesome5 name="paw" size={size} color={color} />,
      'tshirt': <FontAwesome5 name="tshirt" size={size} color={color} />,
      'mobile-alt': <FontAwesome5 name="mobile-alt" size={size} color={color} />,
      'glass-cheers': <FontAwesome5 name="glass-cheers" size={size} color={color} />,
      
      // MaterialIcons and Ionicons (legacy support)
      'restaurant': <MaterialIcons name="restaurant" size={size} color={color} />,
      'car-sport': <Ionicons name="car-sport" size={size} color={color} />,
      'receipt': <MaterialIcons name="receipt" size={size} color={color} />,
      'movie': <MaterialIcons name="movie" size={size} color={color} />,
      'cash': <Ionicons name="cash" size={size} color={color} />,
      'laptop': <Ionicons name="laptop" size={size} color={color} />,
      'medical': <Ionicons name="medical" size={size} color={color} />,
      'school': <Ionicons name="school" size={size} color={color} />,
      'airplane': <Ionicons name="airplane" size={size} color={color} />,
      'bus': <Ionicons name="bus" size={size} color={color} />,
      'train': <Ionicons name="train" size={size} color={color} />,
      'bicycle': <Ionicons name="bicycle" size={size} color={color} />,
      'walk': <Ionicons name="walk" size={size} color={color} />,
      'fitness': <Ionicons name="fitness" size={size} color={color} />,
      'game-controller': <Ionicons name="game-controller" size={size} color={color} />,
      'library': <Ionicons name="library" size={size} color={color} />,
      'card': <Ionicons name="card" size={size} color={color} />,
      'wallet': <Ionicons name="wallet" size={size} color={color} />,
      'bank': <Ionicons name="business" size={size} color={color} />,
      'phone': <Ionicons name="phone-portrait" size={size} color={color} />,
      'wifi': <Ionicons name="wifi" size={size} color={color} />,
      'electricity': <Ionicons name="flash" size={size} color={color} />,
      'water': <Ionicons name="water" size={size} color={color} />,
      'gas': <Ionicons name="flame" size={size} color={color} />,
      'internet': <Ionicons name="globe" size={size} color={color} />,
      'tv': <Ionicons name="tv" size={size} color={color} />,
      'camera': <Ionicons name="camera" size={size} color={color} />,
      'pizza': <Ionicons name="pizza" size={size} color={color} />,
      'beer': <Ionicons name="beer" size={size} color={color} />,
      'wine': <Ionicons name="wine" size={size} color={color} />,
      'coffee': <Ionicons name="cafe" size={size} color={color} />,
      'fast-food': <Ionicons name="fast-food" size={size} color={color} />,
      'ice-cream': <Ionicons name="ice-cream" size={size} color={color} />,
    };
    return iconMap[iconName] || <MaterialIcons name="category" size={size} color={color} />;
  };

  // Filtering and sorting logic
  let filtered = transactions.filter(tx =>
    (!search || tx.description.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || tx.type === filterType.toLowerCase()) &&
    (!filterCategory || tx.categoryName === filterCategory)
  );
  
  if (sort === 'newest') filtered = filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  if (sort === 'oldest') filtered = filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  if (sort === 'high') filtered = filtered.sort((a, b) => b.amount - a.amount);
  if (sort === 'low') filtered = filtered.sort((a, b) => a.amount - b.amount);
  
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  // Download functions
  const generateCSV = (transactions: Transaction[]) => {
    const headers = 'Date,Description,Category,Type,Amount\n';
    const rows = transactions.map(tx => 
      `${tx.date.toLocaleDateString()},"${tx.description}",${tx.categoryName},${tx.type},${tx.amount}`
    ).join('\n');
    return headers + rows;
  };

  const generatePDF = (transactions: Transaction[]) => {
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    
    let pdfContent = `
Transaction Report
Generated on: ${new Date().toLocaleDateString()}
Total Transactions: ${transactions.length}
Total Income: ₹${income.toLocaleString()}
Total Expense: ₹${expense.toLocaleString()}
Net Balance: ₹${total.toLocaleString()}

Transactions:
`;
    
    transactions.forEach((tx, index) => {
      pdfContent += `
${index + 1}. ${tx.description}
   Date: ${tx.date.toLocaleDateString()}
   Category: ${tx.categoryName}
   Type: ${tx.type}
   Amount: ₹${tx.amount.toLocaleString()}
`;
    });
    
    return pdfContent;
  };

  const downloadFile = async (content: string, filename: string, mimeType: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Download ${filename}`,
        });
      } else {
        Alert.alert('Sharing not available', 'File saved to device storage');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleDownloadCSV = async () => {
    const csvContent = generateCSV(filtered);
    await downloadFile(csvContent, 'transactions.csv', 'text/csv');
    // No notification for download - only low balance alerts
    setShowDownload(false);
  };

  const handleDownloadPDF = async () => {
    const pdfContent = generatePDF(filtered);
    await downloadFile(pdfContent, 'transactions.txt', 'text/plain'); // Using .txt for now since we don't have PDF generation
    // No notification for download - only low balance alerts
    setShowDownload(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }} edges={['top','left','right']}>
      <View style={{flex: 1, backgroundColor: '#F8F9FB'}}>
        <View style={styles.headerRow}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 4 }}>Transactions</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>View and manage your transactions</Text>
          </View>
          <View style={styles.bellCircle}>
            <TouchableOpacity onPress={() => router.push('/components/notifications')}>
              <Ionicons name="notifications-outline" size={25} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color="#B0B0B0" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSort(true)}>
            <Ionicons name="swap-vertical" size={18} color="#888" />
            <Text style={styles.actionBtnText}>Sort</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="filter" size={18} color="#888" />
            <Text style={styles.actionBtnText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowDownload(true)}>
            <Ionicons name="download-outline" size={18} color="#888" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4caf50" />
            <Text style={{ marginTop: 16, color: '#666' }}>Loading transactions...</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            <FlatList
              data={filtered}
              keyExtractor={item => item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.txRow} onPress={() => router.push({ pathname: '/components/transaction-details', params: { transaction: JSON.stringify(item) } })}>
                  <View style={[styles.txIcon, { backgroundColor: (item.categoryColor || '#666') + '20' }]}>
                    {getIconComponent(item.categoryIcon || 'category', item.categoryColor || '#666', 20)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txLabel}>{item.description}</Text>
                    <Text style={styles.txDate}>{formatDateShort(item.date)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: item.type === 'income' ? '#4CAF50' : '#FF5252' }]}>
                    {item.type === 'income' ? '+' : '-'}₹ {item.amount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateIcon}>
                    <FontAwesome5 name="receipt" size={50} color="#4caf50" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No Transactions Found</Text>
                  <Text style={styles.emptyStateMessage}>
                    {search || filterType || filterCategory 
                      ? 'Try adjusting your search or filters' 
                      : 'Start tracking your finances by adding your first transaction'
                    }
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
              contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 60 }}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
            {/* Fixed Total Row at Bottom */}
            <View style={styles.fixedTotalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹ {total}</Text>
            </View>
          </View>
        )}
        {/* Sort Modal */}
        <Modal visible={showSort} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSort(false)}>
            <View style={styles.modalCard}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.value} style={styles.modalOption} onPress={() => { setSort(opt.value); setShowSort(false); }}>
                  <Text style={[styles.modalOptionText, sort === opt.value && { color: '#2979FF', fontWeight: 'bold' }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Filter Modal */}
        <Modal visible={showFilter} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilter(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalSectionTitle}>Type</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                {TYPES.map(type => (
                  <TouchableOpacity key={type} style={[styles.filterChip, filterType === type && styles.filterChipActive]} onPress={() => setFilterType(filterType === type ? null : type)}>
                    <Text style={[styles.filterChipText, filterType === type && styles.filterChipTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.modalSectionTitle}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]} onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}>
                    <Text style={[styles.filterChipText, filterCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.clearBtn} onPress={() => { setFilterType(null); setFilterCategory(null); setShowFilter(false); }}>
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        {/* Download Modal */}
        <Modal visible={showDownload} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowDownload(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalSectionTitle}>Download Options</Text>
              <Text style={styles.downloadSubtitle}>
                Download {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} 
                {filterType && ` (${filterType})`}
                {filterCategory && ` (${filterCategory})`}
              </Text>
              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadCSV}>
                <Ionicons name="document-text-outline" size={20} color="#4caf50" />
                <Text style={styles.downloadBtnText}>Download as CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadPDF}>
                <Ionicons name="document-outline" size={20} color="#4caf50" />
                <Text style={styles.downloadBtnText}>Download as Text</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bellCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 0,
    padding: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  searchInput: { flex: 1, fontSize: 15, color: '#222' },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  actionBtnText: { marginLeft: 6, color: '#222', fontWeight: 'bold', fontSize: 15 },
  listCard: { 
    height:480,
    backgroundColor: '#fff', 
    borderRadius: 16, 
    margin: 20, 
    marginTop: 0, 
    padding: 0, 
    borderWidth: 1, 
    borderColor: '#E0E0E0',
  },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  txIcon: { marginRight: 12, backgroundColor: '#FFF3E0', borderRadius: 8, padding: 8 },
  txLabel: { fontSize: 15, color: '#222', fontWeight: 'bold' },
  txDate: { fontSize: 12, color: '#888', marginTop: 2 },
  txAmount: { fontSize: 15, color: '#222', fontWeight: 'bold', marginLeft: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderTopWidth: 1, borderColor: '#E0E0E0' },
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
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  totalLabel: { fontWeight: 'bold', color: '#222', fontSize: 15 },
  totalAmount: { fontWeight: 'bold', color: '#222', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, width: '85%', maxWidth: 400, padding: 18, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  modalOption: { paddingVertical: 12 },
  modalOptionText: { fontSize: 16, color: '#222' },
  modalSectionTitle: { fontWeight: 'bold', color: '#222', fontSize: 15, marginBottom: 8 },
  filterChip: { backgroundColor: '#F5F5F5', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  filterChipActive: { backgroundColor: '#2979FF' },
  filterChipText: { color: '#222', fontWeight: 'bold' },
  filterChipTextActive: { color: '#fff' },
  clearBtn: { marginTop: 16, alignSelf: 'flex-end' },
  clearBtnText: { color: '#2979FF', fontWeight: 'bold', fontSize: 15 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginTop: 10, gap: 8 },
  downloadBtnText: { color: '#222', fontWeight: 'bold', fontSize: 15 },
  downloadSubtitle: { fontSize: 14, color: '#666', marginBottom: 10 },
  // Empty state styles
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
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#4caf50',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#101828',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 