import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
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
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  DisplaySmall,
  BodyLarge,
  LabelMedium,
  BodySmall,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { useTranslation } from '../src/hooks/useTranslation';
import { useAppLanguage } from '../src/hooks/useAppLanguage';
import { Video, ResizeMode } from 'expo-av';
import { GlassCard } from '../src/ui/GlassCard';

const { width, height } = Dimensions.get('window');

// Outfit görselleri - üst satır
const TOP_ROW_IMAGES = [
  require('../assets/images/combines/female/female-outfit-1.png'),
  require('../assets/images/combines/female/female-outfit-3.png'),
  require('../assets/images/combines/034785b196991ffea03e05ce7b021910.jpg'),
  require('../assets/images/combines/female/female-outfit-5.png'),
  require('../assets/images/combines/1b39f84acb05f968dd071e84df4e4c3e.jpg'),
  require('../assets/images/combines/female/female-outfit-7.png'),
];

// Alt satır
const BOTTOM_ROW_IMAGES = [
  require('../assets/images/combines/female/female-outfit-4.png'),
  require('../assets/images/combines/a3d4ce444608dc1a28eeb86f9f155f2d.jpg'),
  require('../assets/images/combines/female/female-outfit-6.png'),
  require('../assets/images/combines/a649bee229a4d788b51327a15530e282.jpg'),
  require('../assets/images/combines/female/female-outfit-8.png'),
  require('../assets/images/combines/b5b703b25e6713105df0d6a412c89587.jpg'),
];

const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const CARD_GAP = 12;
const ROW_WIDTH = (CARD_WIDTH + CARD_GAP) * TOP_ROW_IMAGES.length;

// Marquee Row Component
const MarqueeRow = ({ 
  images, 
  direction, 
  isActive 
}: { 
  images: any[]; 
  direction: 'left' | 'right';
  isActive: boolean;
}) => {
  const translateX = useSharedValue(direction === 'left' ? 0 : -ROW_WIDTH);

  useEffect(() => {
    if (isActive) {
      // Start infinite animation
      translateX.value = direction === 'left' ? 0 : -ROW_WIDTH;
      translateX.value = withRepeat(
        withTiming(
          direction === 'left' ? -ROW_WIDTH : 0,
          { duration: 20000, easing: Easing.linear }
        ),
        -1, // infinite
        false // no reverse
      );
    } else {
      cancelAnimation(translateX);
    }
    
    return () => {
      cancelAnimation(translateX);
    };
  }, [isActive, direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={[styles.marqueeRow, animatedStyle]}>
        {duplicatedImages.map((image, index) => (
          <View key={index} style={styles.outfitCard}>
            <Image
              source={image}
              style={styles.outfitImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// Language config
const LANGUAGE_CONFIG: Record<string, { name: string; flag: string; short: string }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷', short: 'TR' },
  en: { name: 'English', flag: '🇬🇧', short: 'EN' },
  fr: { name: 'Français', flag: '🇫🇷', short: 'FR' },
};

// Language Transition Overlay Component
const LanguageTransitionOverlay = ({ 
  isVisible, 
  flag, 
  languageName 
}: { 
  isVisible: boolean; 
  flag: string; 
  languageName: string;
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const flagScale = useSharedValue(0.3);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Fade in overlay
      opacity.value = withTiming(1, { duration: 200 });
      // Animate flag
      flagScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
      scale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 100 }));
      // Show text
      textOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      flagScale.value = 0.3;
      scale.value = 0.5;
      textOpacity.value = 0;
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: isVisible ? 'auto' : 'none',
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flagStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flagScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!isVisible && opacity.value === 0) return null;

  return (
    <Animated.View style={[styles.transitionOverlay, overlayStyle]}>
      <LinearGradient
        colors={['#0B0B0C', '#1a1a2e', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.transitionContent, contentStyle]}>
        <Animated.Text style={[styles.transitionFlag, flagStyle]}>
          {flag}
        </Animated.Text>
        <Animated.View style={textStyle}>
          <BodyLarge color="primary" style={styles.transitionText}>
            {languageName}
          </BodyLarge>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setLang, resolvedLang, supportedLanguages } = useAppLanguage();
  const scrollRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [transitionLang, setTransitionLang] = useState<string | null>(null);

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
    
    // Show transition overlay
    setTransitionLang(lang);
    setIsChangingLanguage(true);
    
    // Wait a bit for animation
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Change language
    await setLang(lang);
    
    // Keep overlay visible briefly after change
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Hide overlay
    setIsChangingLanguage(false);
    setTransitionLang(null);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(offsetX / width);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Play video when reaching step 3
      if (newStep === 2 && videoRef.current) {
        videoRef.current.playAsync();
      } else if (newStep !== 2 && videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  };

  // Play video on mount if already on step 3
  useEffect(() => {
    if (currentStep === 2 && videoRef.current) {
      videoRef.current.playAsync();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, [currentStep]);

  const goToStep = (step: number) => {
    scrollRef.current?.scrollTo({ x: step * width, animated: true });
  };

  const handleNext = () => {
    if (currentStep < 2) {
      goToStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#1a1a2e', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Language Selector - Top Right */}
      <Animated.View 
        entering={FadeIn.delay(300)}
        style={[styles.languageContainer, { top: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.languageButton}
          onPress={handleLanguageChange}
          activeOpacity={0.7}
        >
          <LabelMedium style={styles.languageEmoji}>
            {LANGUAGE_CONFIG[resolvedLang]?.flag || '🌐'}
          </LabelMedium>
          <LabelMedium color="primary" style={styles.languageText}>
            {LANGUAGE_CONFIG[resolvedLang]?.short || 'TR'}
          </LabelMedium>
        </TouchableOpacity>
      </Animated.View>

      {/* Language Transition Overlay */}
      <LanguageTransitionOverlay
        isVisible={isChangingLanguage}
        flag={transitionLang ? LANGUAGE_CONFIG[transitionLang]?.flag || '🌐' : '🌐'}
        languageName={transitionLang ? LANGUAGE_CONFIG[transitionLang]?.name || '' : ''}
      />

      {/* Progress indicator - Center */}
      <View style={[styles.progressWrapper, { paddingTop: insets.top + 16 }]}>
        <View style={styles.progressContainer}>
          {[0, 1, 2].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                currentStep === step && styles.progressDotActive,
                currentStep > step && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Scrollable steps */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {/* Step 1: "Kombin denemek artık saniyeler" */}
        <View style={styles.stepContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <DisplaySmall style={styles.stepTitle}>
                {t('onboarding.step1.title')}
              </DisplaySmall>
              <BodyLarge color="secondary" style={styles.stepDescription}>
                {t('onboarding.step1.description')}
              </BodyLarge>
            </View>

            <View style={styles.illustrationContainer}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>

        {/* Step 2: "Tek parça değil, komple kombin" - Marquee Carousel */}
        <View style={styles.stepContainer}>
          <View style={styles.stepContent}>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.stepHeader}>
              <DisplaySmall style={styles.stepTitle}>
                {t('onboarding.step2.title')}
              </DisplaySmall>
              <BodyLarge color="secondary" style={styles.stepDescription}>
                {t('onboarding.step2.description')}
              </BodyLarge>
            </Animated.View>

            {/* Carousel Container */}
            <View style={styles.carouselWrapper}>
              <View style={styles.carouselContainer}>
                {/* Top Row - Slides Left */}
                <MarqueeRow 
                  images={TOP_ROW_IMAGES} 
                  direction="left" 
                  isActive={currentStep === 1}
                />
                
                {/* Bottom Row - Slides Right */}
                <MarqueeRow 
                  images={BOTTOM_ROW_IMAGES} 
                  direction="right" 
                  isActive={currentStep === 1}
                />
              </View>
              
              {/* Gradient overlays for fade effect */}
              <LinearGradient
                colors={['#0B0B0C', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.15, y: 0 }}
                style={styles.gradientLeft}
                pointerEvents="none"
              />
              <LinearGradient
                colors={['transparent', '#0B0B0C']}
                start={{ x: 0.85, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientRight}
                pointerEvents="none"
              />
            </View>
          </View>
        </View>

        {/* Step 3: Video */}
        <View style={styles.stepContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
            <View style={styles.videoWrapper}>
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  source={require('../assets/videos/0106 (1).mp4')}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  isMuted
                  shouldPlay={currentStep === 2}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <PrimaryButton
          title={currentStep === 2 ? t('onboarding.start') : t('common.next')}
          onPress={handleNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  languageContainer: {
    position: 'absolute',
    right: Spacing.page,
    zIndex: 100,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  languageEmoji: {
    fontSize: 16,
  },
  languageText: {
    fontWeight: '700',
    fontSize: 13,
  },
  progressWrapper: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.surface,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: Colors.accent.primary,
  },
  progressDotCompleted: {
    backgroundColor: Colors.accent.primaryDim,
  },
  stepContainer: {
    width,
    paddingHorizontal: Spacing.page,
  },
  stepContent: {
    flex: 1,
    paddingTop: 32,
    justifyContent: 'flex-start',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
  },
  stepDescription: {
    textAlign: 'center',
    paddingHorizontal: Spacing.page,
    lineHeight: 28,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  illustration: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 24,
  },
  // Carousel Styles
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: -Spacing.page, // Full width
    position: 'relative',
  },
  carouselContainer: {
    gap: 16,
    paddingVertical: 20,
  },
  marqueeContainer: {
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  marqueeRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  outfitCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
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
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  gradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
  },
  gradientRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
  },
  // Video Styles
  videoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.page,
    paddingVertical: 48,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.stroke,
    backgroundColor: Colors.dark.surface,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    paddingHorizontal: Spacing.page,
    paddingTop: 20,
  },
  // Language Transition Overlay
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitionContent: {
    alignItems: 'center',
    gap: 16,
  },
  transitionFlag: {
    fontSize: 80,
  },
  transitionText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OnboardingScreen;
