import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../src/ui/theme';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import { useSessionStore } from '../src/state/useSessionStore';
import { useRevenueCat } from '../src/hooks/useRevenueCat';
import { I18nProvider } from '../src/providers/I18nProvider';
import { ThemeProvider } from '../src/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Get sample garments loader from store
  const loadSampleGarments = useSessionStore((state) => state.loadSampleGarments);
  const sampleGarmentsLoaded = useSessionStore((state) => state.sampleGarmentsLoaded);

  // Initialize push notifications
  usePushNotifications();
  
  // Initialize RevenueCat
  useRevenueCat();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Load sample garments on first launch
  useEffect(() => {
    if (!sampleGarmentsLoaded) {
      loadSampleGarments().catch((error) => {
        console.error('Error loading sample garments:', error);
      });
    }
  }, [sampleGarmentsLoaded, loadSampleGarments]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <I18nProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <View style={styles.container}>
              <StatusBar style="light" />
              <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.dark.background },
                animation: 'fade',
              }}
            >
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            {/* Auth screen removed - app runs in anonymous mode */}
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="create"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="generation"
              options={{
                presentation: 'fullScreenModal',
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="paywall"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="add-garment"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="select-profile"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="profile-details"
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="photo-guide"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="support"
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="privacy"
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="buy-tokens"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
            </Stack>
          </View>
        </QueryClientProvider>
        </ThemeProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});

export default RootLayout;
