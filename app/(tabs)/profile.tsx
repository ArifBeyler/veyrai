import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../../src/ui/theme';
import {
  DisplaySmall,
  HeadlineMedium,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../../src/ui/Typography';
import { GlassCard } from '../../src/ui/GlassCard';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { useSessionStore } from '../../src/state/useSessionStore';
import { useRevenueCat } from '../../src/hooks/useRevenueCat';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const isPremium = useSessionStore((s) => s.isPremium);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const profiles = useSessionStore((s) => s.profiles);
  const activeProfileId = useSessionStore((s) => s.activeProfileId);
  const generations = useSessionStore((s) => s.generations);
  const garments = useSessionStore((s) => s.garments);
  const clearUserData = useSessionStore((s) => s.clearUserData);
  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);

  const hasCredits = !freeCreditsUsed || isPremium;
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const totalPhotos = profiles.reduce((acc, p) => acc + p.photos.length, 0);
  // Galeri ile aynı mantık: hem completed hem de resultImageUrl olmalı
  const completedGenerations = generations.filter((g) => 
    g.status === 'completed' && g.resultImageUrl
  ).length;

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/paywall');
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Tüm verileriniz silinecek ve başlangıç ekranına yönlendirileceksiniz. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearUserData();
            setHasCompletedOnboarding(false);
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handlePrivacy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Open privacy policy URL
  };

  const { presentCustomerCenter } = useRevenueCat();

  const handleSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Open support URL
  };

  const handleCustomerCenter = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await presentCustomerCenter();
    } catch (error) {
      console.error('Customer Center error:', error);
    }
  };

  const handleEditProfile = () => {
    if (activeProfile) {
      router.push(`/profile-details?id=${activeProfile.id}`);
    } else {
      router.push('/select-profile');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
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
          <DisplaySmall>Profil</DisplaySmall>
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
                    resizeMode="cover"
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
                {isPremium && (
                  <View style={styles.premiumBadge}>
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
                  {activeProfile?.name || 'Profil Ekle'}
                </HeadlineMedium>
                <BodySmall color="secondary">
                  {activeProfile?.gender === 'male' ? 'Erkek' : activeProfile?.gender === 'female' ? 'Kadın' : 'Profil'}
                </BodySmall>
                
                {/* Quick Stats */}
                <View style={styles.quickStats}>
                  <View style={styles.quickStat}>
                    <LabelSmall color="accent">{profiles.length}</LabelSmall>
                    <LabelSmall color="tertiary" style={styles.quickStatLabel}>Profil</LabelSmall>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <LabelSmall color="accent">{completedGenerations}</LabelSmall>
                    <LabelSmall color="tertiary" style={styles.quickStatLabel}>Sonuç</LabelSmall>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <LabelSmall color="accent">{garments.length}</LabelSmall>
                    <LabelSmall color="tertiary" style={styles.quickStatLabel}>Kıyafet</LabelSmall>
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

        {/* Subscription Status */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard
            style={[
              styles.subscriptionCard,
              isPremium && styles.subscriptionCardPremium,
            ]}
          >
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <Image
                  source={require('../../full3dicons/images/sparkle.png')}
                  style={styles.subscriptionIcon}
                  resizeMode="contain"
                />
                <View style={styles.subscriptionText}>
                  <LabelMedium>
                    {isPremium ? 'Premium Üye' : 'Ücretsiz Plan'}
                  </LabelMedium>
                  <LabelSmall color="secondary">
                    {isPremium
                      ? 'Sınırsız deneme hakkı'
                      : hasCredits
                      ? '1 ücretsiz kredi'
                      : 'Kredi yok'}
                  </LabelSmall>
                </View>
              </View>

              {!isPremium && (
                <PrimaryButton
                  title="Premium'a Yükselt"
                  onPress={handleUpgrade}
                  size="sm"
                  style={styles.upgradeButton}
                />
              )}
            </View>
          </GlassCard>
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
                label="Profil"
                color="#A855F7"
              />
              <View style={styles.statDivider} />
              <StatItem 
                icon="✨"
                value={completedGenerations}
                label="Kombinleme"
                color="#10B981"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(650).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>Hızlı İşlemler</HeadlineSmall>
          
          <GlassCard style={styles.actionsCard}>
            <ActionItem
              icon={require('../../full3dicons/images/profile-icon.png')}
              title="Profilleri Yönet"
              subtitle={`${profiles.length} profil`}
              onPress={() => router.push('/select-profile')}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/photo.png')}
              title="Galeriye Git"
              subtitle={`${completedGenerations} görsel`}
              onPress={() => router.push('/(tabs)/gallery')}
            />
          </GlassCard>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(700).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>Destek</HeadlineSmall>

          <GlassCard style={styles.settingsCard}>
            <ActionItem
              icon={require('../../full3dicons/images/sparkle.png')}
              title="Yardım ve Destek"
              onPress={handleSupport}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/ai-sparkle.png')}
              title="Satın Alımları Yönet"
              onPress={handleCustomerCenter}
            />
            <View style={styles.divider} />
            <ActionItem
              icon={require('../../full3dicons/images/profile-icon.png')}
              title="Gizlilik Politikası"
              onPress={handlePrivacy}
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
            <LabelMedium color="error">Çıkış Yap</LabelMedium>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <Animated.View
          entering={FadeInDown.delay(800).springify()}
          style={styles.versionContainer}
        >
          <BodySmall color="tertiary">FIT-SWAP v1.0.0</BodySmall>
        </Animated.View>
      </ScrollView>
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
  subscriptionCard: {
    padding: 16,
  },
  subscriptionCardPremium: {
    borderColor: Colors.accent.primary,
  },
  subscriptionContent: {
    gap: 12,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subscriptionIcon: {
    width: 32,
    height: 32,
  },
  subscriptionText: {
    flex: 1,
    gap: 2,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
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
});

export default ProfileScreen;
