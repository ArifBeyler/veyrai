import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  DisplaySmall,
  HeadlineLarge,
  BodyLarge,
  BodyMedium,
  LabelMedium,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { GlassCard } from '../src/ui/GlassCard';
import { useTranslation } from '../src/hooks/useTranslation';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);
  const [currentStep, setCurrentStep] = useState(0);

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
      // Last step -> go to video screen
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

      {/* Progress indicator */}
      <View style={[styles.progressContainer, { paddingTop: insets.top + 16 }]}>
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
                source={require('../full3dicons/images/t-shirts.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>

        {/* Step 2: "Tek parça değil, komple kombin" */}
        <View style={styles.stepContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <DisplaySmall style={styles.stepTitle}>
                {t('onboarding.step2.title')}
              </DisplaySmall>
              <BodyLarge color="secondary" style={styles.stepDescription}>
                {t('onboarding.step2.description')}
              </BodyLarge>
            </View>

            <View style={styles.multiItemContainer}>
              <View style={styles.itemStack}>
                <GlassCard style={styles.itemCard}>
                  <Image
                    source={require('../full3dicons/images/t-shirt.png')}
                    style={styles.itemIcon}
                    resizeMode="contain"
                  />
                </GlassCard>
                <GlassCard style={[styles.itemCard, styles.itemCard2]}>
                  <Image
                    source={require('../full3dicons/images/polo-shirt.png')}
                    style={styles.itemIcon}
                    resizeMode="contain"
                  />
                </GlassCard>
                <GlassCard style={[styles.itemCard, styles.itemCard3]}>
                  <Image
                    source={require('../full3dicons/images/button-down-shirt.png')}
                    style={styles.itemIcon}
                    resizeMode="contain"
                  />
                </GlassCard>
                <GlassCard style={[styles.itemCard, styles.itemCard4]}>
                  <Image
                    source={require('../full3dicons/images/flannel-shirt.png')}
                    style={styles.itemIcon}
                    resizeMode="contain"
                  />
                </GlassCard>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Step 3: Video in Rounded Container */}
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: Spacing.page,
    paddingBottom: 16,
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
    justifyContent: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 48,
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
    width: width * 0.6,
    height: width * 0.6,
  },
  multiItemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  itemStack: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  itemCard: {
    width: 120,
    height: 120,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface,
  },
  itemCard2: {
    top: 20,
    left: 40,
    zIndex: 1,
  },
  itemCard3: {
    top: 40,
    left: 80,
    zIndex: 2,
  },
  itemCard4: {
    top: 60,
    left: 120,
    zIndex: 3,
  },
  itemIcon: {
    width: 64,
    height: 64,
  },
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
});

export default OnboardingScreen;
