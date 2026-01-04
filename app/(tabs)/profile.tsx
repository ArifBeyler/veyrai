import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
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

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const isPremium = useSessionStore((s) => s.isPremium);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const userPhotos = useSessionStore((s) => s.userPhotos);
  const generations = useSessionStore((s) => s.generations);
  const preferences = useSessionStore((s) => s.preferences);
  const clearUserPhotos = useSessionStore((s) => s.clearUserPhotos);

  const hasCredits = !freeCreditsUsed || isPremium;

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/paywall');
  };

  const handleDeletePhotos = () => {
    Alert.alert(
      'Fotoğrafları Sil',
      'Tüm fotoğraflarınız silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            clearUserPhotos();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handlePrivacy = () => {
    // TODO: Open privacy policy
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSupport = () => {
    // TODO: Open support
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        {/* Stats */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.statsRow}
        >
          <GlassCard style={styles.statCard}>
            <Image
              source={require('../../full3dicons/images/camera.png')}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <HeadlineSmall color="accent">{userPhotos.length}</HeadlineSmall>
            <LabelSmall color="secondary">Fotoğraf</LabelSmall>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Image
              source={require('../../full3dicons/images/ai-sparkle.png')}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <HeadlineSmall color="accent">{generations.length}</HeadlineSmall>
            <LabelSmall color="secondary">Deneme</LabelSmall>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Image
              source={require('../../full3dicons/images/photo.png')}
              style={styles.statIcon}
              resizeMode="contain"
            />
            <HeadlineSmall color="accent">
              {generations.filter((g) => g.status === 'completed').length}
            </HeadlineSmall>
            <LabelSmall color="secondary">Başarılı</LabelSmall>
          </GlassCard>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>Tercihler</HeadlineSmall>
          <GlassCard style={styles.preferencesCard}>
            <PreferenceItem
              label="Stil"
              value={preferences.style.charAt(0).toUpperCase() + preferences.style.slice(1)}
            />
            <View style={styles.divider} />
            <PreferenceItem
              label="Arka Plan"
              value={preferences.backgroundMode === 'original' ? 'Orijinal' : 'Stüdyo'}
            />
            <View style={styles.divider} />
            <PreferenceItem
              label="Kalite"
              value={preferences.quality === 'normal' ? 'Normal' : 'HD'}
              isPremium={preferences.quality === 'hd'}
            />
          </GlassCard>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <HeadlineSmall style={styles.sectionTitle}>Ayarlar</HeadlineSmall>

          <GlassCard style={styles.settingsCard}>
            <SettingsItem
              icon={require('../../full3dicons/images/camera.png')}
              title="Fotoğrafları Yönet"
              subtitle={`${userPhotos.length} fotoğraf`}
              onPress={handleDeletePhotos}
              destructive
            />
          </GlassCard>

          <GlassCard style={styles.settingsCard}>
            <SettingsItem
              icon={require('../../full3dicons/images/profile-icon.png')}
              title="Gizlilik Politikası"
              onPress={handlePrivacy}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={require('../../full3dicons/images/sparkle.png')}
              title="Destek"
              onPress={handleSupport}
            />
          </GlassCard>
        </Animated.View>

        {/* Version */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.versionContainer}
        >
          <BodySmall color="tertiary">FIT-SWAP v1.0.0</BodySmall>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

type PreferenceItemProps = {
  label: string;
  value: string;
  isPremium?: boolean;
};

const PreferenceItem: React.FC<PreferenceItemProps> = ({
  label,
  value,
  isPremium,
}) => (
  <View style={styles.preferenceItem}>
    <LabelMedium color="secondary">{label}</LabelMedium>
    <View style={styles.preferenceValue}>
      <LabelMedium>{value}</LabelMedium>
      {isPremium && (
        <View style={styles.premiumBadge}>
          <LabelSmall color="accent">Premium</LabelSmall>
        </View>
      )}
    </View>
  </View>
);

type SettingsItemProps = {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
};

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  destructive,
}) => (
  <GlassCard
    style={styles.settingsItem}
    onPress={onPress}
    variant="default"
  >
    <Image
      source={icon}
      style={[styles.settingsIcon, destructive && styles.destructiveIcon]}
      resizeMode="contain"
    />
    <View style={styles.settingsText}>
      <LabelMedium color={destructive ? 'error' : 'primary'}>{title}</LabelMedium>
      {subtitle && <LabelSmall color="secondary">{subtitle}</LabelSmall>}
    </View>
  </GlassCard>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    gap: 4,
  },
  statIcon: {
    width: 28,
    height: 28,
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  preferencesCard: {
    padding: 0,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  preferenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.strokeLight,
    marginHorizontal: 16,
  },
  settingsCard: {
    padding: 0,
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    opacity: 0.7,
  },
  destructiveIcon: {
    tintColor: Colors.status.error,
  },
  settingsText: {
    flex: 1,
    gap: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;

