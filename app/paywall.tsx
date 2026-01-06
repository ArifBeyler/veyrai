import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
  Linking,
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
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
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
import { Image } from 'expo-image';

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
      {/* Background gradient - top section */}
      <LinearGradient
        colors={['#0B0B0C', '#1a1a2e', '#2a1a3e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative elements */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.decorativeContainer}>
        <Image
          source={require('../full3dicons/images/sparkle.png')}
          style={[styles.sparkle, styles.sparkle1]}
          contentFit="contain"
        />
        <Image
          source={require('../full3dicons/images/ai-sparkle.png')}
          style={[styles.sparkle, styles.sparkle2]}
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

      {/* Modal - bottom section */}
      <Animated.View 
        entering={SlideInUp.delay(300).springify()}
        style={[
          styles.modal,
          { 
            bottom: 0,
            paddingBottom: insets.bottom + 20,
          }
        ]}
      >
        <GlassCard style={styles.modalContent}>
          {/* Title */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <HeadlineMedium style={styles.title}>
              Yolculuğuna başla
            </HeadlineMedium>
            <BodyLarge color="secondary" style={styles.subtitle}>
              İstediğin kadar kombin üret, sınırsız deneme yap
            </BodyLarge>
          </Animated.View>

          {/* Features List */}
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={styles.featuresList}
          >
            <FeatureItem text="Sınırsız kombin üretimi" />
            <FeatureItem text="Yüksek kaliteli sonuçlar" />
            <FeatureItem text="Öncelikli işlem hızı" />
          </Animated.View>

          {/* Plans - Horizontal layout */}
          <Animated.View 
            entering={FadeInDown.delay(600).springify()}
            style={styles.plansRow}
          >
            {/* Monthly */}
            {isPackageAvailable('monthly') && (
              <Pressable 
                onPress={() => handleSelectPlan('monthly')}
                style={styles.planCardWrapper}
              >
                <View style={styles.planCardContainer}>
                  <GlassCard
                    style={[
                      styles.planCard,
                      selectedPlan === 'monthly' && styles.planCardSelected,
                    ]}
                  >
                    <View style={[
                      styles.planRadio,
                      selectedPlan === 'monthly' && styles.planRadioSelected,
                    ]}>
                      {selectedPlan === 'monthly' && <View style={styles.planRadioInner} />}
                    </View>
                    <LabelMedium style={styles.planLabel}>Aylık</LabelMedium>
                    <View style={styles.planPriceContainer}>
                      <BodyMedium style={styles.planPrice}>
                        {getPackagePrice('monthly').main}
                      </BodyMedium>
                    </View>
                  </GlassCard>
                </View>
              </Pressable>
            )}

            {/* Yearly - Selected by default */}
            {isPackageAvailable('yearly') && (
              <Pressable 
                onPress={() => handleSelectPlan('yearly')}
                style={styles.planCardWrapper}
              >
                <View style={styles.planCardContainer}>
                  <GlassCard
                    style={[
                      styles.planCard,
                      selectedPlan === 'yearly' && styles.planCardSelected,
                    ]}
                  >
                    <View style={[
                      styles.planRadio,
                      selectedPlan === 'yearly' && styles.planRadioSelected,
                    ]}>
                      {selectedPlan === 'yearly' && <View style={styles.planRadioInner} />}
                    </View>
                    <LabelMedium style={styles.planLabel}>Yıllık</LabelMedium>
                    <View style={styles.planPriceContainer}>
                      <BodyMedium style={styles.planPrice}>
                        {getPackagePrice('yearly').main}
                      </BodyMedium>
                    </View>
                  </GlassCard>
                  {/* Discount badge - outside card */}
                  {selectedPlan === 'yearly' && (
                    <View style={styles.discountBadge}>
                      <LabelSmall style={styles.discountText}>
                        %{getDiscountPercentage()} İNDİRİM
                      </LabelSmall>
                    </View>
                  )}
                </View>
              </Pressable>
            )}

            {/* Lifetime */}
            {isPackageAvailable('lifetime') && (
              <Pressable 
                onPress={() => handleSelectPlan('lifetime')}
                style={styles.planCardWrapper}
              >
                <View style={styles.planCardContainer}>
                  <GlassCard
                    style={[
                      styles.planCard,
                      selectedPlan === 'lifetime' && styles.planCardSelected,
                    ]}
                  >
                    <View style={[
                      styles.planRadio,
                      selectedPlan === 'lifetime' && styles.planRadioSelected,
                    ]}>
                      {selectedPlan === 'lifetime' && <View style={styles.planRadioInner} />}
                    </View>
                    <LabelMedium style={styles.planLabel}>Ömür Boyu</LabelMedium>
                    <View style={styles.planPriceContainer}>
                      <BodyMedium style={styles.planPrice}>
                        {getPackagePrice('lifetime').main}
                      </BodyMedium>
                    </View>
                  </GlassCard>
                </View>
              </Pressable>
            )}
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(700).springify()}>
            <PrimaryButton
              title="Devam Et"
              onPress={handleSubscribe}
              loading={isLoading}
              disabled={!isPackageAvailable(selectedPlan)}
              style={styles.continueButton}
            />
          </Animated.View>

          {/* Footer Links */}
          <Animated.View 
            entering={FadeInDown.delay(800).springify()}
            style={styles.footerLinks}
          >
            <Pressable onPress={handleRestorePurchases}>
              <BodySmall color="tertiary">Geri Yükle</BodySmall>
            </Pressable>
            <View style={styles.footerDot} />
            <Pressable onPress={() => Linking.openURL('https://example.com/terms')}>
              <BodySmall color="tertiary">Şartlar</BodySmall>
            </Pressable>
            <View style={styles.footerDot} />
            <Pressable onPress={() => Linking.openURL('https://example.com/privacy')}>
              <BodySmall color="tertiary">Gizlilik</BodySmall>
            </Pressable>
          </Animated.View>
        </GlassCard>
      </Animated.View>
    </View>
  );
};

type FeatureItemProps = {
  text: string;
};

const FeatureItem: React.FC<FeatureItemProps> = ({ text }) => (
  <View style={styles.featureItem}>
    <View style={styles.checkmark}>
      <LabelSmall style={styles.checkmarkText}>✓</LabelSmall>
    </View>
    <BodyMedium color="primary" style={styles.featureText}>
      {text}
    </BodyMedium>
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
    width: 140,
    height: 140,
    top: 60,
    right: -30,
  },
  sparkle2: {
    width: 120,
    height: 120,
    top: 160,
    left: -30,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.page,
    zIndex: 10,
  },
  modal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.7, // Bottom 70% of screen
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.xxl,
  },
  modalContent: {
    padding: Spacing.xxl,
    gap: Spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontSize: 16,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
  },
  plansRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  planCardWrapper: {
    flex: 1,
  },
  planCardContainer: {
    position: 'relative',
  },
  planCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
    minHeight: 110,
    justifyContent: 'flex-start',
    paddingTop: Spacing.lg + 4,
  },
  planCardSelected: {
    borderColor: Colors.accent.primary,
    borderWidth: 2,
    backgroundColor: Colors.accent.primaryDim + '40',
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  planRadioSelected: {
    borderColor: Colors.accent.primary,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent.primary,
  },
  planLabel: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  planPriceContainer: {
    marginTop: 'auto',
  },
  planPrice: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  discountBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    backgroundColor: '#FBBF24',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  continueButton: {
    marginTop: Spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text.tertiary,
  },
});

export default PaywallScreen;
