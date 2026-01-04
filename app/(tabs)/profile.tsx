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
  withRepeat,
  withTiming,
  interpolate,
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

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const isPremium = useSessionStore((s) => s.isPremium);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const profiles = useSessionStore((s) => s.profiles);
  const generations = useSessionStore((s) => s.generations);
  const garments = useSessionStore((s) => s.garments);
  const clearUserData = useSessionStore((s) => s.clearUserData);
  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);

  const hasCredits = !freeCreditsUsed || isPremium;
  const totalPhotos = profiles.reduce((acc, p) => acc + p.photos.length, 0);
  const completedGenerations = generations.filter((g) => g.status === 'completed').length;

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

  const handleSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Open support URL
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

        {/* Subscription Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard
            style={[
              styles.subscriptionCard,
              isPremium && styles.subscriptionCardPremium,
            ]}
          >
            <LinearGradient
              colors={
                isPremium
                  ? [Colors.accent.primaryDim, 'transparent']
                  : ['transparent', 'transparent']
              }
              style={styles.subscriptionGradient}
            />
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <Image
                  source={require('../../full3dicons/images/sparkle.png')}
                  style={styles.subscriptionIcon}
                  resizeMode="contain"
                />
                <View>
                  <HeadlineMedium>
                    {isPremium ? 'Premium Üye' : 'Ücretsiz Plan'}
                  </HeadlineMedium>
                  <BodySmall color="secondary">
                    {isPremium
                      ? 'Sınırsız deneme hakkı'
                      : hasCredits
                      ? '1 ücretsiz kredi'
                      : 'Kredi yok'}
                  </BodySmall>
                </View>
              </View>

              {!isPremium && (
                <PrimaryButton
                  title="Premium'a Yükselt"
                  onPress={handleUpgrade}
                  size="md"
                />
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Stats - Redesigned */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.statsContainer}
        >
          <HeadlineSmall style={styles.sectionTitle}>İstatistikler</HeadlineSmall>
          
          <View style={styles.statsGrid}>
            <StatCard 
              icon={require('../../full3dicons/images/profile-icon.png')}
              value={profiles.length}
              label="Profil"
              color="#A855F7"
              delay={350}
            />
            <StatCard 
              icon={require('../../full3dicons/images/camera.png')}
              value={totalPhotos}
              label="Fotoğraf"
              color="#06B6D4"
              delay={400}
            />
            <StatCard 
              icon={require('../../full3dicons/images/ai-sparkle.png')}
              value={generations.length}
              label="Deneme"
              color="#F59E0B"
              delay={450}
            />
            <StatCard 
              icon={require('../../full3dicons/images/photo.png')}
              value={completedGenerations}
              label="Başarılı"
              color="#10B981"
              delay={500}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(550).springify()}>
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
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>Destek</HeadlineSmall>

          <GlassCard style={styles.settingsCard}>
            <ActionItem
              icon={require('../../full3dicons/images/sparkle.png')}
              title="Yardım ve Destek"
              onPress={handleSupport}
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
        <Animated.View entering={FadeInDown.delay(700).springify()}>
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

type StatCardProps = {
  icon: any;
  value: number;
  label: string;
  color: string;
  delay: number;
};

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()}
      style={[animatedStyle]}
    >
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.statCardTouchable}
      >
        <LinearGradient
          colors={[`${color}20`, `${color}05`]}
          style={styles.statCardGradient}
        />
        <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
          <Image
            source={icon}
            style={styles.statIcon}
            resizeMode="contain"
          />
        </View>
        <HeadlineMedium style={{ color }}>{value}</HeadlineMedium>
        <LabelSmall color="secondary">{label}</LabelSmall>
      </TouchableOpacity>
    </Animated.View>
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
    gap: 24,
  },
  header: {
    marginBottom: 8,
  },
  subscriptionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  subscriptionCardPremium: {
    borderColor: Colors.accent.primary,
  },
  subscriptionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  subscriptionContent: {
    padding: 20,
    gap: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statsContainer: {
    gap: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCardTouchable: {
    width: (width - Spacing.page * 2 - 12) / 2,
    backgroundColor: Colors.dark.surfaceDim,
    borderRadius: BorderRadius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
    overflow: 'hidden',
  },
  statCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
  },
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
    tintColor: Colors.status.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
});

export default ProfileScreen;
