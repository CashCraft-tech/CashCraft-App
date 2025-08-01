import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import NoNotificationsIcon from './NoNotificationsIcon';

interface Notification {
  id: string;
  title: string;
  body: string;
  icon?: any; // Use any for flexibility with icon names
  timestamp: any;
  userId: string;
}

const NotificationScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notifs = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Notification[];
      setNotifications(notifs);
      console.log('Fetched notifications:', notifs.length);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    const loadNotifications = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };
    loadNotifications();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleClearAll = async () => {
    try {
      // Remove all notifications for this user
      await Promise.all(
        notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)))
      );
      setNotifications([]);
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    header: { fontSize: 22, fontWeight: '600', color: theme.text },
    clearBtn: { flexDirection: 'row', alignItems: 'center' },
    clearText: { color: theme.textSecondary, marginLeft: 4, fontSize: 14 },
    listContent: { padding: 16 },
    notification: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.border,
    },
    notificationIcon: { marginRight: 14 },
    title: { fontWeight: '500', fontSize: 16, color: theme.text },
    body: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.textSecondary, marginBottom: 4 },
    emptyMsg: { fontSize: 14, color: theme.textTertiary },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={theme.statusBarStyle} />
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <MaterialIcons name="clear-all" size={22} color={theme.textSecondary} />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary }}>Loading...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <NoNotificationsIcon size={80} color={theme.textTertiary} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMsg}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
          renderItem={({ item }) => (
            <View style={styles.notification}>
              <Ionicons 
                name={item.icon || 'notifications-outline'} 
                size={28} 
                color={theme.primary} 
                style={styles.notificationIcon} 
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};



export default NotificationScreen; 