import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppLanguage } from '../../src/hooks/useAppLanguage';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useSessionStore } from '../../src/state/useSessionStore';
import { GlassCard } from '../../src/ui/GlassCard';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { BorderRadius, Colors, Spacing } from '../../src/ui/theme';
import {
  BodyLarge,
  BodySmall,
  DisplaySmall,
  HeadlineMedium,
  HeadlineSmall,
  LabelMedium,
  LabelSmall
} from '../../src/ui/Typography';
import { supabase } from '../../src/services/supabase';
import { useTheme, getAllThemes, Theme, ThemeId } from '../../src/theme';

const { width } = Dimensions.get('window');

// Language config
const LANGUAGE_CONFIG: Record<string, { name: string; flag: string }> = {
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  en: { name: 'English', flag: '🇬🇧' },
  fr: { name: 'Français', flag: '🇫🇷' },
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

  React.useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      flagScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
      scale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 100 }));
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
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
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

// Theme Selector Modal Component
const ThemeSelectorModal = ({
  visible,
  onClose,
  currentThemeId,
  onSelectTheme,
}: {
  visible: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const themes = getAllThemes();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={themeModalStyles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={onClose}
          activeOpacity={1}
        />
        <Animated.View 
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={[themeModalStyles.container, { paddingBottom: insets.bottom + 20 }]}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#1a1a2e']}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Header */}
          <View style={themeModalStyles.header}>
            <HeadlineSmall>{t('profile.selectTheme')}</HeadlineSmall>
            <TouchableOpacity onPress={onClose} style={themeModalStyles.closeButton}>
              <BodyLarge color="secondary">✕</BodyLarge>
            </TouchableOpacity>
          </View>

          {/* Theme Grid */}
          <ScrollView 
            style={themeModalStyles.scrollView}
            contentContainerStyle={themeModalStyles.grid}
            showsVerticalScrollIndicator={false}
          >
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  themeModalStyles.themeItem,
                  currentThemeId === theme.id && themeModalStyles.themeItemSelected,
                ]}
                onPress={() => onSelectTheme(theme.id)}
                activeOpacity={0.7}
              >
                {/* Theme Preview Gradient */}
                <LinearGradient
                  colors={[theme.preview[0], theme.preview[1]]}
                  style={themeModalStyles.themePreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Accent Color Dot */}
                  <View style={[themeModalStyles.accentDot, { backgroundColor: theme.colors.accent }]} />
                </LinearGradient>
                
                {/* Theme Info */}
                <View style={themeModalStyles.themeInfo}>
                  <LabelMedium style={themeModalStyles.themeEmoji}>{theme.emoji}</LabelMedium>
                  <LabelSmall color={currentThemeId === theme.id ? 'accent' : 'primary'}>
                    {theme.name}
                  </LabelSmall>
                </View>

                {/* Selected Indicator */}
                {currentThemeId === theme.id && (
                  <View style={[themeModalStyles.selectedBadge, { backgroundColor: theme.colors.accent }]}>
                    <LabelSmall style={{ color: '#000', fontSize: 10 }}>✓</LabelSmall>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const themeModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  themeItem: {
    width: (Dimensions.get('window').width - 56) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeItemSelected: {
    borderColor: Colors.accent.primary,
  },
  themePreview: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  themeEmoji: {
    fontSize: 18,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setLang, resolvedLang, supportedLanguages } = useAppLanguage();
  const { theme, themeId, setTheme } = useTheme();
  const [showLanguageChangeToast, setShowLanguageChangeToast] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [transitionLang, setTransitionLang] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  
  // Auto-hide toast after 1.5 seconds
  useEffect(() => {
    if (showLanguageChangeToast) {
      const timer = setTimeout(() => {
        setShowLanguageChangeToast(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showLanguageChangeToast]);
  
  const isPremium = useSessionStore((s) => s.isPremium);
  const credits = useSessionStore((s) => s.credits);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const profiles = useSessionStore((s) => s.profiles);
  const activeProfileId = useSessionStore((s) => s.activeProfileId);
  // jobs dizisini doğrudan kullan (getter yerine) - reaktif güncellemeler için
  const jobs = useSessionStore((s) => s.jobs);
  const garments = useSessionStore((s) => s.garments);
  const totalGenerationsCount = useSessionStore((s) => s.totalGenerationsCount);
  const clearUserData = useSessionStore((s) => s.clearUserData);
  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);
  const loadSampleGarments = useSessionStore((s) => s.loadSampleGarments);

  const hasCredits = !freeCreditsUsed || isPremium;
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const totalPhotos = profiles.reduce((acc, p) => acc + p.photos.length, 0);
  // Galerideki mevcut görseller
  const galleryImagesCount = jobs.filter((g) => 
    g.status === 'completed' && g.resultImageUrl
  ).length;

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/paywall');
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Supabase'den çıkış yap
            await supabase.auth.signOut();
            clearUserData();
            setHasCompletedOnboarding(false);
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handleRefreshGarments = () => {
    Alert.alert(
      'Kıyafetleri Yenile',
      'Yeni eklenen örnek kıyafetler ve kombinler yüklenecek.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Yenile',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await loadSampleGarments();
            Alert.alert('Başarılı', 'Kıyafetler güncellendi!');
          },
        },
      ]
    );
  };

  const handlePrivacy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/privacy');
  };

  const handleSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/support');
  };

  const handleBuyTokens = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/buy-tokens');
  };

  const handleEditProfile = () => {
    // Profil yönetim sayfasına git
    router.push('/select-profile');
  };

  const handleChangeLanguage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert(
      t('profile.selectLanguage'),
      '',
      [
        ...supportedLanguages.map((lang) => ({
          text: `${LANGUAGE_CONFIG[lang].flag} ${LANGUAGE_CONFIG[lang].name}`,
          onPress: () => handleSelectLanguage(lang),
          style: resolvedLang === lang ? 'default' : undefined,
        })),
        { text: t('common.cancel'), style: 'cancel' },
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

  const handleOpenThemeSelector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowThemeModal(true);
  };

  const handleSelectTheme = async (id: ThemeId) => {
    if (id === themeId) {
      setShowThemeModal(false);
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setTheme(id);
    setShowThemeModal(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as unknown as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Language Transition Overlay */}
      <LanguageTransitionOverlay
        isVisible={isChangingLanguage}
        flag={transitionLang ? LANGUAGE_CONFIG[transitionLang]?.flag || '🌐' : '🌐'}
        languageName={transitionLang ? LANGUAGE_CONFIG[transitionLang]?.name || '' : ''}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <DisplaySmall>{t('profile.title')}</DisplaySmall>
        </Animated.View>

        {/* Profile Card - Hero Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.profileCard}>
            <LinearGradient
              colors={[Colors.accent.primaryDim + '20', 'transparent']}
              style={styles.profileGradient}
            />
            
            <TouchableOpacity 
              onPress={handleEditProfile}
              activeOpacity={0.8}
              style={styles.profileContent}
            >
              {/* Profile Photo */}
              <View style={styles.profilePhotoContainer}>
                {activeProfile?.photos[0] ? (
                  <Image
                    source={{ uri: activeProfile.photos[0].uri }}
                    style={styles.profilePhoto}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={styles.profilePhotoPlaceholder}>
                    <Image
                      source={require('../../full3dicons/images/profile-icon.png')}
                      style={styles.profilePhotoIcon}
                      resizeMode="contain"
                    />
                  </View>
                )}
                {(isPremium || credits > 0) && (
                  <View style={[styles.premiumBadge, { backgroundColor: theme.colors.accent }]}>
                    <Image
                      source={require('../../full3dicons/images/sparkle.png')}
                      style={styles.premiumIcon}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>

              {/* Profile Info */}
              <View style={styles.profileInfo}>
                <HeadlineMedium style={styles.profileName}>
                  {activeProfile?.name || t('profile.addProfile')}
                </HeadlineMedium>
                <BodySmall color="secondary">
                  {activeProfile?.gender === 'male' ? t('profile.male') : activeProfile?.gender === 'female' ? t('profile.female') : t('profile.profile')}
                </BodySmall>
                
                {/* Quick Stats */}
                <View style={styles.quickStats}>
                  <View style={styles.quickStat}>
                    <LabelSmall color="accent">{profiles.length}</LabelSmall>
                    <LabelSmall color="tertiary" style={styles.quickStatLabel}>{t('profile.stats.profiles')}</LabelSmall>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <LabelSmall color="accent">{totalGenerationsCount}</LabelSmall>
                    <LabelSmall color="tertiary" style={styles.quickStatLabel}>{t('profile.stats.results')}</LabelSmall>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <LabelSmall color="accent">{garments.length}</LabelSmall>
                    <LabelSmall color="tertiary" style={styles.quickStatLabel}>{t('profile.stats.garments')}</LabelSmall>
                  </View>
                </View>
              </View>

              {/* Edit Icon */}
              <View style={styles.editIconContainer}>
                <Image
                  source={require('../../full3dicons/images/profile-icon.png')}
                  style={styles.editIcon}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Subscription Status - Show premium card if user has credits or is premium */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          {(isPremium || credits > 0) ? (
            <GlassCard style={[styles.subscriptionCardPremium, { borderColor: theme.colors.accent }]}>
              <View style={styles.subscriptionHeader}>
                <View style={[styles.premiumIconContainer, { backgroundColor: theme.colors.accentDim }]}>
                  <Image
                    source={require('../../full3dicons/images/sparkle.png')}
                    style={[styles.subscriptionIcon, { tintColor: theme.colors.accent }]}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.subscriptionText}>
                  <LabelMedium>{t('profile.premiumMember')}</LabelMedium>
                  <LabelSmall color="secondary">{credits} {t('home.credit')}</LabelSmall>
                </View>
              </View>
            </GlassCard>
          ) : (
            <View style={styles.freePlanContainer}>
              <View style={styles.freePlanContent}>
                <View style={styles.freePlanLeft}>
                  <View style={styles.freePlanIconContainer}>
                    <Image
                      source={require('../../full3dicons/images/sparkle.png')}
                      style={styles.freePlanIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.freePlanText}>
                    <LabelMedium>{t('profile.freePlan')}</LabelMedium>
                    <LabelSmall color="secondary">
                      {hasCredits ? t('profile.oneFreeCredit') : t('profile.noCredits')}
                    </LabelSmall>
                  </View>
                </View>
                <PrimaryButton
                  title={t('profile.upgradeToPremium')}
                  onPress={handleUpgrade}
                  size="sm"
                  style={styles.upgradeButtonInline}
                />
              </View>
            </View>
          )}
        </Animated.View>

        {/* Stats - Compact Single Row */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.statsContainer}
        >
          <GlassCard style={styles.statsCard}>
            <View style={styles.statsRow}>
              <StatItem 
                icon="👤"
                value={profiles.length}
                label={t('profile.stats.profiles')}
                color="#A855F7"
              />
              <View style={styles.statDivider} />
              <StatItem 
                icon="✨"
                value={totalGenerationsCount}
                label={t('profile.stats.combinations')}
                color="#10B981"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(650).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>{t('profile.quickActions')}</HeadlineSmall>
          
          <GlassCard style={styles.actionsCard}>
            <ActionItem
              icon={require('../../full3dicons/images/profile-icon.png')}
              title={t('profile.manageProfiles')}
              subtitle={t('profile.profilesCount', { count: profiles.length })}
              onPress={() => router.push('/select-profile')}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/photo.png')}
              title={t('profile.goToGallery')}
              subtitle={t('profile.imagesCount', { count: galleryImagesCount })}
              onPress={() => router.push('/(tabs)/gallery')}
            />
          </GlassCard>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>{t('profile.support')}</HeadlineSmall>

          <GlassCard style={styles.settingsCard}>
            <ActionItem
              icon={require('../../full3dicons/images/sparkle.png')}
              title={t('profile.helpAndSupport')}
              onPress={handleSupport}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/sparkle.png')}
              title={t('profile.buyTokens')}
              subtitle={t('profile.buyTokensSubtitle')}
              onPress={handleBuyTokens}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/profile-icon.png')}
              title={t('profile.privacyPolicy')}
              onPress={handlePrivacy}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/ai-sparkle.png')}
              title={t('profile.changeLanguage')}
              subtitle={resolvedLang === 'tr' ? 'Türkçe' : resolvedLang === 'en' ? 'English' : 'Français'}
              onPress={handleChangeLanguage}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/sparkle.png')}
              title={t('profile.changeTheme')}
              subtitle={`${theme.emoji} ${theme.name}`}
              onPress={handleOpenThemeSelector}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/wardrobe.png')}
              title="Kıyafetleri Yenile"
              subtitle="Yeni kombinleri yükle"
              onPress={handleRefreshGarments}
            />
          </GlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(750).springify()}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
              style={styles.logoutGradient}
            />
            <Image
              source={require('../../full3dicons/images/home.png')}
              style={styles.logoutIcon}
              resizeMode="contain"
            />
            <LabelMedium color="error">{t('profile.logout')}</LabelMedium>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <Animated.View
          entering={FadeInDown.delay(800).springify()}
          style={styles.versionContainer}
        >
          <BodySmall color="tertiary">Wearify v1.0.0</BodySmall>
        </Animated.View>
      </ScrollView>

      {/* Language Change Toast */}
      {showLanguageChangeToast && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={[styles.toastContainer, { paddingTop: insets.top + 60 }]}
        >
          <GlassCard style={styles.toastCard}>
            <View style={styles.toastContent}>
              <Image
                source={require('../../full3dicons/images/sparkle.png')}
                style={styles.toastIcon}
                resizeMode="contain"
              />
              <LabelMedium>{t('profile.changingLanguage')}</LabelMedium>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentThemeId={themeId}
        onSelectTheme={handleSelectTheme}
      />
    </View>
  );
};

type StatItemProps = {
  icon: string;
  value: number;
  label: string;
  color: string;
};

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
  return (
    <View style={styles.statItem}>
      <LabelMedium style={styles.statItemIcon}>{icon}</LabelMedium>
      <View style={styles.statItemText}>
        <LabelMedium style={{ color, fontSize: 20, fontWeight: '600', lineHeight: 24 }}>{value}</LabelMedium>
        <LabelSmall color="tertiary" style={styles.statItemLabel}>{label}</LabelSmall>
      </View>
    </View>
  );
};

type ActionItemProps = {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.actionItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Image
      source={icon}
      style={styles.actionIcon}
      resizeMode="contain"
    />
    <View style={styles.actionText}>
      <LabelMedium>{title}</LabelMedium>
      {subtitle && <LabelSmall color="secondary">{subtitle}</LabelSmall>}
    </View>
    <View style={styles.actionArrow}>
      <BodySmall color="secondary">›</BodySmall>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 20,
  },
  header: {
    marginBottom: 8,
  },
  // Profile Card
  profileCard: {
    padding: 0,
    overflow: 'hidden',
  },
  profileGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  profilePhotoContainer: {
    position: 'relative',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
  },
  profilePhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoIcon: {
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  premiumIcon: {
    width: 16,
    height: 16,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 22,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  quickStat: {
    alignItems: 'center',
    gap: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.dark.strokeLight,
  },
  quickStatLabel: {
    fontSize: 10,
  },
  editIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: 18,
    height: 18,
    opacity: 0.6,
  },
  // Subscription
  subscriptionCardPremium: {
    padding: 16,
    borderColor: Colors.accent.primary,
    borderWidth: 1,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionIcon: {
    width: 24,
    height: 24,
  },
  subscriptionText: {
    flex: 1,
    gap: 2,
  },
  // Free Plan - Modern Design
  freePlanContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.stroke,
    overflow: 'hidden',
  },
  freePlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  freePlanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  freePlanIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.15)', // Yellow tint
    alignItems: 'center',
    justifyContent: 'center',
  },
  freePlanIcon: {
    width: 24,
    height: 24,
    tintColor: '#FBBF24',
  },
  freePlanText: {
    flex: 1,
    gap: 2,
  },
  upgradeButtonInline: {
    flexShrink: 0,
  },
  // Stats
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  statsContainer: {
    gap: 0,
  },
  statsCard: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
    paddingVertical: 4,
  },
  statItemIcon: {
    fontSize: 22,
    lineHeight: 28,
    paddingTop: 2,
  },
  statItemText: {
    alignItems: 'flex-start',
    gap: 2,
    flexShrink: 1,
    justifyContent: 'center',
  },
  statItemLabel: {
    fontSize: 11,
    flexShrink: 1,
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.strokeLight,
    marginHorizontal: 8,
  },
  // Actions
  actionsCard: {
    padding: 0,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  actionIcon: {
    width: 24,
    height: 24,
    opacity: 0.8,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionArrow: {
    width: 24,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.strokeLight,
    marginHorizontal: 16,
  },
  settingsCard: {
    padding: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    overflow: 'hidden',
  },
  logoutGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    tintColor: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  toastCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minWidth: 200,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastIcon: {
    width: 20,
    height: 20,
  },
  // Language Transition Overlay
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
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

export default ProfileScreen;
