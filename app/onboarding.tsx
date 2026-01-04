import React, { useState, useRef } from 'react';
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  DisplaySmall,
  HeadlineMedium,
  BodyLarge,
  BodyMedium,
  LabelMedium,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { GlassCard } from '../src/ui/GlassCard';
import { useSessionStore } from '../src/state/useSessionStore';

const { width, height } = Dimensions.get('window');

type StyleOption = {
  id: string;
  label: string;
  icon: any;
};

const STYLE_OPTIONS: StyleOption[] = [
  { id: 'minimal', label: 'Minimal', icon: require('../full3dicons/images/t-shirt.png') },
  { id: 'street', label: 'Street', icon: require('../full3dicons/images/clothes-hanger.png') },
  { id: 'oldmoney', label: 'Old Money', icon: require('../full3dicons/images/polo-shirt.png') },
  { id: 'techwear', label: 'Techwear', icon: require('../full3dicons/images/wardrobe.png') },
  { id: 'casual', label: 'Casual', icon: require('../full3dicons/images/flannel-shirt.png') },
  { id: 'formal', label: 'Formal', icon: require('../full3dicons/images/button-down-shirt.png') },
];

const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState('casual');
  const [backgroundMode, setBackgroundMode] = useState<'original' | 'studio'>('original');

  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);
  const setPreferences = useSessionStore((s) => s.setPreferences);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newStep = Math.round(offsetX / width);
    if (newStep !== currentStep) {
      setCurrentStep(newStep);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

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
    setPreferences({
      style: selectedStyle as any,
      backgroundMode,
      quality: 'normal',
    });
    setHasCompletedOnboarding(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/home');
  };

  const handleStyleSelect = (id: string) => {
    setSelectedStyle(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        {/* Step 1: Photo Guide */}
        <View style={styles.stepContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <LabelMedium color="accent">ADIM 1/3</LabelMedium>
              <DisplaySmall style={styles.stepTitle}>
                Fotoğraf Rehberi
              </DisplaySmall>
              <BodyMedium color="secondary" style={styles.stepDescription}>
                En iyi sonuç için 3 farklı açıdan fotoğraf çek
              </BodyMedium>
            </View>

            <GlassCard style={styles.photoGuideCard}>
              <View style={styles.photoGuideContent}>
                <View style={styles.poseItem}>
                  <View style={styles.poseIconContainer}>
                    <Image
                      source={require('../full3dicons/images/profile.png')}
                      style={styles.poseIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <LabelMedium>Önden</LabelMedium>
                </View>
                <View style={styles.poseItem}>
                  <View style={styles.poseIconContainer}>
                    <Image
                      source={require('../full3dicons/images/profile-icon.png')}
                      style={styles.poseIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <LabelMedium>Yandan</LabelMedium>
                </View>
                <View style={styles.poseItem}>
                  <View style={styles.poseIconContainer}>
                    <Image
                      source={require('../full3dicons/images/camera.png')}
                      style={styles.poseIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <LabelMedium>Açılı</LabelMedium>
                </View>
              </View>

              <View style={styles.tipContainer}>
                <Image
                  source={require('../full3dicons/images/ai-sparkle.png')}
                  style={styles.tipIcon}
                  resizeMode="contain"
                />
                <BodyMedium color="secondary">
                  Omuz hizasında, iyi aydınlatılmış ortamda çek
                </BodyMedium>
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        {/* Step 2: Style Preferences */}
        <View style={styles.stepContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <LabelMedium color="accent">ADIM 2/3</LabelMedium>
              <DisplaySmall style={styles.stepTitle}>
                Stil Tercihin
              </DisplaySmall>
              <BodyMedium color="secondary" style={styles.stepDescription}>
                Tarzını seç, daha uyumlu öneriler al
              </BodyMedium>
            </View>

            <View style={styles.styleGrid}>
              {STYLE_OPTIONS.map((option) => (
                <GlassCard
                  key={option.id}
                  style={[
                    styles.styleCard,
                    selectedStyle === option.id && styles.styleCardSelected,
                  ]}
                  onPress={() => handleStyleSelect(option.id)}
                  variant={selectedStyle === option.id ? 'elevated' : 'default'}
                >
                  <Image
                    source={option.icon}
                    style={styles.styleIcon}
                    resizeMode="contain"
                  />
                  <LabelMedium
                    color={selectedStyle === option.id ? 'accent' : 'primary'}
                  >
                    {option.label}
                  </LabelMedium>
                </GlassCard>
              ))}
            </View>

            <View style={styles.backgroundSection}>
              <HeadlineMedium style={styles.sectionTitle}>
                Arka Plan
              </HeadlineMedium>
              <View style={styles.backgroundOptions}>
                <GlassCard
                  style={[
                    styles.backgroundCard,
                    backgroundMode === 'original' && styles.backgroundCardSelected,
                  ]}
                  onPress={() => setBackgroundMode('original')}
                >
                  <Image
                    source={require('../full3dicons/images/photo.png')}
                    style={styles.backgroundIcon}
                    resizeMode="contain"
                  />
                  <LabelMedium
                    color={backgroundMode === 'original' ? 'accent' : 'primary'}
                  >
                    Orijinal
                  </LabelMedium>
                </GlassCard>
                <GlassCard
                  style={[
                    styles.backgroundCard,
                    backgroundMode === 'studio' && styles.backgroundCardSelected,
                  ]}
                  onPress={() => setBackgroundMode('studio')}
                >
                  <Image
                    source={require('../full3dicons/images/home.png')}
                    style={styles.backgroundIcon}
                    resizeMode="contain"
                  />
                  <LabelMedium
                    color={backgroundMode === 'studio' ? 'accent' : 'primary'}
                  >
                    Stüdyo
                  </LabelMedium>
                </GlassCard>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Step 3: Free Trial */}
        <View style={styles.stepContainer}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <LabelMedium color="accent">ADIM 3/3</LabelMedium>
              <DisplaySmall style={styles.stepTitle}>
                Ücretsiz Dene
              </DisplaySmall>
              <BodyMedium color="secondary" style={styles.stepDescription}>
                İlk denemende ne alacaksın?
              </BodyMedium>
            </View>

            <GlassCard style={styles.freeTrialCard}>
              <View style={styles.freeTrialBadge}>
                <Image
                  source={require('../full3dicons/images/sparkle.png')}
                  style={styles.freeTrialIcon}
                  resizeMode="contain"
                />
                <HeadlineMedium color="accent">1 ÜCRETSİZ DENEME</HeadlineMedium>
              </View>

              <View style={styles.benefitsList}>
                <BenefitItem
                  icon={require('../full3dicons/images/t-shirt.png')}
                  text="1 kıyafet denemesi"
                />
                <BenefitItem
                  icon={require('../full3dicons/images/ai-sparkle.png')}
                  text="AI ile gerçekçi sonuç"
                />
                <BenefitItem
                  icon={require('../full3dicons/images/photo.png')}
                  text="Sonucu kaydet ve paylaş"
                />
              </View>
            </GlassCard>

            <View style={styles.beforeAfterContainer}>
              <View style={styles.beforeAfterItem}>
                <Image
                  source={require('../full3dicons/images/profile.png')}
                  style={styles.beforeAfterImage}
                  resizeMode="contain"
                />
                <LabelMedium color="secondary">Önce</LabelMedium>
              </View>
              <View style={styles.arrowContainer}>
                <Image
                  source={require('../full3dicons/images/sparkle.png')}
                  style={styles.arrowIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.beforeAfterItem}>
                <Image
                  source={require('../full3dicons/images/t-shirts.png')}
                  style={styles.beforeAfterImage}
                  resizeMode="contain"
                />
                <LabelMedium color="secondary">Sonra</LabelMedium>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
        <PrimaryButton
          title={currentStep === 2 ? 'İlk Denemeni Yap' : 'Devam Et'}
          onPress={handleNext}
        />
        {currentStep < 2 && (
          <PrimaryButton
            title="Atla"
            variant="ghost"
            onPress={() => goToStep(2)}
          />
        )}
      </View>
    </View>
  );
};

type BenefitItemProps = {
  icon: any;
  text: string;
};

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <Image source={icon} style={styles.benefitIcon} resizeMode="contain" />
    <BodyMedium>{text}</BodyMedium>
  </View>
);

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
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  stepDescription: {
    marginTop: 8,
    textAlign: 'center',
  },
  photoGuideCard: {
    padding: 24,
  },
  photoGuideContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  poseItem: {
    alignItems: 'center',
    gap: 8,
  },
  poseIconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
  },
  poseIcon: {
    width: 44,
    height: 44,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.md,
  },
  tipIcon: {
    width: 24,
    height: 24,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  styleCard: {
    width: (width - Spacing.page * 2 - 24) / 3,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  styleCardSelected: {
    borderColor: Colors.accent.primary,
  },
  styleIcon: {
    width: 36,
    height: 36,
  },
  backgroundSection: {
    marginTop: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  backgroundOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  backgroundCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  backgroundCardSelected: {
    borderColor: Colors.accent.primary,
  },
  backgroundIcon: {
    width: 28,
    height: 28,
  },
  freeTrialCard: {
    padding: 24,
    alignItems: 'center',
  },
  freeTrialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  freeTrialIcon: {
    width: 32,
    height: 32,
  },
  benefitsList: {
    width: '100%',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 32,
    height: 32,
  },
  beforeAfterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  beforeAfterItem: {
    alignItems: 'center',
    gap: 8,
  },
  beforeAfterImage: {
    width: 80,
    height: 80,
  },
  arrowContainer: {
    padding: 8,
  },
  arrowIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.accent.primary,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.page,
    gap: 8,
  },
});

export default OnboardingScreen;

