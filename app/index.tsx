import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { AppLoadingSkeleton } from "./components/skeleton";
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

  if (loading || (user && permissionsShown === null)) {
    return <AppLoadingSkeleton />;
  }

  if (user) {
    // If user is logged in but permissions haven't been shown for this user, show permissions screen
    if (!permissionsShown) {
      return <Redirect href="/permissions" />;
    }

    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}
