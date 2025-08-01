import React, { useEffect, useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { categoriesService, Category } from '../services/categoriesService';
import { transactionsService, Transaction, TransactionStats } from '../services/transactionsService';
import { useAuth } from '../context/AuthContext';
import { formatDateShort } from '../utils/dateUtils';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { StatusBar } from 'expo-status-bar';
import { notificationService } from '../services/notificationService';
import Constants from 'expo-constants';

declare global {
  interface Window {
    __sentLowBalanceNotif?: boolean;
  }
}

export default function Home() {
  const { user } = useAuth();
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking...');
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categorySpending, setCategorySpending] = useState<{ [key: string]: number }>({});
  const [userProfile, setUserProfile] = useState<{ fullName?: string; firstName?: string; lastName?: string }>({});

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const fetchData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          fullName: userData.fullName,
          firstName: userData.firstName,
          lastName: userData.lastName
        });
      }
      
      // Fetch categories
      const userCategories = await categoriesService.getUserCategories(user.uid);
      setCategories(userCategories.filter(cat => cat.type === 'expense'));
      
      // Fetch recent transactions
      const userTransactions = await transactionsService.getUserTransactions(user.uid, 5);
      console.log('Home screen - fetched transactions:', userTransactions);
      setTransactions(userTransactions);
      console.log('Home screen - transactions state set to:', userTransactions.length, 'transactions');
      
      // Fetch stats
      const userStats = await transactionsService.getTransactionStats(user.uid);
      setStats(userStats);
      // Notify if balance is very low (<=10% of total income)
      if (
        userStats.totalIncome > 0 &&
        userStats.balance > 0 &&
        userStats.balance <= 0.1 * userStats.totalIncome &&
        !window.__sentLowBalanceNotif
      ) {
        await notificationService.sendLowBalanceAlert();
        window.__sentLowBalanceNotif = true;
      }
      
      // Calculate category spending
      const allTransactions = await transactionsService.getUserTransactions(user.uid, 1000);
      const spendingByCategory: { [key: string]: number } = {};
      
      allTransactions.forEach(tx => {
        if (tx.type === 'expense' && tx.categoryId) {
          spendingByCategory[tx.categoryId] = (spendingByCategory[tx.categoryId] || 0) + tx.amount;
        }
      });
      
      setCategorySpending(spendingByCategory);
      
      // No app update notification - only low balance alerts
      
      setFirebaseStatus('Firebase Connected! ✅');
    } catch (error) {
      console.error('Error fetching data:', error);
      setFirebaseStatus('Firebase Error! ❌');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Determine avatar seed and gender
  const nameSeed = userProfile.firstName || user?.displayName || user?.email || 'user';
  // Alternate gender based on hash of seed for demo
  const isMale = nameSeed.charCodeAt(0) % 2 === 0;
  const avatarUrl = isMale
    ? `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(nameSeed)}&gender=male`
    : `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(nameSeed)}&gender=female`;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>
                {userProfile.fullName || userProfile.firstName || user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Text>
            </View>
          </View>
          <View style={styles.bellCircle}>
            <TouchableOpacity onPress={() => router.push('/components/notifications')}>
              <Ionicons name="notifications-outline" size={25} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>₹ {stats.balance.toLocaleString()}</Text>
          <Text style={styles.balanceSub}>Balance</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.balanceRow}>
            <View style={styles.balanceCol}>
              <Text style={styles.balanceMiniLabel}>Income</Text>
              <Text style={styles.balanceMiniValue}>₹ {stats.totalIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceCol}>
              <Text style={styles.balanceMiniLabel}>Expenditure</Text>
              <Text style={styles.balanceMiniValue}>₹ {stats.totalExpense.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceCol}>
              <Text style={styles.balanceMiniLabel}>Transactions</Text>
              <Text style={styles.balanceMiniValue}>{stats.transactionCount}</Text>
            </View>
          </View>
        </View>

        {/* Spending by Category */}
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {categories.length > 0 ? (
          <View style={styles.categoryGrid}>
            {categories.map((cat, idx) => (
              <View key={cat.id} style={[styles.categoryCard, { backgroundColor: "white", borderColor: '#D9D9D9', borderWidth: 0.2 }]}> 
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  {getIconComponent(cat.icon, cat.color)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryLabel}>{cat.name}</Text>
                  <Text style={styles.categoryAmount}>₹ {categorySpending[cat.id || '']?.toLocaleString() || '0'}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <FontAwesome5 name="chart-pie" size={40} color="#4caf50" />
            </View>
            <Text style={styles.emptyStateTitle}>No Spending Data</Text>
            <Text style={styles.emptyStateMessage}>
              Start adding transactions to see your spending breakdown by category
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton} 
              onPress={() => router.push('/(tabs)/add')}
            >
              <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionsCard}>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <React.Fragment key={tx.id}>
                <View style={styles.transactionRow}>
                  <View style={[styles.transactionIcon, { backgroundColor: (tx.categoryColor || '#666') + '20' }]}>
                    {getIconComponent(tx.categoryIcon || 'category', tx.categoryColor || '#666', 20)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transactionLabel}>{tx.description}</Text>
                                            <Text style={styles.transactionSubtitle}>{tx.categoryName} · {formatDateShort(tx.date)}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: tx.type === 'income' ? '#4CAF50' : '#FF5252' }]}>
                    {tx.type === 'income' ? '+' : '-'}₹ {tx.amount.toLocaleString()}
                  </Text>
                </View>
                {idx !== transactions.length - 1 && (
                  <View style={styles.transactionDivider} />
                )}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <FontAwesome5 name="receipt" size={40} color="#4caf50" />
              </View>
              <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyStateMessage}>
                Start tracking your finances by adding your first transaction
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton} 
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  scrollContent: {
    backgroundColor: '#F8F9FB',
    padding: 20,
    paddingBottom: 100, // Increased padding to account for tab bar
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 0,
    
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  greeting: {
    color: '#B0B0B0',
    fontSize: 13,
    fontWeight: '500',
  },
  name: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
  balanceCard: {
    backgroundColor: '#23242A',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceSub: {
    color: '#B0B0B0',
    fontSize: 15,
    marginBottom: 18,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#44454B',
    borderRadius: 3,
    marginBottom: 18,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '50%',
    height: 6,
    backgroundColor: '#FF9900',
    borderRadius: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  balanceCol: {
    alignItems: 'center',
  },
  balanceMiniLabel: {
    color: '#B0B0B0',
    fontSize: 13,
    marginBottom: 2,
  },
  balanceMiniValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 12,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  categoryCard: {
    width: '47%',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 14,
  },
  categoryIcon: {
    marginRight: 12,
   backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  categoryAmount: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  transactionsCard: {
    backgroundColor: 'white',
    borderColor:'#D9D9D9',
    borderWidth:1,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical:20,
  },
  transactionIcon: {
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
  },
  transactionLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  transactionSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  transactionAmount: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  transactionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 44,
    marginRight: 0,
    marginBottom: 2,
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    marginBottom: 28,
  },
  emptyStateIcon: {
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#101828',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyStateButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 