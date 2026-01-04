import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../src/ui/theme';
import { DisplayLarge, BodyMedium } from '../src/ui/Typography';
import { useSessionStore } from '../src/state/useSessionStore';
import { generateDeviceHash } from '../src/utils/deviceHash';
import { supabase } from '../src/services/supabase';

const SplashScreen = () => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const [isChecking, setIsChecking] = useState(true);

  const setDeviceHash = useSessionStore((s) => s.setDeviceHash);
  const hasCompletedOnboarding = useSessionStore((s) => s.hasCompletedOnboarding);

  const navigateToNext = async () => {
    try {
      // Check onboarding status first
      if (!hasCompletedOnboarding) {
        // User hasn't seen onboarding -> go to onboarding
        router.replace('/onboarding');
        return;
      }

      // Check if user is authenticated
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('Session check:', session?.user?.email || 'no session', error?.message || '');
      
      if (session?.user) {
        // User is logged in -> go to home
        router.replace('/(tabs)/home');
      } else {
        // User not logged in -> go to auth
        router.replace('/auth');
      }
    } catch (e) {
      console.error('Navigation error:', e);
      router.replace('/auth');
    }
  };

  useEffect(() => {
    // Initialize device hash
    const init = async () => {
      try {
        const hash = await generateDeviceHash();
        setDeviceHash(hash);
      } catch (e) {
        console.log('Device hash error:', e);
      }
    };
    init();

    // Animate splash
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withTiming(1, { duration: 600 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));

    // Navigate after delay (0.8-1.5s as per docs)
    const splashDuration = 1200; // 1.2s
    const timeout = setTimeout(() => {
      setIsChecking(false);
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(navigateToNext)();
      });
    }, splashDuration);

    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={require('../full3dicons/images/t-shirt.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <DisplayLarge style={styles.title}>FIT-SWAP</DisplayLarge>
        <BodyMedium color="secondary" style={styles.subtitle}>
          Kıyafetleri üzerinde dene
        </BodyMedium>
      </Animated.View>

      <Animated.View style={[styles.footer, textStyle]}>
        <BodyMedium color="tertiary">AI destekli sanal deneme</BodyMedium>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    color: Colors.accent.primary,
  },
  subtitle: {
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
});

export default SplashScreen;
