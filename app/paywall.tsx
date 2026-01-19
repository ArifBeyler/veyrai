import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Pressable,
  Linking,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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
  LabelLarge,
  LabelSmall,
  EditorialText,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { GlassCard } from '../src/ui/GlassCard';
import { AppIcon } from '../src/utils/iconHelper';
import { useRevenueCat } from '../src/hooks/useRevenueCat';
import { useTranslation } from '../src/hooks/useTranslation';

const { width, height } = Dimensions.get('window');

type Plan = 'weekly' | 'monthly' | 'yearly';

const PaywallScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('weekly');
  const [showClose, setShowClose] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | null;
    message?: string;
  }>({
    visible: false,
    type: null,
  });
  
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
    offerings,
  } = useRevenueCat();

  useEffect(() => {
    const timeout = setTimeout(() => setShowClose(true), 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    refreshOfferings();
  }, [refreshOfferings]);

  // Debug: Check RevenueCat connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('=== RevenueCat Connection Check ===');
        console.log('Offerings:', offerings);
        console.log('Weekly package:', getPackage('weekly'));
        console.log('Monthly package:', getPackage('monthly'));
        console.log('Yearly package:', getPackage('yearly'));
        
        if (!offerings) {
          console.warn('⚠️ No offerings found - RevenueCat may not be connected');
        } else {
          console.log('✅ RevenueCat connected, offerings available');
          console.log('Available packages:', offerings.availablePackages.map(pkg => ({
            identifier: pkg.identifier,
            packageType: pkg.packageType,
            productId: pkg.product.identifier,
            price: pkg.product.price,
          })));
        }
      } catch (error) {
        console.error('RevenueCat connection check error:', error);
      }
    };
    
    checkConnection();
  }, [offerings, getPackage]);

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
    const weeklyPkg = getPackage('weekly');
    const monthlyPkg = getPackage('monthly');
    const yearlyPkg = getPackage('yearly');
    
    // Default fallback prices (based on $99.99/year pricing)
    // Cost per generation: ~$0.15
    // Yearly: $99.99/year = ~$8.33/month = ~55 credits/month = 660 credits/year
    // Monthly: $14.99/month = ~100 credits/month (better value than yearly per month)
    // Weekly: $4.99/week = ~33 credits/week
    const WEEKLY_PRICE = weeklyPkg?.product?.price ?? 4.99;
    const MONTHLY_PRICE = monthlyPkg?.product?.price ?? 14.99;
    const YEARLY_PRICE = yearlyPkg?.product?.price ?? 99.99;
    
    // Use StoreKit localized price strings when available
    const weeklyPriceString = weeklyPkg?.product?.priceString ?? '$4.99';
    const monthlyPriceString = monthlyPkg?.product?.priceString ?? '$14.99';
    const yearlyPriceString = yearlyPkg?.product?.priceString ?? '$99.99';
    
    // Calculate monthly equivalent for yearly plan: yearly / 12
    const yearlyMonthlyEquivalent = (YEARLY_PRICE / 12).toFixed(2);
    
    // Calculate discount: 1 - (yearly / (monthly * 12))
    const fullYearlyPrice = MONTHLY_PRICE * 12;
    const discountPercent = Math.round((1 - (YEARLY_PRICE / fullYearlyPrice)) * 100);
    
    // Only show discount if it's valid (> 0 and reasonable)
    const showDiscount = discountPercent > 0 && discountPercent < 100;
    
    return {
      weekly: {
        price: WEEKLY_PRICE,
        priceString: weeklyPriceString,
        credits: 33, // ~33 credits/week (4.99/0.15 ≈ 33.27)
        label: t('paywall.plans.weekly'),
      },
      monthly: {
        price: MONTHLY_PRICE,
        priceString: monthlyPriceString,
        credits: 100, // ~100 credits/month (14.99/0.15 ≈ 99.93)
        label: t('paywall.plans.monthly'),
      },
      yearly: {
        price: YEARLY_PRICE,
        priceString: yearlyPriceString,
        monthlyEquivalent: `~$${yearlyMonthlyEquivalent}`,
        credits: 660, // ~660 credits/year (99.99/0.15 ≈ 666.6, rounded to 660)
        creditsPerMonth: 55, // ~55 credits/month (99.99/12/0.15 ≈ 55.55)
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
        setPaymentModal({
          visible: true,
          type: 'error',
          message: t('paywall.planNotFound'),
        });
        return;
      }
      
      await purchase(packageToPurchase);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Başarılı ödeme modal'ı göster
      setPaymentModal({
        visible: true,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Hata modal'ı göster
      let errorMessage = t('paywall.purchaseError.default');
      
      if (error?.message) {
        const errorMsgLower = error.message.toLowerCase();
        if (
          errorMsgLower.includes('iptal') || 
          errorMsgLower.includes('cancel') ||
          errorMsgLower.includes('cancelled') ||
          errorMsgLower.includes('annulé')
        ) {
          errorMessage = t('paywall.purchaseError.cancelled');
        } else if (
          errorMsgLower.includes('izin') || 
          errorMsgLower.includes('permission') ||
          errorMsgLower.includes('not allowed') ||
          errorMsgLower.includes('autorisation')
        ) {
          errorMessage = t('paywall.purchaseError.notAllowed');
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentModal({
        visible: true,
        type: 'error',
        message: errorMessage,
      });
    }
  };
  
  const handleClosePaymentModal = () => {
    setPaymentModal({ visible: false, type: null });
    if (paymentModal.type === 'success') {
      router.back();
    }
  };
  
  const handleRetryPurchase = () => {
    setPaymentModal({ visible: false, type: null });
    // Kısa bir gecikme sonra tekrar dene
    setTimeout(() => {
      handleSubscribe();
    }, 300);
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
    Linking.openURL('https://veyra.app/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://veyra.app/terms');
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
            <Pressable onPress={handleClose} style={styles.closeButton} accessibilityLabel={t('paywall.close')}>
              <LabelMedium style={styles.closeIcon}>✕</LabelMedium>
            </Pressable>
            
            <Pressable onPress={handleRestorePurchases} style={styles.restoreButton} accessibilityLabel={t('paywall.restorePurchases')}>
              <LabelSmall style={styles.restoreText}>{t('paywall.restore')}</LabelSmall>
            </Pressable>
          </Animated.View>
        )}

        {/* Title on Video - Canela for hero headline */}
        <View style={styles.videoOverlayContent}>
          <Animated.View entering={FadeIn.delay(200)}>
            <EditorialText
              size={32}
              weight="regular"
              letterSpacing={-1.5}
              color="primary"
              style={styles.title}
            >
              Veyra Pro
            </EditorialText>
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
            <BodySmall style={styles.benefitText}>✓ {t('paywall.benefit1')}</BodySmall>
          </View>
          <View style={styles.benefitRow}>
            <BodySmall style={styles.benefitText}>✓ {t('paywall.benefit2')}</BodySmall>
          </View>
          <View style={styles.benefitRow}>
            <BodySmall style={styles.benefitText}>✓ {t('paywall.benefit3')}</BodySmall>
          </View>
        </Animated.View>

        {/* Plan Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.plansContainer}>
          
          {/* Weekly Plan - 7 Day Trial */}
          <Pressable
            onPress={() => handleSelectPlan('weekly')}
            style={styles.planCardWrapper}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'weekly' }}
          >
            <View style={styles.trialBadge}>
              <LabelSmall style={styles.trialBadgeText}>{t('paywall.trialBadge')}</LabelSmall>
            </View>
            <View style={[
              styles.planCard,
              selectedPlan === 'weekly' && styles.planCardSelected,
            ]}>
              <View style={styles.planRadio}>
                {selectedPlan === 'weekly' ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radioUnselected} />
                )}
              </View>
              
              <View style={styles.planInfo}>
                <HeadlineMedium style={styles.planName}>{planData.weekly.label}</HeadlineMedium>
              </View>
              
              <View style={styles.planPriceContainer}>
                <HeadlineMedium style={[
                  styles.planPrice,
                  selectedPlan === 'weekly' && styles.planPriceSelected
                ]}>
                  {planData.weekly.priceString}
                </HeadlineMedium>
                <BodySmall style={styles.planPeriod}>/{t('paywall.week')}</BodySmall>
              </View>
            </View>
          </Pressable>

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
                  {planData.yearly.monthlyEquivalent}/{t('paywall.month')}
                </BodySmall>
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

        {/* Main CTA */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
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
            {t('paywall.trialInfo')}
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

      {/* Payment Result Modal */}
      <Modal
        visible={paymentModal.visible}
        animationType="none"
        transparent={true}
        onRequestClose={handleClosePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(200).springify()}
            exiting={FadeOut.duration(150)}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={
                paymentModal.type === 'success'
                  ? ['rgba(34, 197, 94, 0.15)', 'rgba(18, 18, 26, 0.98)']
                  : ['rgba(239, 68, 68, 0.15)', 'rgba(18, 18, 26, 0.98)']
              }
              style={StyleSheet.absoluteFill}
            />

            {/* Icon */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={[
                styles.modalIconContainer,
                paymentModal.type === 'success'
                  ? styles.modalIconSuccess
                  : styles.modalIconError,
              ]}
            >
              <AppIcon
                name={paymentModal.type === 'success' ? 'checkmark' : 'cross'}
                size={48}
                color={paymentModal.type === 'success' ? Colors.accent.primary : Colors.error}
                weight="fill"
              />
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <HeadlineMedium style={styles.modalTitle}>
                {paymentModal.type === 'success'
                  ? t('paywall.purchaseSuccess.title')
                  : t('paywall.purchaseError.title')}
              </HeadlineMedium>
            </Animated.View>

            {/* Message */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <BodyMedium style={styles.modalMessage}>
                {paymentModal.type === 'success'
                  ? t('paywall.purchaseSuccess.message')
                  : paymentModal.message || t('paywall.purchaseError.default')}
              </BodyMedium>
            </Animated.View>

            {/* Buttons */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={styles.modalButtons}
            >
              {paymentModal.type === 'success' ? (
                <PrimaryButton
                  title={t('paywall.purchaseSuccess.continue')}
                  onPress={handleClosePaymentModal}
                  style={styles.modalButton}
                />
              ) : (
                <View style={styles.modalButtonRow}>
                  <Pressable
                    onPress={handleClosePaymentModal}
                    style={[styles.modalButtonSecondary, { marginRight: 8 }]}
                  >
                    <LabelMedium style={styles.modalButtonSecondaryText}>
                      {t('common.cancel')}
                    </LabelMedium>
                  </Pressable>
                  <PrimaryButton
                    title={t('paywall.purchaseError.retry')}
                    onPress={handleRetryPurchase}
                    style={[styles.modalButton, { flex: 1 }]}
                  />
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
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
  
  // Title - Canela (EditorialText handles font)
  title: {
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
    marginBottom: 4,
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
    // LabelSmall already has proper weight
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
    color: '#FFFFFF',
    // HeadlineMedium already has fontWeight 600
  },
  planSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  planCredits: {
    color: Colors.accent.primary,
    marginTop: 4,
    // Using Typography component weight
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    color: 'rgba(255,255,255,0.9)',
    // HeadlineMedium already has proper weight
  },
  planPriceSelected: {
    color: Colors.accent.primary,
  },
  planPeriod: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  trialBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    zIndex: 1,
  },
  trialBadgeText: {
    color: Colors.dark.background,
    // LabelSmall already has proper weight
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
  
  // Payment Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalIconSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  modalIconError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  modalIcon: {
    width: 44,
    height: 44,
  },
  modalTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    width: '100%',
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalButtonSecondaryText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default PaywallScreen;
