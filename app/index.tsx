import React, { useEffect, useState } from 'react';
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
import { supabase } from '../src/services/supabase';

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

  const navigateToNext = async () => {
    try {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        router.replace('/(tabs)/home');
      } else {
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

    // Navigate after animation completes
    const timeout = setTimeout(() => {
      // Fade out everything
      logoOpacity.value = withTiming(0, { duration: 300 });
      textOpacity.value = withTiming(0, { duration: 300 });
      glowOpacity.value = withTiming(0, { duration: 300 });
      backgroundOpacity.value = withTiming(0, { duration: 400 }, () => {
        runOnJS(navigateToNext)();
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

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
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
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
