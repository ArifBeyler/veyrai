import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  SharedValue,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../src/ui/theme';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppLanguage } from '../src/hooks/useAppLanguage';
import { useSessionStore } from '../src/state/useSessionStore';
import * as PhosphorIcons from 'phosphor-react-native';
import { EditorialText } from '../src/ui/Typography';
import { Typography } from '../src/ui/theme';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

// ============================================
// CONSTANTS & CONFIG
// ============================================

const ANIMATION_CONFIG = {
  // Entry animations
  ENTRY_DURATION: 600,
  ENTRY_DELAY_STEP: 120,
  ENTRY_EASING: Easing.out(Easing.cubic),
  
  // Spring config for soft, premium feel
  SPRING_CONFIG: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },
  
  // Looping animations
  FLOAT_DURATION: 4000,
  PULSE_DURATION: 3000,
  
  // Transitions
  TRANSITION_DURATION: 400,
  PARALLAX_FACTOR: 0.3,
};

const CARD_CONFIG = {
  RADIUS: 28,
  BLUR_INTENSITY: 50,
  SHADOW_Y: 12,
  SHADOW_BLUR: 24,
  SHADOW_OPACITY: 0.25,
};

// Language config
const LANGUAGE_CONFIG: Record<string, { name: string; flag: string; short: string }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷', short: 'TR' },
  en: { name: 'English', flag: '🇬🇧', short: 'EN' },
  fr: { name: 'Français', flag: '🇫🇷', short: 'FR' },
};

// Onboarding data
type OnboardingStep = {
  id: number;
  icon: keyof typeof PhosphorIcons;
  image?: any;
  titleKey: string;
  descriptionKey: string;
  accentColor: string;
  showCarousel?: boolean;
  showMultiCarousel?: boolean;
  showVideo?: boolean;
  showFullscreen?: boolean;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    icon: 'Stack', // layers-outline -> Stack
    titleKey: 'onboarding.step2.title',
    descriptionKey: 'onboarding.step2.description',
    accentColor: '#7DD3FC', // Soft blue
    showCarousel: true,
    showMultiCarousel: true, // Multiple rows with different directions - First screen
  },
  {
    id: 1,
    icon: 'MagicWand', // color-wand-outline -> MagicWand
    titleKey: 'onboarding.step3.title',
    descriptionKey: 'onboarding.step3.description',
    accentColor: Colors.accent.primary,
    showCarousel: false,
    showVideo: true, // Video - Second screen
  },
];

// Background images for parallax
const BG_IMAGES = [
  require('../assets/images/combines/female/female-outfit-4.png'),
  require('../assets/images/combines/female/female-outfit-5.png'),
  require('../assets/images/combines/female/female-outfit-6.png'),
  require('../assets/images/combines/female/female-outfit-7.png'),
  require('../assets/images/combines/female/female-outfit-8.png'),
];

// Carousel images for step 2 - multiple rows - using all available images including new ones
const CAROUSEL_IMAGES_ROW1 = [
  require('../assets/images/combines/female/female-outfit-1.png'),
  require('../assets/images/combines/female/female-outfit-2.jpg'),
  require('../assets/images/combines/female/female-outfit-3.png'),
  require('../assets/images/combines/female/female-outfit-4.png'),
  require('../assets/images/combines/female/female-outfit-5.png'),
  require('../assets/images/combines/female/female-outfit-6.png'),
  require('../assets/images/combines/female/female-outfit-7.png'),
  require('../assets/images/combines/female/female-outfit-8.png'),
  require('../assets/images/combines/female/ed3ff803e77d722d29078ede9f4fcdf9.jpg'),
  require('../assets/images/combines/female/a072d4d0fbc826eaf3a2b3becf28bcb1.jpg'),
  require('../assets/images/combines/female/00e646e68b9f4550586f9b52b5177a3d.jpg'),
  require('../assets/images/combines/female/70f262731db5398076d324601b9a5068.jpg'),
  require('../assets/images/combines/female/4aad39624b4dac3a99b905ba2252919c.jpg'),
  require('../assets/images/combines/female/03046389600-p.jpg'),
  require('../assets/images/combines/female/03046312500-p.jpg'),
  require('../assets/images/combines/female/56869c66f7915f78a8eb1adf57acb321.jpg'),
  require('../assets/images/combines/female/295ccb2641f5cd5e1262c009899cd844.jpg'),
  require('../assets/images/combines/female/04d381e7a12ad1f24eeb1639dd94062f.jpg'),
  require('../assets/images/combines/034785b196991ffea03e05ce7b021910.jpg'),
  require('../assets/images/combines/1b39f84acb05f968dd071e84df4e4c3e.jpg'),
];

const CAROUSEL_IMAGES_ROW2 = [
  require('../assets/images/combines/female/134bab4b62a7d9990770d5c8212458a1.jpg'),
  require('../assets/images/combines/female/27b11e9ad4a5c914d40365b82ec7776e.jpg'),
  require('../assets/images/combines/female/60934af5e9cb442c129d39947dac7aa1.jpg'),
  require('../assets/images/combines/female/6812b7202d76ebb975a23732af8bd399.jpg'),
  require('../assets/images/combines/female/6bdddc3a1081edfcfbe6e6aaea72df2c.jpg'),
  require('../assets/images/combines/a3d4ce444608dc1a28eeb86f9f155f2d.jpg'),
  require('../assets/images/combines/a649bee229a4d788b51327a15530e282.jpg'),
  require('../assets/images/combines/b5b703b25e6713105df0d6a412c89587.jpg'),
  require('../assets/images/combines/outfit-2.jpg'),
  require('../assets/images/combines/female/female-outfit-4.png'),
  require('../assets/images/combines/female/female-outfit-6.png'),
  require('../assets/images/combines/female/female-outfit-8.png'),
  require('../assets/images/combines/female/female-outfit-1.png'),
  require('../assets/images/combines/female/female-outfit-3.png'),
  require('../assets/images/combines/female/female-outfit-5.png'),
  require('../assets/images/combines/female/female-outfit-7.png'),
  require('../assets/images/combines/female/female-outfit-2.jpg'),
];

const CAROUSEL_IMAGES_ROW3 = [
  require('../assets/images/combines/female/female-outfit-2.jpg'),
  require('../assets/images/combines/female/56869c66f7915f78a8eb1adf57acb321.jpg'),
  require('../assets/images/combines/female/295ccb2641f5cd5e1262c009899cd844.jpg'),
  require('../assets/images/combines/female/04d381e7a12ad1f24eeb1639dd94062f.jpg'),
  require('../assets/images/combines/female/134bab4b62a7d9990770d5c8212458a1.jpg'),
  require('../assets/images/combines/female/27b11e9ad4a5c914d40365b82ec7776e.jpg'),
  require('../assets/images/combines/female/60934af5e9cb442c129d39947dac7aa1.jpg'),
  require('../assets/images/combines/female/6812b7202d76ebb975a23732af8bd399.jpg'),
  require('../assets/images/combines/female/6bdddc3a1081edfcfbe6e6aaea72df2c.jpg'),
  require('../assets/images/combines/female/ed3ff803e77d722d29078ede9f4fcdf9.jpg'),
  require('../assets/images/combines/female/a072d4d0fbc826eaf3a2b3becf28bcb1.jpg'),
  require('../assets/images/combines/female/00e646e68b9f4550586f9b52b5177a3d.jpg'),
  require('../assets/images/combines/female/70f262731db5398076d324601b9a5068.jpg'),
  require('../assets/images/combines/female/4aad39624b4dac3a99b905ba2252919c.jpg'),
  require('../assets/images/combines/034785b196991ffea03e05ce7b021910.jpg'),
  require('../assets/images/combines/1b39f84acb05f968dd071e84df4e4c3e.jpg'),
];

// For single carousel (backward compatibility)
const CAROUSEL_IMAGES = CAROUSEL_IMAGES_ROW1;

const CAROUSEL_CARD_WIDTH = 90;
const CAROUSEL_CARD_HEIGHT = 130;
const CAROUSEL_GAP = 12;

// ============================================
// ANIMATED COMPONENTS
// ============================================

// Floating Icon with looping animation
const FloatingIcon = ({ 
  icon, 
  color, 
  size = 64,
  image,
  isActive,
}: { 
  icon: keyof typeof PhosphorIcons; 
  color: string;
  size?: number;
  image?: any;
  isActive: boolean;
}) => {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(0.96);
  
  useEffect(() => {
    if (isActive) {
      // Entry animation
      scale.value = withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG);
      
      // Floating animation
      floatY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: ANIMATION_CONFIG.FLOAT_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: ANIMATION_CONFIG.FLOAT_DURATION / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isActive]);
  
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
  }));
  
  // Logo için özel boyut - yeşil kutu kadar büyük
  const logoSize = image ? 120 : size;
  
  return (
    <Animated.View style={[styles.iconWrapper, containerStyle]}>
      {image ? (
        // Sadece logo, arka plan yok
        <Image
          source={image}
          style={{ width: logoSize, height: logoSize }}
          contentFit="contain"
        />
      ) : (
        // İkon için minimal container - Phosphor Icons
        <View style={styles.iconContainerMinimal}>
          {(() => {
            const IconComponent = PhosphorIcons[icon] as React.ComponentType<{
              size?: number;
              color?: string;
              weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
            }>;
            return IconComponent ? (
              <IconComponent size={size} color={color} weight="regular" />
            ) : null;
          })()}
        </View>
      )}
    </Animated.View>
  );
};

// Animated Text with staggered entry - Canela font for editorial titles
const AnimatedTitle = ({ 
  text, 
  delay,
  isActive,
}: { 
  text: string; 
  delay: number;
  isActive: boolean;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  
  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_CONFIG.ENTRY_DURATION, easing: ANIMATION_CONFIG.ENTRY_EASING }));
      translateY.value = withDelay(delay, withSpring(0, ANIMATION_CONFIG.SPRING_CONFIG));
    } else {
      opacity.value = 0;
      translateY.value = 16;
    }
  }, [isActive]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  
  // Use Canela for editorial titles
  return (
    <Animated.View style={animatedStyle}>
      <EditorialText
        weight="regular"
        size={26}
        lineHeight={34}
        letterSpacing={-1}
        color="primary"
        style={styles.title}
      >
        {text}
      </EditorialText>
    </Animated.View>
  );
};

const AnimatedSubtitle = ({ 
  text, 
  delay,
  isActive,
}: { 
  text: string; 
  delay: number;
  isActive: boolean;
}) => {
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_CONFIG.ENTRY_DURATION, easing: ANIMATION_CONFIG.ENTRY_EASING }));
    } else {
      opacity.value = 0;
    }
  }, [isActive]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  // Use SF Pro Text for subtitle (body text)
  return (
    <Animated.Text style={[styles.subtitle, animatedStyle]}>
      {text}
    </Animated.Text>
  );
};

// Glass Card with entry animation
const GlassCardAnimated = ({ 
  children, 
  isActive,
  delay = 0,
  variant = 'default',
}: { 
  children: React.ReactNode; 
  isActive: boolean;
  delay?: number;
  variant?: 'default' | 'carousel';
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.98);
  
  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_CONFIG.ENTRY_DURATION, easing: ANIMATION_CONFIG.ENTRY_EASING }));
      translateY.value = withDelay(delay, withSpring(0, ANIMATION_CONFIG.SPRING_CONFIG));
      scale.value = withDelay(delay, withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG));
    } else {
      opacity.value = 0;
      translateY.value = 20;
      scale.value = 0.98;
    }
  }, [isActive]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  
  return (
    <Animated.View style={[styles.glassCardWrapper, animatedStyle]}>
      {/* Shadow layer */}
      <View style={styles.glassCardShadow} />
      
      {/* Glass card */}
      <View style={styles.glassCardOuter}>
        <BlurView 
          intensity={CARD_CONFIG.BLUR_INTENSITY} 
          tint="dark" 
          style={variant === 'carousel' ? styles.glassCardBlurCarousel : styles.glassCardBlur}
        >
          {/* Top highlight - only for default variant */}
          {variant === 'default' && (
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
              style={styles.glassCardHighlight}
            />
          )}
          
          {/* Content */}
          <View style={styles.glassCardContent}>
            {children}
          </View>
        </BlurView>
        
        {/* Border */}
        <View style={styles.glassCardBorder} />
      </View>
    </Animated.View>
  );
};

// Outfit Carousel - Auto-scrolling outfits showcase
const OutfitCarousel = ({ 
  isActive,
  direction = 'left',
  images,
}: { 
  isActive: boolean;
  direction?: 'left' | 'right';
  images?: any[];
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  
  const imagesToUse = images || CAROUSEL_IMAGES;
  const ROW_WIDTH = (CAROUSEL_CARD_WIDTH + CAROUSEL_GAP) * imagesToUse.length;
  
  useEffect(() => {
    if (isActive) {
      // Entry animation
      opacity.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
      scale.value = withDelay(300, withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG));
      
      // Start infinite scroll animation
      translateX.value = direction === 'left' ? 0 : -ROW_WIDTH / 2;
      translateX.value = withRepeat(
        withTiming(
          direction === 'left' ? -ROW_WIDTH / 2 : 0,
          { duration: 25000, easing: Easing.linear }
        ),
        -1,
        false
      );
    } else {
      opacity.value = 0;
      scale.value = 0.95;
      cancelAnimation(translateX);
    }
  }, [isActive, direction]);
  
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  // Duplicate images for seamless loop
  const duplicatedImages = [...imagesToUse, ...imagesToUse];
  
  return (
    <Animated.View style={[styles.carouselContainer, containerStyle]}>
      <Animated.View style={[styles.carouselRow, rowStyle]}>
        {duplicatedImages.map((img, index) => (
          <View key={index} style={styles.carouselCard}>
            <Image
              source={img}
              style={styles.carouselImage}
              contentFit="cover"
            />
            {/* Glass overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.carouselCardOverlay}
            />
          </View>
        ))}
      </Animated.View>
      
      {/* Edge fades */}
      <LinearGradient
        colors={['#0B0B0C', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.15, y: 0 }}
        style={styles.carouselFadeLeft}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', '#0B0B0C']}
        start={{ x: 0.85, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.carouselFadeRight}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

// Multi-row carousel with alternating directions
const MultiRowCarousel = ({ 
  isActive,
}: { 
  isActive: boolean;
}) => {
  return (
    <View style={styles.multiCarouselWrapper}>
      {/* Row 1 - Left */}
      <OutfitCarousel 
        isActive={isActive} 
        direction="left" 
        images={CAROUSEL_IMAGES_ROW1}
      />
      
      {/* Row 2 - Right */}
      <OutfitCarousel 
        isActive={isActive} 
        direction="right" 
        images={CAROUSEL_IMAGES_ROW2}
      />
      
      {/* Row 3 - Left */}
      <OutfitCarousel 
        isActive={isActive} 
        direction="left" 
        images={CAROUSEL_IMAGES_ROW3}
      />
    </View>
  );
};

// Parallax Background
const ParallaxBackground = ({ 
  scrollX, 
  stepIndex,
}: { 
  scrollX: SharedValue<number>;
  stepIndex: number;
}) => {
  const imageIndex = stepIndex % BG_IMAGES.length;
  
  const animatedStyle = useAnimatedStyle(() => {
    const parallaxOffset = interpolate(
      scrollX.value,
      [(stepIndex - 1) * width, stepIndex * width, (stepIndex + 1) * width],
      [30, 0, -30]
    );
    
    const opacity = interpolate(
      scrollX.value,
      [(stepIndex - 1) * width, stepIndex * width, (stepIndex + 1) * width],
      [0.3, 0.5, 0.3]
    );
    
    return {
      transform: [{ translateX: parallaxOffset }],
      opacity,
    };
  });
  
  return (
    <Animated.View style={[styles.parallaxContainer, animatedStyle]}>
      <Image
        source={BG_IMAGES[imageIndex]}
        style={styles.parallaxImage}
        contentFit="cover"
        blurRadius={40}
      />
      {/* Dark overlay */}
      <LinearGradient
        colors={['#0B0B0C', 'rgba(11,11,12,0.85)', '#0B0B0C']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

// Page Indicator
const PageIndicator = ({ 
  currentIndex, 
  totalSteps,
  scrollX,
}: { 
  currentIndex: number; 
  totalSteps: number;
  scrollX: SharedValue<number>;
}) => {
  return (
    <View style={styles.indicatorContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <IndicatorDot 
          key={index} 
          index={index} 
          currentIndex={currentIndex}
          scrollX={scrollX}
        />
      ))}
    </View>
  );
};

const IndicatorDot = ({ 
  index, 
  currentIndex,
  scrollX,
}: { 
  index: number; 
  currentIndex: number;
  scrollX: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 28, 8],
      'clamp'
    );
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      'clamp'
    );
    
    const backgroundColor = index === currentIndex 
      ? Colors.accent.primary 
      : 'rgba(255,255,255,0.5)';
    
    return {
      width: dotWidth,
      opacity,
      backgroundColor: index === currentIndex ? Colors.accent.primary : 'rgba(255,255,255,0.5)',
    };
  });
  
  return <Animated.View style={[styles.indicatorDot, animatedStyle]} />;
};

// CTA Button with animation
const CTAButton = ({ 
  title, 
  onPress, 
  isActive,
  delay = 0,
}: { 
  title: string; 
  onPress: () => void; 
  isActive: boolean;
  delay?: number;
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const pressScale = useSharedValue(1);
  
  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_CONFIG.ENTRY_DURATION, easing: ANIMATION_CONFIG.ENTRY_EASING }));
      scale.value = withDelay(delay, withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG));
    } else {
      opacity.value = 0;
      scale.value = 0.95;
    }
  }, [isActive]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pressScale.value }],
  }));
  
  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };
  
  return (
    <Animated.View style={[styles.ctaWrapper, animatedStyle]}>
      {/* Glow */}
      <View style={styles.ctaGlow} />
      
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.ctaButton}
      >
        <LinearGradient
          colors={[Colors.accent.primary, '#8BE04F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <Animated.Text style={styles.ctaText}>{title}</Animated.Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setLang, resolvedLang, supportedLanguages } = useAppLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useSharedValue(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll handler with Reanimated
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const newStep = Math.round(event.contentOffset.x / width);
      runOnJS(setCurrentStep)(newStep);
      runOnJS(setIsScrolling)(false);
    },
  });
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(offsetX / width);
    if (newStep !== currentStep && !isScrolling) {
      setCurrentStep(newStep);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleLanguageChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      '🌍 Dil Seçin / Select Language',
      '',
      [
        ...supportedLanguages.map((lang) => ({
          text: `${LANGUAGE_CONFIG[lang].flag} ${LANGUAGE_CONFIG[lang].name}`,
          onPress: () => handleSelectLanguage(lang),
          style: resolvedLang === lang ? ('default' as const) : undefined,
        })),
        { text: '✕', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  };

  const handleSelectLanguage = async (lang: string) => {
    if (lang === resolvedLang) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setLang(lang);
  };

  const goToStep = (step: number) => {
    setIsScrolling(true);
    scrollRef.current?.scrollTo({ x: step * width, animated: true });
    setTimeout(() => {
      setCurrentStep(step);
      setIsScrolling(false);
    }, 400);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Only 2 steps now, so if on last step, complete
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const setHasCompletedOnboarding = useSessionStore.getState().setHasCompletedOnboarding;
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)/home');
  };

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={['#0B0B0C', '#151520', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Parallax backgrounds - skip for step 2 (multi-carousel) */}
      {ONBOARDING_STEPS.map((step, index) => (
        !step.showMultiCarousel && (
          <ParallaxBackground 
            key={step.id} 
            scrollX={scrollX} 
            stepIndex={index} 
          />
        )
      ))}

      {/* Language Selector */}
      <Animated.View 
        style={[styles.languageContainer, { top: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.languageButton}
          onPress={handleLanguageChange}
          activeOpacity={0.7}
        >
          <BlurView intensity={30} tint="dark" style={styles.languageBlur}>
            <View style={styles.languageContent}>
              <Animated.Text style={styles.languageEmoji}>
                {LANGUAGE_CONFIG[resolvedLang]?.flag || '🌐'}
              </Animated.Text>
              <Animated.Text style={styles.languageText}>
                {LANGUAGE_CONFIG[resolvedLang]?.short || 'TR'}
              </Animated.Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Page Indicator - Top Center */}
      <View style={[styles.indicatorWrapper, { paddingTop: insets.top + 16 }]}>
        <PageIndicator 
          currentIndex={currentStep} 
          totalSteps={ONBOARDING_STEPS.length}
          scrollX={scrollX}
        />
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {ONBOARDING_STEPS.map((step, index) => {
          const isActive = currentStep === index;
          const baseDelay = ANIMATION_CONFIG.ENTRY_DELAY_STEP;
          
          // Step 1 - Multi-row carousel (single glass card container)
          if (step.showMultiCarousel) {
            return (
              <View key={step.id} style={styles.stepContainer}>
                <View style={styles.stepContent}>
                  {/* Single glass card with carousel and text */}
                  <GlassCardAnimated isActive={isActive} delay={baseDelay} variant="carousel">
                    {/* Multi-row carousel */}
                    <View style={styles.multiCarouselSection}>
                      <MultiRowCarousel isActive={isActive} />
                    </View>
                    
                    {/* Text content */}
                    <View style={styles.textSection}>
                      <AnimatedTitle 
                        text={t(step.titleKey)} 
                        delay={baseDelay * 2}
                        isActive={isActive}
                      />
                      <AnimatedSubtitle 
                        text={t(step.descriptionKey)} 
                        delay={baseDelay * 3}
                        isActive={isActive}
                      />
                    </View>
                  </GlassCardAnimated>
                </View>
              </View>
            );
          }
          
          // Step 2 - Video step - almost fullscreen without glass card
          if (step.showVideo) {
            return (
              <View key={step.id} style={styles.stepContainer}>
                <View style={styles.videoStepContent}>
                  {/* Almost Fullscreen Video */}
                  <View style={styles.videoFullscreen}>
                    <Video
                      source={require('../assets/videos/0106 (1).mp4')}
                      style={styles.videoFull}
                      resizeMode={ResizeMode.COVER}
                      isLooping
                      isMuted
                      shouldPlay={isActive}
                    />
                    
                    {/* Vignette effect - dark edges and bottom */}
                    <LinearGradient
                      colors={[
                        'rgba(0,0,0,0.3)',  // Top
                        'transparent',       // Center
                        'rgba(0,0,0,0.95)', // Bottom
                      ]}
                      locations={[0, 0.5, 1]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.videoVignette}
                    />
                    
                    {/* Side vignette */}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.4)']}
                      locations={[0, 0.5, 1]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.videoVignetteHorizontal}
                    />
                    
                    {/* Title at bottom - inside video */}
                    <View style={styles.videoTextSection}>
                      <AnimatedTitle 
                        text={t(step.titleKey)} 
                        delay={baseDelay * 2}
                        isActive={isActive}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          }
          
          // Legacy fallback (shouldn't be reached)
          return null;
        })}
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 24 }]}>
        <CTAButton
          title={isLastStep ? t('onboarding.start') : t('common.next')}
          onPress={handleNext}
          isActive={true}
          delay={ANIMATION_CONFIG.ENTRY_DELAY_STEP * 4}
        />
        
        {/* Skip button (optional - only on non-last steps) */}
        {!isLastStep && (
          <TouchableOpacity 
            onPress={handleComplete}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Animated.Text style={styles.skipText}>{t('common.skip')}</Animated.Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  
  // Parallax
  parallaxContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  parallaxImage: {
    width: width * 1.2,
    height: height,
    position: 'absolute',
    left: -width * 0.1,
  },
  
  // Language Selector
  languageContainer: {
    position: 'absolute',
    right: Spacing.page,
    zIndex: 100,
  },
  languageButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  languageBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  languageEmoji: {
    fontSize: 16,
  },
  languageText: {
    color: Colors.text.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  
  // Page Indicator
  indicatorWrapper: {
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 50,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  indicatorDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.primary,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    width,
    paddingHorizontal: Spacing.page + 8,
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  
  // Glass Card
  glassCardWrapper: {
    alignItems: 'center',
  },
  glassCardShadow: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: -10,
    backgroundColor: '#000',
    borderRadius: CARD_CONFIG.RADIUS,
    opacity: CARD_CONFIG.SHADOW_OPACITY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: CARD_CONFIG.SHADOW_Y },
    shadowOpacity: 0.5,
    shadowRadius: CARD_CONFIG.SHADOW_BLUR,
    elevation: 20,
  },
  glassCardOuter: {
    width: '100%',
    borderRadius: CARD_CONFIG.RADIUS,
    overflow: 'hidden',
  },
  glassCardBlur: {
    padding: Spacing.xxl + 8,
    paddingVertical: Spacing.xxxl + 16,
    backgroundColor: 'rgba(0,0,0,0.4)', // Darker background to avoid grey appearance
  },
  glassCardBlurCarousel: {
    padding: Spacing.xxl + 8,
    paddingVertical: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.5)', // Even darker for carousel to make images pop
  },
  glassCardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  glassCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_CONFIG.RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    pointerEvents: 'none',
  },
  glassCardContent: {
    alignItems: 'center',
  },
  
  // Fullscreen Step Content (for step 1 and 2)
  fullscreenStepContent: {
    flex: 1,
    marginHorizontal: -(Spacing.page + 8),
    gap: Spacing.lg,
  },
  fullscreenContainer: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    marginTop: Spacing.md,
    marginBottom: 0,
    minHeight: height * 0.55, // Reduced to make space for text box
    position: 'relative',
  },
  fullscreenLogoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  fullscreenVignetteTop: {
    ...StyleSheet.absoluteFillObject,
  },
  multiCarouselFullscreen: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  
  // Video Fullscreen (step 3)
  videoStepContent: {
    flex: 1,
    marginHorizontal: -(Spacing.page + 8),
  },
  videoFullscreen: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    marginVertical: Spacing.md,
    minHeight: height * 0.75, // Almost fullscreen
  },
  videoFull: {
    width: '100%',
    height: '100%',
  },
  videoVignette: {
    ...StyleSheet.absoluteFillObject,
  },
  videoVignetteHorizontal: {
    ...StyleSheet.absoluteFillObject,
  },
  videoTextSection: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    zIndex: 10,
  },
  
  // Multi-row Carousel Wrapper
  multiCarouselWrapper: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  multiCarouselSection: {
    marginBottom: Spacing.xxl,
    marginHorizontal: -(Spacing.xxl + 8),
    overflow: 'hidden',
  },
  
  // Carousel
  carouselSection: {
    marginBottom: Spacing.xxl,
    marginHorizontal: -(Spacing.xxl + 8),
    overflow: 'hidden',
  },
  carouselContainer: {
    height: CAROUSEL_CARD_HEIGHT + 20,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselRow: {
    flexDirection: 'row',
    gap: CAROUSEL_GAP,
    paddingVertical: 10,
  },
  carouselCard: {
    width: CAROUSEL_CARD_WIDTH,
    height: CAROUSEL_CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselCardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselFadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  carouselFadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  
  // Icon
  iconSection: {
    marginBottom: Spacing.xxl,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerMinimal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text
  textSection: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    // SF Pro Text (system default)
  },
  
  // CTA Button
  bottomContainer: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
  },
  ctaWrapper: {
    width: '100%',
  },
  ctaGlow: {
    position: 'absolute',
    top: 4,
    left: 20,
    right: 20,
    bottom: -8,
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.pill,
    opacity: 0.25,
    ...Shadows.glow(Colors.accent.primary),
  },
  ctaButton: {
    width: '100%',
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: Spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...Typography.labelLarge,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
    // SF Pro Text for CTA buttons
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  skipText: {
    ...Typography.labelMedium,
    color: Colors.text.tertiary,
    // SF Pro Text
  },
});

export default OnboardingScreen;

