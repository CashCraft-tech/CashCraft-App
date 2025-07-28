import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { Svg, G, Circle } from 'react-native-svg';
import { categoriesService, Category as FirebaseCategory } from '../services/categoriesService';
import { transactionsService, Transaction, TransactionStats } from '../services/transactionsService';
import { useAuth } from '../context/AuthContext';

// TypeScript Interfaces
interface Category {
  label: string;
  color: string;
  value: number;
  icon: React.ReactNode;
}

interface TopSpendingCategory {
  label: string;
  value: number;
  percent: number;
  color: string;
  icon: React.ReactNode;
}

interface DonutChartProps {
  data: Category[];
  total: number;
}

interface PeriodOption {
  value: string;
  label: string;
}

const periodOptions: PeriodOption[] = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' }
];

function DonutChart({ data, total }: DonutChartProps) {
  const size = 140;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  
  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2},${size / 2}`}> 
        {data.map((cat: Category, idx: number) => {
          const value = cat.value / total;
          const arc = circumference * value;
          const circle = (
            <Circle
              key={cat.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={cat.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc},${circumference - arc}`}
              strokeDashoffset={-offset}
              fill="none"
            />
          );
          offset += arc;
          return circle;
        })}
      </G>
    </Svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>('Monthly');
  const [categories, setCategories] = useState<Category[]>([]);
  const [topSpending, setTopSpending] = useState<TopSpendingCategory[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'Daily':
          // Start of today (00:00:00.000)
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          break;
        case 'Weekly':
          // Get start of current week (Monday 00:00:00.000)
          const dayOfWeek = now.getDay();
          const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so convert to Monday = 0
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday, 0, 0, 0, 0);
          break;
        case 'Monthly':
          // Start of current month (00:00:00.000)
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      }
      
      // Set end date to end of current day (23:59:59.999)
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      // Fetch all categories (both income and expense)
      const userCategories = await categoriesService.getUserCategories(user.uid);
      const expenseCategories = userCategories.filter(cat => cat.type === 'expense');
      const incomeCategories = userCategories.filter(cat => cat.type === 'income');
      
      // Get ALL transactions for the selected period (both income and expense)
      const periodTransactions = await transactionsService.getTransactionsByDateRange(user.uid, startDate, endDate);
      
      // Separate income and expense transactions
      const expenseTransactions = periodTransactions.filter(t => t.type === 'expense');
      const incomeTransactions = periodTransactions.filter(t => t.type === 'income');
      
      console.log(`Dashboard ${period}: Found ${periodTransactions.length} total transactions (${incomeTransactions.length} income, ${expenseTransactions.length} expense)`);
      
      // Calculate spending per expense category for the selected period
      const categoriesWithSpending: Category[] = expenseCategories.map(cat => {
        const categoryTransactions = expenseTransactions.filter(
          transaction => transaction.categoryId === cat.id
        );
        const totalSpent = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        return {
          label: cat.name,
          color: cat.color,
          value: totalSpent,
          icon: getIconComponent(cat.icon, cat.color, 20)
        };
      }).filter(cat => cat.value > 0); // Only show categories with spending
      
      setCategories(categoriesWithSpending);
      
      // Calculate top spending categories for the selected period
      const sortedCategories = [...categoriesWithSpending].sort((a, b) => b.value - a.value);
      const maxValue = sortedCategories[0]?.value || 1;
      
      const topSpendingData: TopSpendingCategory[] = sortedCategories.slice(0, 3).map(cat => ({
        label: cat.label,
        value: cat.value,
        percent: Math.round((cat.value / maxValue) * 100),
        color: cat.color,
        icon: cat.icon
      }));
      
      setTopSpending(topSpendingData);
      
      // Calculate stats manually to ensure accuracy
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      
      const userStats: TransactionStats = {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: periodTransactions.length
      };
      
      setStats(userStats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, period]); // Add period as dependency to refetch when period changes

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
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

  const handlePeriodChange = (selectedPeriod: string): void => {
    setPeriod(selectedPeriod);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSpent: number = categories.reduce((sum: number, c: Category) => sum + c.value, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
        
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Financial Overview</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.bellCircle}>
              <Ionicons name="notifications-outline" size={20} color="#B0B0B0" />
             
            </View>
          
          </View>
        </View>

        {/* Dashboard Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.dashboardIconWrap}>
            <FontAwesome5 name="chart-line" size={24} color="#43A047" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <Text style={styles.dashboardSubtitle}>Financial Analytics</Text>
            <Text style={styles.dashboardDesc}>Welcome to your Dashboard — a snapshot of your financial performance for a smarter financial future.</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {periodOptions.map((opt: PeriodOption) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.periodBtn, period === opt.value && styles.periodBtnActive]}
              onPress={() => handlePeriodChange(opt.value)}
            >
              <Text style={[styles.periodBtnText, period === opt.value && styles.periodBtnTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{stats.totalIncome.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>₹{stats.totalExpense.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryValue, { color: stats.balance >= 0 ? '#2196F3' : '#F44336' }]}>
                ₹{stats.balance.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Spending by Category */}
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {categories.length > 0 ? (
          <View style={styles.spendingCard}>
            <View style={styles.donutRow}>
              <DonutChart data={categories} total={totalSpent} />
              <View style={styles.donutCenter}>
                <Text style={styles.donutAmount}>₹{totalSpent.toFixed(0)}</Text>
                <Text style={styles.donutLabel}>Total Spent</Text>
                <Text style={styles.donutPeriod}>{period === 'Daily' ? 'Today' : period === 'Weekly' ? 'This Week' : 'This Month'}</Text>
              </View>
            </View>
            <View style={styles.legendGrid}>
              {categories.map((cat: Category) => (
                <View key={cat.label} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.legendLabel}>{cat.label}</Text>
                  <Text style={styles.legendValue}>₹{cat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <FontAwesome5 name="chart-pie" size={40} color="#4caf50" />
            </View>
            <Text style={styles.emptyStateTitle}>No Spending Data</Text>
            <Text style={styles.emptyStateMessage}>
              Add transactions to see your spending breakdown and analytics
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton} 
              onPress={() => router.push('/(tabs)/add')}
            >
              <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Spending Categories */}
        <Text style={styles.sectionTitle}>Top Spending Categories</Text>
        {topSpending.length > 0 ? (
          <View style={styles.topCard}>
            {topSpending.map((cat: TopSpendingCategory, idx: number) => (
              <View key={cat.label} style={styles.topRow}>
                <View style={styles.topLeft}>
                  <View style={styles.topNum}><Text style={styles.topNumText}>{idx + 1}</Text></View>
                  <View style={styles.topIcon}>{cat.icon}</View>
                  <View>
                    <Text style={styles.topLabel}>{cat.label}</Text>
                    <Text style={styles.topSub}>{period === 'Daily' ? 'Today' : period === 'Weekly' ? 'This week' : 'This month'}</Text>
                  </View>
                </View>
                <View style={styles.topRight}>
                  <Text style={styles.topValue}>₹{cat.value}</Text>
                  <Text style={styles.topPercent}>{cat.percent}%</Text>
                  <View style={[styles.topBarBg, { backgroundColor: '#F0F0F0' }]}> 
                    <View style={[styles.topBarFill, { backgroundColor: cat.color, width: `${cat.percent}%` }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <FontAwesome5 name="trophy" size={40} color="#4caf50" />
            </View>
            <Text style={styles.emptyStateTitle}>No Top Categories</Text>
            <Text style={styles.emptyStateMessage}>
              Add more transactions to see your top spending categories
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton} 
              onPress={() => router.push('/(tabs)/add')}
            >
              <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Increased padding to account for tab bar
    marginTop: 16,
    backgroundColor: '#F8F9FB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  headerBellWrap: {
    marginRight: 8,
    position: 'relative',
  },
  bellCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  dashboardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: '#43A047',
    marginBottom: 2,
  },
  dashboardDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 18,
    padding: 4,
    alignSelf: 'flex-start',
  },
  periodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  periodBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  periodBtnText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
  periodBtnTextActive: {
    color: '#222',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    marginTop: 8,
  },
  spendingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  donutRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  donutCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  donutLabel: {
    fontSize: 13,
    color: '#888',
  },
  donutPeriod: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
  },
  topCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  topNumText: {
    fontWeight: 'bold',
    color: '#888',
  },
  topIcon: {
    marginRight: 10,
  },
  topLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  topSub: {
    fontSize: 12,
    color: '#888',
  },
  topRight: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  topValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  topPercent: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  topBarBg: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
    marginTop: 2,
    overflow: 'hidden',
  },
  topBarFill: {
    height: 6,
    borderRadius: 3,
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
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