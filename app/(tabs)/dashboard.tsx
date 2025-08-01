import React, { useState, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { Svg, G, Circle } from 'react-native-svg';
import { categoriesService, Category as FirebaseCategory } from '../services/categoriesService';
import { transactionsService, Transaction, TransactionStats } from '../services/transactionsService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
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
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'Weekly':
          const dayOfWeek = now.getDay();
          const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
          break;
        case 'Monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Fetch transactions for the selected period
      const transactions = await transactionsService.getTransactionsByDateRange(user.uid, startDate, now);
      
      // Calculate stats
      const incomeTransactions = transactions.filter((t: Transaction) => t.type === 'income');
      const expenseTransactions = transactions.filter((t: Transaction) => t.type === 'expense');
      
      const totalIncome = incomeTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const totalExpense = expenseTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      
      setStats({
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      });

      // Get categories for spending breakdown
      const firebaseCategories = await categoriesService.getUserCategories(user.uid);
      
      // Calculate spending by category
      const categorySpending: { [key: string]: number } = {};
      expenseTransactions.forEach((transaction: Transaction) => {
        const category = firebaseCategories.find((c: FirebaseCategory) => c.id === transaction.categoryId);
        if (category) {
          categorySpending[category.name] = (categorySpending[category.name] || 0) + transaction.amount;
        }
      });

      // Convert to chart data
      const chartData: Category[] = Object.entries(categorySpending).map(([name, amount]) => {
        const category = firebaseCategories.find((c: FirebaseCategory) => c.name === name);
        return {
          label: name,
          value: amount,
          color: category?.color || '#4CAF50',
          icon: getIconComponent(category?.icon || 'category', category?.color || '#4CAF50')
        };
      });

      setCategories(chartData);

      // Calculate top spending categories
      const topCategories = Object.entries(categorySpending)
        .map(([name, amount]) => {
          const category = firebaseCategories.find((c: FirebaseCategory) => c.name === name);
          const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          return {
            label: name,
            value: amount,
            percent: Math.round(percent),
            color: category?.color || '#4CAF50',
            icon: getIconComponent(category?.icon || 'category', category?.color || '#4CAF50')
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setTopSpending(topCategories);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.uid, period]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getIconComponent = (iconName: string, color: string, size: number = 24) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'food': <MaterialIcons name="restaurant" size={size} color={color} />,
      'transport': <MaterialIcons name="directions-car" size={size} color={color} />,
      'shopping': <MaterialIcons name="shopping-bag" size={size} color={color} />,
      'entertainment': <MaterialIcons name="movie" size={size} color={color} />,
      'health': <MaterialIcons name="local-hospital" size={size} color={color} />,
      'education': <MaterialIcons name="school" size={size} color={color} />,
      'bills': <MaterialIcons name="receipt" size={size} color={color} />,
      'salary': <MaterialIcons name="account-balance-wallet" size={size} color={color} />,
      'freelance': <MaterialIcons name="work" size={size} color={color} />,
      'investment': <MaterialIcons name="trending-up" size={size} color={color} />,
      'gift': <MaterialIcons name="card-giftcard" size={size} color={color} />,
      'other': <MaterialIcons name="more-horiz" size={size} color={color} />
    };
    return iconMap[iconName] || <MaterialIcons name="category" size={size} color={color} />;
  };

  const handlePeriodChange = (selectedPeriod: string): void => {
    setPeriod(selectedPeriod);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 100,
      backgroundColor: theme.surface,
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
    dashboardCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dashboardIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    dashboardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    dashboardSubtitle: {
      fontSize: 13,
      color: theme.primary,
      marginBottom: 2,
    },
    dashboardDesc: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
    },
    periodRow: {
      flexDirection: 'row',
      marginBottom: 24,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    periodBtn: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    periodBtnActive: {
      backgroundColor: theme.primary,
    },
    periodBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    periodBtnTextActive: {
      color: theme.textInverse,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
    },
    spendingCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    donutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    donutCenter: {
      flex: 1,
      alignItems: 'center',
    },
    donutAmount: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    donutLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    donutPeriod: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    legendGrid: {
      marginTop: 16,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    legendLabel: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
    },
    legendValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    topCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.border,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    topLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    topNum: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    topNumText: {
      fontWeight: 'bold',
      color: theme.textSecondary,
    },
    topIcon: {
      marginRight: 10,
    },
    topLabel: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.text,
    },
    topSub: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    topRight: {
      alignItems: 'flex-end',
      minWidth: 70,
    },
    topValue: {
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.text,
    },
    topPercent: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    topBarBg: {
      width: 60,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.border,
      marginTop: 2,
      overflow: 'hidden',
    },
    topBarFill: {
      height: 6,
      borderRadius: 3,
    },
    summaryCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.border,
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
      color: theme.textSecondary,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    summaryDivider: {
      width: 1,
      height: '80%',
      backgroundColor: theme.border,
    },
    emptyStateContainer: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyStateIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.primary,
      borderStyle: 'dashed',
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyStateMessage: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    emptyStateButtonText: {
      color: theme.textInverse,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading your data...</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
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
              <TouchableOpacity onPress={() => router.push('/components/notifications')}>
                <Ionicons name="notifications-outline" size={25} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Dashboard Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.dashboardIconWrap}>
            <FontAwesome5 name="chart-line" size={24} color={theme.primary} />
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
              <Text style={[styles.summaryValue, { color: theme.success }]}>₹{stats.totalIncome.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={[styles.summaryValue, { color: theme.error }]}>₹{stats.totalExpense.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={[styles.summaryValue, { color: stats.balance >= 0 ? theme.primary : theme.error }]}>
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
              <FontAwesome5 name="chart-pie" size={40} color={theme.primary} />
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
                  <View style={[styles.topBarBg, { backgroundColor: theme.border }]}> 
                    <View style={[styles.topBarFill, { backgroundColor: cat.color, width: `${cat.percent}%` }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <FontAwesome5 name="trophy" size={40} color={theme.primary} />
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