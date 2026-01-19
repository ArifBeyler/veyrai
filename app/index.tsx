import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../src/ui/theme';
import { DisplayLarge, BodyMedium } from '../src/ui/Typography';
import { useSessionStore } from '../src/state/useSessionStore';
import { useTranslation } from '../src/hooks/useTranslation';
import { generateDeviceHash } from '../src/utils/deviceHash';
import { getOrCreateDeviceUserId } from '../src/utils/deviceUserId';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const { t } = useTranslation();
  
  // Animation values
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-10);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const backgroundOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  const setDeviceHash = useSessionStore((s) => s.setDeviceHash);
  const hasCompletedOnboarding = useSessionStore((s) => s.hasCompletedOnboarding);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const hasNavigatedRef = useRef(false);

  const navigateToNext = async () => {
    // Prevent multiple navigations
    if (hasNavigatedRef.current) {
      return;
    }

    try {
      // Wait for both store hydration AND animation to complete
      if (!isStoreHydrated || !animationComplete) {
        return;
      }

      hasNavigatedRef.current = true;

      // Check onboarding completion flag from persisted storage
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
        return;
      }

      // No auth check - go directly to home
      router.replace('/(tabs)/home');
    } catch (e) {
      console.error('Navigation error:', e);
      router.replace('/(tabs)/home');
    }
  };

  // Initialize store hydration check
  useEffect(() => {
    // Wait for Zustand store to hydrate from AsyncStorage
    const checkStoreHydration = async () => {
      try {
        // Zustand persist automatically hydrates, but we need to wait a bit
        // Check AsyncStorage directly to ensure it's loaded
        await AsyncStorage.getItem('wearify-session');
        // Small delay to ensure Zustand has finished hydrating
        await new Promise(resolve => setTimeout(resolve, 150));
        setIsStoreHydrated(true);
      } catch (e) {
        console.log('Store hydration check error:', e);
        // If error, proceed anyway after a short delay
        setTimeout(() => setIsStoreHydrated(true), 200);
      }
    };
    
    checkStoreHydration();
  }, []);

  // Initialize device and run animations
  useEffect(() => {
    // Initialize device hash and device user ID
    const init = async () => {
      try {
        // Initialize device hash (for backward compatibility)
        const hash = await generateDeviceHash();
        setDeviceHash(hash);
        
        // Initialize device user ID (for anonymous mode)
        await getOrCreateDeviceUserId();
      } catch (e) {
        console.log('Device initialization error:', e);
      }
    };
    
    init();

    // === ANIMATION SEQUENCE ===
    
    // 1. Background fade in
    backgroundOpacity.value = withTiming(1, { duration: 400 });
    
    // 2. Glow effect
    glowOpacity.value = withDelay(200, withTiming(0.6, { duration: 600 }));
    glowScale.value = withDelay(200, withTiming(1.2, { duration: 800, easing: Easing.out(Easing.cubic) }));
    
    // 3. Logo entrance - bounce effect
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
    logoRotate.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 80 }));
    
    // 4. Ring pulse effect
    ringOpacity.value = withDelay(600, withTiming(0.5, { duration: 300 }));
    ringScale.value = withDelay(600, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(1.3, { duration: 600 }),
    ));
    ringOpacity.value = withDelay(1000, withTiming(0, { duration: 400 }));
    
    // 5. Text fade in
    textOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(800, withSpring(0, { damping: 15, stiffness: 100 }));

    // Navigate after animation completes (minimum 2 seconds)
    const timeout = setTimeout(() => {
      // Fade out everything
      logoOpacity.value = withTiming(0, { duration: 300 });
      textOpacity.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
      backgroundOpacity.value = withTiming(0, { duration: 400 }, () => {
        runOnJS(setAnimationComplete)(true);
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Navigate when both conditions are met
  useEffect(() => {
    if (isStoreHydrated && animationComplete) {
      navigateToNext();
    }
  }, [isStoreHydrated, animationComplete]);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={['#0B0B0C', '#151520', '#0B0B0C']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Glow Effect */}
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <LinearGradient
          colors={['transparent', Colors.accent.primary + '30', 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Logo Container */}
      <View style={styles.centerContainer}>
        {/* Ring Effect */}
        <Animated.View style={[styles.ring, ringStyle]} />
        
        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <DisplayLarge style={styles.title}>Wearify</DisplayLarge>
        <BodyMedium color="secondary" style={styles.subtitle}>
          {t('splash.subtitle')}
        </BodyMedium>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, textStyle]}>
        <BodyMedium color="tertiary">{t('splash.footer')}</BodyMedium>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 36, // DisplayLarge variant override for splash screen
    letterSpacing: 2,
    // DisplayLarge already has fontWeight 700
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
