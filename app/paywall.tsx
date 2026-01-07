import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineMedium,
  BodyMedium,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { IconButton } from '../src/ui/IconButton';
import { useRevenueCat } from '../src/hooks/useRevenueCat';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

type Plan = 'monthly' | 'yearly' | 'lifetime';

const PaywallScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [showClose, setShowClose] = useState(false);
  const videoRef = useRef<Video>(null);
  
  const {
    isLoading,
    offerings,
    purchase,
    restore,
    getPackage,
    refreshOfferings,
  } = useRevenueCat();

  // Show close button after 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowClose(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Refresh offerings on mount
  useEffect(() => {
    refreshOfferings();
  }, [refreshOfferings]);

  // Play video on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playAsync();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, []);

  const closeOpacity = useSharedValue(0);

  useEffect(() => {
    if (showClose) {
      closeOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [showClose]);

  const closeStyle = useAnimatedStyle(() => ({
    opacity: closeOpacity.value,
  }));

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubscribe = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const packageToPurchase = getPackage(selectedPlan);
      
      if (!packageToPurchase) {
        Alert.alert('Hata', 'Seçilen plan bulunamadı. Lütfen daha sonra tekrar deneyin.');
        return;
      }
      
      await purchase(packageToPurchase);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      console.error('Purchase error:', error);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await restore();
    } catch (error: any) {
      console.error('Restore error:', error);
    }
  };

  const getPackagePrice = (plan: Plan): { main: string; suffix?: string } => {
    const packageToCheck = getPackage(plan);
    let priceString = '';
    
    if (packageToCheck?.product?.priceString) {
      priceString = packageToCheck.product.priceString;
    } else {
      switch (plan) {
        case 'monthly':
          priceString = '₺49.99/ay';
          break;
        case 'yearly':
          priceString = '₺299.99/yıl';
          break;
        case 'lifetime':
          priceString = '₺999.99';
          break;
      }
    }

    // Split price and suffix
    const parts = priceString.split('/');
    return {
      main: parts[0],
      suffix: parts[1] || undefined,
    };
  };

  const isPackageAvailable = (plan: Plan): boolean => {
    return getPackage(plan) !== null;
  };

  // Calculate discount percentage
  const getDiscountPercentage = (): number => {
    return 19; // Default discount for yearly
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Video */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={require('../assets/videos/0106 (1).mp4')}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay
        />
        
        {/* Vignette Effect - Dark edges, especially bottom */}
        <View style={styles.vignetteOverlay} pointerEvents="none">
          {/* Bottom gradient - stronger for button visibility */}
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)']}
            style={[styles.vignetteGradient, styles.vignetteBottom]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          {/* Top gradient - subtle */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'transparent']}
            style={[styles.vignetteGradient, styles.vignetteTop]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          {/* Left edge */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.3)']}
            style={[styles.vignetteGradient, styles.vignetteLeft]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
          {/* Right edge */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.3)']}
            style={[styles.vignetteGradient, styles.vignetteRight]}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 0, y: 0.5 }}
          />
        </View>
      </Animated.View>

      {/* Logo - Centered */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>

      {/* Close button */}
      {showClose && (
        <Animated.View style={[styles.closeButton, { top: insets.top + 16 }, closeStyle]}>
          <IconButton
            icon={require('../full3dicons/images/home.png')}
            onPress={handleClose}
            accessibilityLabel="Kapat"
            variant="glass"
            size="sm"
          />
        </Animated.View>
      )}

      {/* Bottom Section - Continue Button */}
      <Animated.View 
        entering={FadeInDown.delay(500).springify()}
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
        <PrimaryButton
          title="Devam Et"
          onPress={handleSubscribe}
          loading={isLoading}
          disabled={!isPackageAvailable(selectedPlan)}
          style={styles.continueButton}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  vignetteGradient: {
    position: 'absolute',
  },
  vignetteBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  vignetteTop: {
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  vignetteLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    width: '15%',
  },
  vignetteRight: {
    right: 0,
    top: 0,
    bottom: 0,
    width: '15%',
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -60 }], // Center logo vertically
    zIndex: 5,
  },
  logo: {
    width: 120,
    height: 120,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.page,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.page,
    zIndex: 10,
  },
  continueButton: {
    width: '100%',
  },
});

export default PaywallScreen;
