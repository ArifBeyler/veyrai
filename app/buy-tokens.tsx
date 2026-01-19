import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineLarge,
  HeadlineMedium,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { AppIcon } from '../src/utils/iconHelper';
import { useRevenueCat } from '../src/hooks/useRevenueCat';
import { supabase } from '../src/services/supabase';
import { useTranslation } from '../src/hooks/useTranslation';
import { useTheme } from '../src/theme';
import { useSessionStore } from '../src/state/useSessionStore';

const { width } = Dimensions.get('window');

// Token paketleri - Product ID'ler App Store Connect ile eşleşmeli
const TOKEN_PACKAGES = [
  {
    id: 'com.veyra.tokens10',
    tokens: 10,
    price: 2.99,
    priceString: '$2.99',
    icon: '✨',
    popular: false,
  },
  {
    id: 'com.veyra.tokens50',
    tokens: 50,
    price: 9.99,
    priceString: '$9.99',
    icon: '💎',
    popular: true,
    bonus: 10, // +10 bonus token
  },
  {
    id: 'com.veyra.tokens100',
    tokens: 100,
    price: 14.99,
    priceString: '$14.99',
    icon: '👑',
    popular: false,
    bonus: 30, // +30 bonus token
  },
  {
    id: 'com.veyra.tokens250',
    tokens: 250,
    price: 29.99,
    priceString: '$29.99',
    icon: '🚀',
    popular: false,
    bonus: 100, // +100 bonus token
  },
];

const BuyTokensScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedPackage, setSelectedPackage] = useState<string>('com.veyra.tokens50');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | null;
    message?: string;
    tokens?: number;
  }>({
    visible: false,
    type: null,
  });

  const credits = useSessionStore((s) => s.credits);
  const addCredits = useSessionStore((s) => s.addCredits);
  
  // RevenueCat hooks
  const { getTokenPackage, purchaseTokenPackage } = useRevenueCat();

  // Sparkle animation
  const sparkleRotate = useSharedValue(0);
  const sparkleScale = useSharedValue(1);

  useEffect(() => {
    sparkleRotate.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );
    sparkleScale.value = withRepeat(
      withSpring(1.1, { damping: 2 }),
      -1,
      true
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sparkleRotate.value}deg` },
      { scale: sparkleScale.value },
    ],
  }));

  const selectedPkg = useMemo(
    () => TOKEN_PACKAGES.find((p) => p.id === selectedPackage),
    [selectedPackage]
  );

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectPackage = (id: string) => {
    setSelectedPackage(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return;

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const totalTokens = selectedPkg.tokens + (selectedPkg.bonus || 0);

      // RevenueCat'ten token paketini bul ve satın al
      const tokenPackage = getTokenPackage(selectedPkg.id);
      
      if (tokenPackage) {
        // RevenueCat ile gerçek satın alma
        await purchaseTokenPackage(tokenPackage);
        console.log(`Purchased package: ${selectedPkg.id}`);
      } else {
        // RevenueCat paketi bulunamazsa (test/development için)
        console.log('Token package not found in RevenueCat, using fallback');
      }
      
      // Kredileri ekle (local state)
      addCredits(totalTokens);
      
      // Supabase'e de kaydet
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase.rpc('add_credits', {
            p_user_id: session.user.id,
            p_amount: totalTokens
          });
          
          if (!error && data !== null) {
            console.log(`Synced ${totalTokens} tokens with Supabase. New balance: ${data}`);
          }
        } catch (syncError) {
          console.warn('Supabase sync failed:', syncError);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setPaymentModal({
        visible: true,
        type: 'success',
        tokens: totalTokens,
      });
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Kullanıcı iptal ettiyse hata gösterme
      if (error?.message?.toLowerCase().includes('cancel')) {
        setIsLoading(false);
        return;
      }
      
      setPaymentModal({
        visible: true,
        type: 'error',
        message: error?.message || t('buyTokens.purchaseError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setPaymentModal({ visible: false, type: null });
    if (paymentModal.type === 'success') {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Solid Background - Modal arka planını kapatmak için */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0B0B0C' }]} />
      <LinearGradient
        colors={theme.colors.backgroundGradient as unknown as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <LabelMedium style={styles.closeIcon}>✕</LabelMedium>
        </Pressable>
        <View style={styles.headerTitle}>
          <HeadlineMedium>{t('buyTokens.title')}</HeadlineMedium>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Balance */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={[styles.balanceCard, { borderColor: theme.colors.accent }]}>
            <LinearGradient
              colors={[theme.colors.accentDim + '30', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.balanceContent}>
              <Animated.View style={[styles.balanceIconContainer, sparkleStyle]}>
                <AppIcon
                  name="sparkle"
                  size={32}
                  color={theme.colors.accent}
                  weight="fill"
                />
              </Animated.View>
              <View style={styles.balanceText}>
                <LabelSmall color="secondary">{t('buyTokens.currentBalance')}</LabelSmall>
                <HeadlineLarge style={[styles.balanceValue, { color: theme.colors.accent }]}>
                  {credits}
                </HeadlineLarge>
                <LabelSmall color="tertiary">{t('buyTokens.tokens')}</LabelSmall>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Packages */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>
            {t('buyTokens.selectPackage')}
          </HeadlineSmall>

          <View style={styles.packagesGrid}>
            {TOKEN_PACKAGES.map((pkg, index) => {
              const isSelected = selectedPackage === pkg.id;
              const totalTokens = pkg.tokens + (pkg.bonus || 0);
              const pricePerToken = (pkg.price / totalTokens).toFixed(2);

              return (
                <Animated.View
                  key={pkg.id}
                  entering={FadeInDown.delay(400 + index * 100).springify()}
                >
                  <Pressable
                    onPress={() => handleSelectPackage(pkg.id)}
                    style={[
                      styles.packageCard,
                      isSelected && [styles.packageCardSelected, { borderColor: theme.colors.accent }],
                    ]}
                  >
                    {pkg.popular && (
                      <View style={[styles.popularBadge, { backgroundColor: theme.colors.accent }]}>
                        <LabelSmall style={styles.popularText}>
                          {t('buyTokens.popular')}
                        </LabelSmall>
                      </View>
                    )}

                    {pkg.bonus && (
                      <View style={styles.bonusBadge}>
                        <LabelSmall style={styles.bonusText}>
                          +{pkg.bonus} {t('buyTokens.bonus')}
                        </LabelSmall>
                      </View>
                    )}

                    <LabelMedium style={styles.packageIcon}>{pkg.icon}</LabelMedium>

                    <HeadlineMedium style={styles.packageTokens}>
                      {pkg.tokens}
                    </HeadlineMedium>
                    <LabelSmall color="secondary">{t('buyTokens.tokens')}</LabelSmall>

                    <View style={styles.packagePriceContainer}>
                      <HeadlineSmall style={[
                        styles.packagePrice,
                        isSelected && { color: theme.colors.accent }
                      ]}>
                        {pkg.priceString}
                      </HeadlineSmall>
                      <LabelSmall color="tertiary" style={styles.perToken}>
                        ~${pricePerToken}/{t('buyTokens.token')}
                      </LabelSmall>
                    </View>

                    {isSelected && (
                      <View style={[styles.selectedCheck, { backgroundColor: theme.colors.accent }]}>
                        <LabelSmall style={styles.selectedCheckText}>✓</LabelSmall>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <LabelSmall style={styles.infoBullet}>•</LabelSmall>
              <BodySmall color="secondary">{t('buyTokens.info1')}</BodySmall>
            </View>
            <View style={styles.infoRow}>
              <LabelSmall style={styles.infoBullet}>•</LabelSmall>
              <BodySmall color="secondary">{t('buyTokens.info2')}</BodySmall>
            </View>
            <View style={styles.infoRow}>
              <LabelSmall style={styles.infoBullet}>•</LabelSmall>
              <BodySmall color="secondary">{t('buyTokens.info3')}</BodySmall>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInDown.delay(500)}
        style={[styles.bottomCta, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}
      >
        <LinearGradient
          colors={['transparent', theme.colors.backgroundGradient[2] || '#0B0B0C']}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomContent}>
          {selectedPkg && (
            <View style={styles.selectedSummary}>
              <LabelMedium>{selectedPkg.tokens + (selectedPkg.bonus || 0)} {t('buyTokens.tokens')}</LabelMedium>
              <HeadlineMedium style={{ color: theme.colors.accent }}>
                {selectedPkg.priceString}
              </HeadlineMedium>
            </View>
          )}
          <PrimaryButton
            title={t('buyTokens.buyNow')}
            onPress={handlePurchase}
            loading={isLoading}
            style={styles.buyButton}
          />
        </View>
      </Animated.View>

      {/* Payment Result Modal */}
      <Modal
        visible={paymentModal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
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
              <LabelMedium style={styles.modalIcon}>
                {paymentModal.type === 'success' ? '🎉' : '❌'}
              </LabelMedium>
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <HeadlineMedium style={styles.modalTitle}>
                {paymentModal.type === 'success'
                  ? t('buyTokens.success.title')
                  : t('buyTokens.error.title')}
              </HeadlineMedium>
            </Animated.View>

            {/* Message */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <BodyMedium style={styles.modalMessage}>
                {paymentModal.type === 'success'
                  ? t('buyTokens.success.message', { tokens: paymentModal.tokens })
                  : paymentModal.message}
              </BodyMedium>
            </Animated.View>

            {/* Buttons */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={styles.modalButtons}
            >
              <PrimaryButton
                title={paymentModal.type === 'success' ? t('common.continue') : t('common.close')}
                onPress={handleCloseModal}
                style={styles.modalButton}
              />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.page,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#fff',
    fontSize: 18,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 24,
  },
  // Balance Card
  balanceCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    overflow: 'hidden',
    padding: 24,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  balanceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(181, 255, 31, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIcon: {
    width: 36,
    height: 36,
  },
  balanceText: {
    flex: 1,
    gap: 2,
  },
  balanceValue: {
    fontSize: 36,
    lineHeight: 42,
    // Using Typography component weight
  },
  // Section
  sectionTitle: {
    marginBottom: 16,
  },
  // Packages Grid
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  packageCard: {
    width: (width - Spacing.page * 2 - 12) / 2,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
    borderColor: Colors.dark.strokeLight,
    alignItems: 'center',
    gap: 6,
  },
  packageCardSelected: {
    backgroundColor: 'rgba(181, 255, 31, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    zIndex: 10,
  },
  popularText: {
    color: '#000',
    fontSize: 10,
    // Using Typography component weight
  },
  bonusBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    zIndex: 10,
  },
  bonusText: {
    color: '#fff',
    fontSize: 9,
    // Using Typography component weight
  },
  packageIcon: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 4,
  },
  packageTokens: {
    fontSize: 28,
    color: '#fff',
    // Using Typography component weight
  },
  packagePriceContainer: {
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
  },
  packagePrice: {
    fontSize: 18,
    color: '#fff',
    // Using Typography component weight
  },
  perToken: {
    fontSize: 10,
  },
  selectedCheck: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckText: {
    color: '#000',
    fontSize: 12,
    // Using Typography component weight
  },
  // Info
  infoSection: {
    gap: 10,
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBullet: {
    color: Colors.accent.primary,
    marginTop: 2,
  },
  // Bottom CTA
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.page,
    paddingTop: 20,
  },
  bottomGradient: {
    ...StyleSheet.absoluteFillObject,
    top: -40,
  },
  bottomContent: {
    gap: 12,
  },
  selectedSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyButton: {
    width: '100%',
  },
  // Modal
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
    fontSize: 36,
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
  },
  modalButton: {
    width: '100%',
  },
});

export default BuyTokensScreen;

