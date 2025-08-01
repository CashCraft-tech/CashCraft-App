import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <MaterialIcons name="clear-all" size={22} color="#888" />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>Loading...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <NoNotificationsIcon size={80} color="#B0B0B0" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMsg}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />
          }
          renderItem={({ item }) => (
            <View style={styles.notification}>
              <Ionicons 
                name={item.icon || 'notifications-outline'} 
                size={28} 
                color="#4caf50" 
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: { fontSize: 22, fontWeight: '600', color: '#222' },
  clearBtn: { flexDirection: 'row', alignItems: 'center' },
  clearText: { color: '#888', marginLeft: 4, fontSize: 14 },
  listContent: { padding: 16 },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  notificationIcon: { marginRight: 14 },
  title: { fontWeight: '500', fontSize: 16, color: '#222' },
  body: { fontSize: 13, color: '#555', marginTop: 2 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#888', marginBottom: 4 },
  emptyMsg: { fontSize: 14, color: '#AAA' },
});

export default NotificationScreen; 