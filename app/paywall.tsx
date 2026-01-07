import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineLarge,
  HeadlineMedium,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { useRevenueCat } from '../src/hooks/useRevenueCat';
import { useTranslation } from '../src/hooks/useTranslation';

const { width, height } = Dimensions.get('window');

type Plan = 'monthly' | 'yearly';

const PaywallScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [showClose, setShowClose] = useState(false);
  
  const player = useVideoPlayer(
    require('../assets/videos/0106 (1).mp4'),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  );
  
  const {
    isLoading,
    purchase,
    getPackage,
    refreshOfferings,
    restore,
  } = useRevenueCat();

  useEffect(() => {
    const timeout = setTimeout(() => setShowClose(true), 2000);
    return () => clearTimeout(timeout);
  }, []);

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

  // ============ DYNAMIC PRICE CALCULATIONS ============
  const planData = useMemo(() => {
    const monthlyPkg = getPackage('monthly');
    const yearlyPkg = getPackage('yearly');
    
    // Default fallback prices (based on docs/pricesrules.md)
    const MONTHLY_PRICE = monthlyPkg?.product?.price ?? 9.99;
    const YEARLY_PRICE = yearlyPkg?.product?.price ?? 69.99;
    
    // Use StoreKit localized price strings when available
    const monthlyPriceString = monthlyPkg?.product?.priceString ?? '$9.99';
    const yearlyPriceString = yearlyPkg?.product?.priceString ?? '$69.99';
    
    // Calculate monthly equivalent for yearly plan: yearly / 12
    const yearlyMonthlyEquivalent = (YEARLY_PRICE / 12).toFixed(2);
    
    // Calculate discount: 1 - (yearly / (monthly * 12))
    const fullYearlyPrice = MONTHLY_PRICE * 12;
    const discountPercent = Math.round((1 - (YEARLY_PRICE / fullYearlyPrice)) * 100);
    
    // Only show discount if it's valid (> 0 and reasonable)
    const showDiscount = discountPercent > 0 && discountPercent < 100;
    
    return {
      monthly: {
        price: MONTHLY_PRICE,
        priceString: monthlyPriceString,
        credits: 40,
        label: t('paywall.plans.monthly'),
      },
      yearly: {
        price: YEARLY_PRICE,
        priceString: yearlyPriceString,
        monthlyEquivalent: `~$${yearlyMonthlyEquivalent}`,
        credits: 480,
        creditsPerMonth: 40,
        label: t('paywall.plans.yearly'),
        discountPercent: showDiscount ? discountPercent : null,
      },
    };
  }, [getPackage, t]);

  // ============ HANDLERS ============
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
        Alert.alert(t('common.error'), t('paywall.planNotFound'));
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

  const handleOpenPrivacy = () => {
    Linking.openURL('https://wearify.app/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://wearify.app/terms');
  };

  const isPackageAvailable = (plan: Plan): boolean => {
    return getPackage(plan) !== null || true;
  };

  // ============ RENDER ============
  return (
    <View style={styles.container}>
      {/* Video Background */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(18,18,18,0.5)', 'rgba(18,18,18,0.95)', 'rgba(18,18,18,1)']}
          locations={[0.3, 0.6, 0.85, 1]}
          style={styles.videoGradient}
        />

        {/* Header Buttons - Safe Area Aware */}
        {showClose && (
          <Animated.View style={[styles.headerButtons, { top: insets.top + 8 }, closeStyle]}>
            <Pressable onPress={handleClose} style={styles.closeButton} accessibilityLabel="Kapat">
              <LabelMedium style={styles.closeIcon}>✕</LabelMedium>
            </Pressable>
            
            <Pressable onPress={handleRestorePurchases} style={styles.restoreButton} accessibilityLabel="Satın alımları geri yükle">
              <LabelSmall style={styles.restoreText}>{t('paywall.restore')}</LabelSmall>
            </Pressable>
          </Animated.View>
        )}

        {/* Title on Video */}
        <View style={styles.videoOverlayContent}>
          <Animated.View entering={FadeIn.delay(200)}>
            <HeadlineLarge style={styles.title}>Wearify Pro</HeadlineLarge>
          </Animated.View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Benefits */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.benefitsSection}>
          <View style={styles.benefitRow}>
            <BodySmall style={styles.benefitText}>✓ Kredin kadar üretim yap</BodySmall>
          </View>
          <View style={styles.benefitRow}>
            <BodySmall style={styles.benefitText}>✓ Öncelikli işlem hızı</BodySmall>
          </View>
          <View style={styles.benefitRow}>
            <BodySmall style={styles.benefitText}>✓ HD kalite (HD = +1 kredi)</BodySmall>
          </View>
          <View style={styles.benefitRow}>
            <BodySmall style={styles.benefitText}>✓ Reklamsız deneyim</BodySmall>
          </View>
        </Animated.View>

        {/* Plan Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.plansContainer}>
          
          {/* Yearly Plan - Recommended */}
          <Pressable
            onPress={() => handleSelectPlan('yearly')}
            style={styles.planCardWrapper}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'yearly' }}
          >
            {planData.yearly.discountPercent && (
              <View style={styles.discountBadge}>
                <LabelSmall style={styles.discountText}>
                  {planData.yearly.discountPercent}% {t('paywall.save')}
                </LabelSmall>
              </View>
            )}
            
            <View style={[
              styles.planCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}>
              <View style={styles.planRadio}>
                {selectedPlan === 'yearly' ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>
              
              <View style={styles.planInfo}>
                <HeadlineMedium style={styles.planName}>{planData.yearly.label}</HeadlineMedium>
                <BodySmall style={styles.planSubtext}>
                  {planData.yearly.monthlyEquivalent}/{t('paywall.month')} · {planData.yearly.creditsPerMonth} kredi/ay
                </BodySmall>
                <LabelSmall style={styles.planCredits}>
                  Toplam {planData.yearly.credits} kredi/yıl
                </LabelSmall>
              </View>
              
              <View style={styles.planPriceContainer}>
                <HeadlineMedium style={[
                  styles.planPrice,
                  selectedPlan === 'yearly' && styles.planPriceSelected
                ]}>
                  {planData.yearly.priceString}
                </HeadlineMedium>
                <BodySmall style={styles.planPeriod}>/{t('paywall.year')}</BodySmall>
              </View>
            </View>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable
            onPress={() => handleSelectPlan('monthly')}
            style={styles.planCardWrapper}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'monthly' }}
          >
            <View style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}>
              <View style={styles.planRadio}>
                {selectedPlan === 'monthly' ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>
              
              <View style={styles.planInfo}>
                <HeadlineMedium style={styles.planName}>{planData.monthly.label}</HeadlineMedium>
                <BodySmall style={styles.planSubtext}>
                  {planData.monthly.credits} kredi/ay
                </BodySmall>
              </View>
              
              <View style={styles.planPriceContainer}>
                <HeadlineMedium style={[
                  styles.planPrice,
                  selectedPlan === 'monthly' && styles.planPriceSelected
                ]}>
                  {planData.monthly.priceString}
                </HeadlineMedium>
                <BodySmall style={styles.planPeriod}>/{t('paywall.month')}</BodySmall>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Credit System Info */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.creditInfoSection}>
          <BodySmall style={styles.creditInfoText}>
            1 kredi = 1 üretim · HD/upscale +1 kredi · Sunucu hatalarında otomatik kredi iadesi
          </BodySmall>
        </Animated.View>

        {/* Main CTA */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <PrimaryButton
            title={t('paywall.startTrial')}
            onPress={handleSubscribe}
            loading={isLoading}
            disabled={!isPackageAvailable(selectedPlan)}
            style={styles.ctaButton}
          />
        </Animated.View>

        {/* Trial & Auto-renew Info */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.trialInfoSection}>
          <BodySmall style={styles.trialInfoText}>
            7 gün ücretsiz deneme (günlük 1 kredi, maks. 7). Deneme bitince abonelik otomatik yenilenir. İstediğin zaman iptal edebilirsin.
          </BodySmall>
        </Animated.View>

        {/* Legal Links */}
        <Animated.View entering={FadeIn.delay(450)} style={styles.legalSection}>
          <Pressable onPress={handleOpenPrivacy} accessibilityRole="link">
            <BodySmall style={styles.legalLink}>{t('paywall.privacy')}</BodySmall>
          </Pressable>
          <View style={styles.legalDot} />
          <Pressable onPress={handleOpenTerms} accessibilityRole="link">
            <BodySmall style={styles.legalLink}>{t('paywall.terms')}</BodySmall>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  
  // Video
  videoContainer: {
    height: height * 0.40,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlayContent: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  
  // Header
  headerButtons: {
    position: 'absolute',
    left: Spacing.page,
    right: Spacing.page,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: BorderRadius.sm,
  },
  restoreText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  
  // Title
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    lineHeight: 42,
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 16,
  },
  
  // Benefits
  benefitsSection: {
    gap: 8,
    paddingVertical: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  
  // Plans
  plansContainer: {
    gap: 12,
  },
  planCardWrapper: {
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    zIndex: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  planCardSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: 'rgba(181, 255, 31, 0.08)',
  },
  planRadio: {
    marginRight: 12,
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.background,
  },
  planInfo: {
    flex: 1,
    gap: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  planCredits: {
    color: Colors.accent.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  planPriceSelected: {
    color: Colors.accent.primary,
  },
  planPeriod: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  
  // Credit Info
  creditInfoSection: {
    paddingVertical: 8,
  },
  creditInfoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // CTA
  ctaButton: {
    width: '100%',
  },
  
  // Trial Info
  trialInfoSection: {
    paddingVertical: 4,
  },
  trialInfoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Legal
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  legalLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default PaywallScreen;
