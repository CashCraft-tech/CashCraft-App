import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, loading } = useAuth();
  const [permissionsShown, setPermissionsShown] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkPermissionsShown();
    } else {
      setPermissionsShown(null);
    }
  }, [user]);

  const checkPermissionsShown = async () => {
    try {
      // Create a unique key for this user and device combination
      const permissionsKey = `permissionsShown_${user?.uid || 'anonymous'}`;
      const shown = await AsyncStorage.getItem(permissionsKey);
      setPermissionsShown(shown === 'true');
    } catch (error) {
      console.error('Error checking permissions shown:', error);
      setPermissionsShown(false);
    }
  };

  console.log('Index page - user:', user ? user.email : 'null', 'loading:', loading, 'permissionsShown:', permissionsShown);

  if (loading || (user && permissionsShown === null)) {
    console.log('Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (user) {
    // If user is logged in but permissions haven't been shown for this user, show permissions screen
    if (!permissionsShown) {
      console.log('User is logged in but permissions not shown, redirecting to permissions');
      return <Redirect href="/permissions" />;
    }
    
    console.log('User is logged in and permissions shown, redirecting to home');
    return <Redirect href="/(tabs)/home" />;
  } else {
    console.log('No user, redirecting to login');
    return <Redirect href="/auth/login" />;
  }
}
