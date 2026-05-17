import 'react-native-gesture-handler';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import NavigationBarManager from './components/NavigationBarManager';
import { AppLoadingSkeleton } from './components/skeleton';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (loading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === 'auth';

    if (user) {
      if (inAuthGroup) {
        router.replace('/');
      }
    } else if (!inAuthGroup) {
      router.replace('/auth/login');
    }
  }, [user, segments, loading, navigationState?.key, router]);

  if (loading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <>
      <NavigationBarManager />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

function RootLayoutContent() {
  const { loading } = useAuth();

  useEffect(() => {
    const hideSplash = async () => {
      if (!loading) {
        await SplashScreen.hideAsync();
      }
    };

    const fallbackTimeout = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 3000);

    hideSplash();

    return () => clearTimeout(fallbackTimeout);
  }, [loading]);

  return <RootLayoutNav />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
