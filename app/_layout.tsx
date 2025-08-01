import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './context/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { loading } = useAuth();

  useEffect(() => {
    // Hide the splash screen after authentication is complete
    const hideSplash = async () => {
      if (!loading) {
        await SplashScreen.hideAsync();
      }
    };

    // Fallback: hide splash screen after 3 seconds maximum
    const fallbackTimeout = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 3000);

    hideSplash();

    return () => clearTimeout(fallbackTimeout);
  }, [loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
} 