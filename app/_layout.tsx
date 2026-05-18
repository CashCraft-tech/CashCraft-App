import 'react-native-gesture-handler';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
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
    const isDeleteAccount = segments.join('/') === 'auth/delete-account';

    if (user) {
      // Allow logged-in users to access delete-account, but redirect from other auth screens
      if (inAuthGroup && !isDeleteAccount) {
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
          <CurrencyProvider>
            <RootLayoutContent />
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
