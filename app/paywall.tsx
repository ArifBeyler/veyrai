import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../src/ui/theme';
import {
  DisplaySmall,
  HeadlineMedium,
  HeadlineSmall,
  BodyLarge,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../src/ui/Typography';
import { GlassCard } from '../src/ui/GlassCard';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { IconButton } from '../src/ui/IconButton';
import { useRevenueCat } from '../src/hooks/useRevenueCat';
import type { PurchasesPackage } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

type Plan = 'monthly' | 'yearly' | 'lifetime';

const PaywallScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [showClose, setShowClose] = useState(false);
  
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
      
      // Get package from offerings
      const packageToPurchase = getPackage(selectedPlan);
      
      if (!packageToPurchase) {
        Alert.alert('Hata', 'Seçilen plan bulunamadı. Lütfen daha sonra tekrar deneyin.');
        return;
      }
      
      // Purchase package
      await purchase(packageToPurchase);
      
      // Success - navigate back
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      // Error is already handled in hook
      console.error('Purchase error:', error);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await restore();
    } catch (error: any) {
      // Error is already handled in hook
      console.error('Restore error:', error);
    }
  };

  // Get package pricing
  const getPackagePrice = (plan: Plan): string => {
    const packageToCheck = getPackage(plan);
    if (packageToCheck?.product?.priceString) {
      return packageToCheck.product.priceString;
    }
    // Fallback prices
    switch (plan) {
      case 'monthly':
        return '₺49.99/ay';
      case 'yearly':
        return '₺299.99/yıl';
      case 'lifetime':
        return '₺999.99';
      default:
        return '';
    }
  };

  // Check if package is available
  const isPackageAvailable = (plan: Plan): boolean => {
    return getPackage(plan) !== null;
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0B0B0C', '#1a1a2e', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative elements */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.decorativeContainer}>
        <Image
          source={require('../full3dicons/images/sparkle.png')}
          style={[styles.sparkle, styles.sparkle1]}
          resizeMode="contain"
        />
        <Image
          source={require('../full3dicons/images/ai-sparkle.png')}
          style={[styles.sparkle, styles.sparkle2]}
          resizeMode="contain"
        />
        <Image
          source={require('../full3dicons/images/sparkle.png')}
          style={[styles.sparkle, styles.sparkle3]}
          resizeMode="contain"
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Image
            source={require('../full3dicons/images/sparkle.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <DisplaySmall style={styles.headerTitle}>
            Unlimited{'\n'}
            <DisplaySmall color="accent">Combos</DisplaySmall>
          </DisplaySmall>
          <BodyLarge color="secondary" style={styles.headerSubtitle}>
            Sınırsız kombin üretimi + yüksek kalite
          </BodyLarge>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.featuresSection}>
          <FeatureItem
            icon={require('../full3dicons/images/ai-sparkle.png')}
            title="Sınırsız Deneme"
            description="İstediğin kadar kıyafet dene"
          />
          <FeatureItem
            icon={require('../full3dicons/images/photo.png')}
            title="HD Kalite"
            description="Yüksek çözünürlüklü sonuçlar"
          />
          <FeatureItem
            icon={require('../full3dicons/images/t-shirts.png')}
            title="4 Varyasyon"
            description="Her denemede 4 farklı görsel"
          />
          <FeatureItem
            icon={require('../full3dicons/images/sparkle.png')}
            title="Öncelikli İşlem"
            description="Daha hızlı sonuç al"
          />
        </Animated.View>

        {/* Plans */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.plansSection}>
          <HeadlineSmall style={styles.plansTitle}>Plan Seç</HeadlineSmall>

          <View style={styles.plansContainer}>
            {/* Yearly Plan */}
            {isPackageAvailable('yearly') && (
              <Pressable onPress={() => handleSelectPlan('yearly')}>
                <GlassCard
                  style={[
                    styles.planCard,
                    selectedPlan === 'yearly' && styles.planCardSelected,
                  ]}
                >
                  {/* Best value badge */}
                  <View style={styles.bestValueBadge}>
                    <LabelSmall style={styles.bestValueText}>En Avantajlı</LabelSmall>
                  </View>

                  <View style={styles.planHeader}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedPlan === 'yearly' && styles.radioOuterSelected,
                      ]}
                    >
                      {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.planInfo}>
                      <HeadlineMedium>Yıllık</HeadlineMedium>
                      <BodySmall color="secondary">12 aylık erişim</BodySmall>
                    </View>
                  </View>

                  <View style={styles.planPricing}>
                    <HeadlineSmall color="accent">{getPackagePrice('yearly').split('/')[0]}</HeadlineSmall>
                    {getPackagePrice('yearly').includes('/') && (
                      <BodySmall color="tertiary">/{getPackagePrice('yearly').split('/')[1]}</BodySmall>
                    )}
                  </View>

                  <View style={styles.savingsBadge}>
                    <LabelSmall color="success">%50 Tasarruf</LabelSmall>
                  </View>
                </GlassCard>
              </Pressable>
            )}

            {/* Monthly Plan */}
            {isPackageAvailable('monthly') && (
              <Pressable onPress={() => handleSelectPlan('monthly')}>
                <GlassCard
                  style={[
                    styles.planCard,
                    selectedPlan === 'monthly' && styles.planCardSelected,
                  ]}
                >
                  <View style={styles.planHeader}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedPlan === 'monthly' && styles.radioOuterSelected,
                      ]}
                    >
                      {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.planInfo}>
                      <HeadlineMedium>Aylık</HeadlineMedium>
                      <BodySmall color="secondary">1 aylık erişim</BodySmall>
                    </View>
                  </View>

                  <View style={styles.planPricing}>
                    <HeadlineSmall color="accent">{getPackagePrice('monthly').split('/')[0]}</HeadlineSmall>
                    {getPackagePrice('monthly').includes('/') && (
                      <BodySmall color="tertiary">/{getPackagePrice('monthly').split('/')[1]}</BodySmall>
                    )}
                  </View>
                </GlassCard>
              </Pressable>
            )}

            {/* Lifetime Plan */}
            {isPackageAvailable('lifetime') && (
              <Pressable onPress={() => handleSelectPlan('lifetime')}>
                <GlassCard
                  style={[
                    styles.planCard,
                    selectedPlan === 'lifetime' && styles.planCardSelected,
                  ]}
                >
                  <View style={styles.planHeader}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedPlan === 'lifetime' && styles.radioOuterSelected,
                      ]}
                    >
                      {selectedPlan === 'lifetime' && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.planInfo}>
                      <HeadlineMedium>Ömür Boyu</HeadlineMedium>
                      <BodySmall color="secondary">Tek seferlik ödeme</BodySmall>
                    </View>
                  </View>

                  <View style={styles.planPricing}>
                    <HeadlineSmall color="accent">{getPackagePrice('lifetime')}</HeadlineSmall>
                  </View>
                </GlassCard>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Subscribe button */}
        <Animated.View entering={SlideInUp.delay(400).springify()} style={styles.subscribeSection}>
          <PrimaryButton
            title={`Satın Al - ${getPackagePrice(selectedPlan)}`}
            onPress={handleSubscribe}
            loading={isLoading}
            disabled={!isPackageAvailable(selectedPlan)}
          />

          <Pressable onPress={handleRestorePurchases} style={styles.restoreButton}>
            <BodySmall color="tertiary">Satın alımları geri yükle</BodySmall>
          </Pressable>
        </Animated.View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <BodySmall color="tertiary" style={styles.termsText}>
            Aboneliğiniz App Store hesabınız üzerinden faturalandırılacaktır.
            İstediğiniz zaman ayarlardan iptal edebilirsiniz.
          </BodySmall>
        </View>
      </ScrollView>
    </View>
  );
};

type FeatureItemProps = {
  icon: any;
  title: string;
  description: string;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Image source={icon} style={styles.featureIcon} resizeMode="contain" />
    </View>
    <View style={styles.featureText}>
      <LabelMedium>{title}</LabelMedium>
      <BodySmall color="secondary">{description}</BodySmall>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
    opacity: 0.2,
  },
  sparkle1: {
    width: 80,
    height: 80,
    top: 100,
    right: 20,
  },
  sparkle2: {
    width: 60,
    height: 60,
    top: 250,
    left: 20,
  },
  sparkle3: {
    width: 40,
    height: 40,
    bottom: 200,
    right: 40,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.page,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    textAlign: 'center',
    lineHeight: 40,
  },
  headerSubtitle: {
    textAlign: 'center',
  },
  featuresSection: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    width: 28,
    height: 28,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  plansSection: {
    gap: 16,
  },
  plansTitle: {
    textAlign: 'center',
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  planCardSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primaryDim,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.sm,
  },
  bestValueText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  planHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.stroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.accent.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent.primary,
  },
  planInfo: {
    gap: 2,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  savingsBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderRadius: BorderRadius.sm,
  },
  subscribeSection: {
    gap: 12,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: 8,
  },
  termsSection: {
    paddingHorizontal: 20,
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PaywallScreen;
