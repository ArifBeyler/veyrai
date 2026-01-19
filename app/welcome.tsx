import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import { HeadlineLarge, BodyLarge, BodyMedium, LabelMedium, EditorialText } from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleStart = () => {
    router.push('/auth');
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#0a0a0b', '#111118', '#0a0a0b']}
        style={StyleSheet.absoluteFill}
      />

      {/* Accent glow */}
      <View style={styles.glowContainer}>
        <View style={styles.glowAccent} />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        
        {/* Logo & Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../full3dicons/images/t-shirts.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <LabelMedium color="tertiary" style={styles.brandLabel}>VIRTUAL TRY-ON</LabelMedium>
        </View>

        {/* Main Title - Canela for hero headline */}
        <View style={styles.titleSection}>
          <EditorialText
            size={32}
            weight="regular"
            letterSpacing={-1.5}
            color="primary"
            style={styles.title}
          >
            {t('welcome.title')}
          </EditorialText>
          <BodyLarge color="secondary" style={styles.subtitle}>
            {t('welcome.subtitle')}
          </BodyLarge>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <FeatureRow icon="📸" text={t('welcome.feature1')} />
          <FeatureRow icon="👕" text={t('welcome.feature2')} />
          <FeatureRow icon="✨" text={t('welcome.feature3')} />
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        <PrimaryButton title={t('welcome.start')} onPress={handleStart} />
        <View style={styles.freeTrialBadge}>
          <BodyMedium color="accent">{t('welcome.freeTrial')}</BodyMedium>
        </View>
      </View>
    </View>
  );
};

type FeatureRowProps = {
  icon: string;
  text: string;
};

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, text }) => (
  <View style={styles.featureRow}>
    <View style={styles.featureIcon}>
      <BodyLarge>{icon}</BodyLarge>
    </View>
    <BodyMedium color="secondary">{text}</BodyMedium>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowAccent: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: Colors.accent,
    opacity: 0.03,
    position: 'absolute',
    top: -width * 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.page,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  logo: {
    width: 64,
    height: 64,
  },
  brandLabel: {
    letterSpacing: 3,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    gap: 16,
    paddingHorizontal: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: Spacing.page,
    gap: 16,
  },
  freeTrialBadge: {
    alignItems: 'center',
  },
});

export default WelcomeScreen;
