import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Extrapolate,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProfile, useSessionStore } from '../src/state/useSessionStore';
import { useTranslation } from '../src/hooks/useTranslation';
import { GlassCard } from '../src/ui/GlassCard';
import { IconButton } from '../src/ui/IconButton';
import { AppIcon } from '../src/utils/iconHelper';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { BorderRadius, Colors, Spacing } from '../src/ui/theme';
import {
  BodyMedium,
  HeadlineMedium,
  HeadlineSmall,
  LabelMedium,
  LabelSmall
} from '../src/ui/Typography';

const { width } = Dimensions.get('window');

const SelectProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const profiles = useSessionStore((s) => s.profiles);
  const activeProfileId = useSessionStore((s) => s.activeProfileId);
  const addProfile = useSessionStore((s) => s.addProfile);
  const removeProfile = useSessionStore((s) => s.removeProfile);
  const setActiveProfileId = useSessionStore((s) => s.setActiveProfileId);
  const setSelectedProfileId = useSessionStore((s) => s.setSelectedProfileId);

  const handleClose = () => {
    router.back();
  };

  const handleSelectProfile = (profile: UserProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedId(profile.id);
  };

  const handleContinue = () => {
    if (!selectedId) return;
    
    const profile = profiles.find(p => p.id === selectedId);
    if (!profile) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Set selected profile and navigate to create screen
    setSelectedProfileId(profile.id);
    setActiveProfileId(profile.id);
    router.push('/create');
  };

  const handleDeleteProfile = (profile: UserProfile) => {
    Alert.alert(
      'Profili Sil',
      `"${profile.name}" profilini silmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            removeProfile(profile.id);
            if (selectedId === profile.id) {
              setSelectedId(null);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="home"
          onPress={handleClose}
          accessibilityLabel="Geri"
          variant="glass"
          size="sm"
        />
        <HeadlineMedium>{t('selectProfile.title')}</HeadlineMedium>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info */}
        <Animated.View entering={FadeIn.delay(100)}>
          <BodyMedium color="secondary" style={styles.infoText}>
            {t('selectProfile.info')}
          </BodyMedium>
        </Animated.View>

        {/* Create Profile Options */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.createSection}
        >
          <LabelMedium style={styles.sectionLabel}>{t('selectProfile.addNewProfile')}</LabelMedium>
          
          <Pressable onPress={() => router.push('/add-profile')}>
            <GlassCard style={styles.addProfileCard}>
              <View style={styles.addProfileContent}>
                <View style={styles.addProfileIconContainer}>
                  <AppIcon
                    name="plus-sign"
                    size={28}
                    color={Colors.accent.primary}
                    weight="bold"
                  />
                </View>
                <View style={styles.addProfileText}>
                  <LabelMedium>{t('selectProfile.addNewProfile')}</LabelMedium>
                  <LabelSmall color="secondary">{t('selectProfile.addProfileSubtitle')}</LabelSmall>
                </View>
                <AppIcon
                  name="chevron-forward"
                  size={20}
                  color={Colors.text.secondary}
                />
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* Existing Profiles */}
        {profiles.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.profilesSection}
          >
            <LabelMedium style={styles.sectionLabel}>
              {t('selectProfile.myProfiles')} ({profiles.length})
            </LabelMedium>

            <View style={styles.profilesGrid}>
              {profiles.map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isSelected={selectedId === profile.id}
                  onSelect={() => handleSelectProfile(profile)}
                  onDelete={() => handleDeleteProfile(profile)}
                  delay={index * 80}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {profiles.length === 0 && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <GlassCard style={styles.emptyCard}>
              <AppIcon
                name="profile"
                size={64}
                color={Colors.text.tertiary}
              />
              <HeadlineSmall style={styles.emptyTitle}>
                {t('selectProfile.noProfilesYet')}
              </HeadlineSmall>
              <BodyMedium color="secondary" style={styles.emptyText}>
                {t('selectProfile.createFirstProfile')}
              </BodyMedium>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {selectedId && (
        <Animated.View 
          entering={FadeIn}
          style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 34) + 16 }]}
        >
          <LinearGradient
            colors={['transparent', Colors.dark.background]}
            style={styles.bottomGradient}
          />
          <PrimaryButton
            title={t('selectProfile.continue')}
            onPress={handleContinue}
          />
        </Animated.View>
      )}
    </View>
  );
};

// Profile Card Component with flip animation
type ProfileCardProps = {
  profile: UserProfile;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  delay: number;
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isSelected,
  onSelect,
  onDelete,
  delay,
}) => {
  const mainPhoto = profile.photos[0];
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateY: `${rotation.value}deg` },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      scale.value,
      [1, 1.02],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity: isSelected ? 1 : glowOpacity,
    };
  });

  const handlePress = () => {
    // Flip + scale animation
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1.02),
      withSpring(1)
    );
    rotation.value = withSequence(
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    onSelect();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onDelete();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable onPress={handlePress} onLongPress={handleLongPress}>
        <Animated.View style={animatedStyle}>
          <GlassCard
            style={StyleSheet.flatten([
              styles.profileCard,
              isSelected ? styles.profileCardSelected : {},
            ])}
          >
            {/* Glow Effect */}
            {isSelected && (
              <Animated.View style={[styles.glowEffect, glowStyle]} />
            )}

            <View style={styles.profileImageContainer}>
              {mainPhoto ? (
                <Image
                  source={{ uri: mainPhoto.uri }}
                  style={styles.profileImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              ) : (
                <AppIcon
                  name="profile"
                  size={48}
                  color={Colors.text.tertiary}
                />
              )}
            </View>

            <View style={styles.profileInfo}>
              <LabelMedium numberOfLines={1}>{profile.name}</LabelMedium>
              {profile.gender && (
                <LabelSmall color="secondary">
                  {profile.gender === 'male' ? '👨' : profile.gender === 'female' ? '👩' : '🧑'}
                </LabelSmall>
              )}
            </View>

            {/* Selected Check */}
            {isSelected && (
              <View style={styles.selectedBadge}>
                <LabelSmall style={styles.checkIcon}>✓</LabelSmall>
              </View>
            )}
          </GlassCard>
        </Animated.View>
      </Pressable>
    </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 24,
  },
  infoText: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  createSection: {
    gap: 12,
  },
  sectionLabel: {
    marginBottom: 4,
  },
  addProfileCard: {
    padding: 0,
  },
  addProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  addProfileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProfileText: {
    flex: 1,
    gap: 4,
  },
  profilesSection: {
    gap: 12,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profileCard: {
    width: (width - Spacing.page * 2 - 12) / 2,
    padding: 10,
    position: 'relative',
    overflow: 'visible',
  },
  profileCardSelected: {
    borderColor: Colors.accent.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(181, 255, 31, 0.06)',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BorderRadius.lg + 4,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  profileImageContainer: {
    aspectRatio: 0.8,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '50%',
    height: '50%',
    alignSelf: 'center',
    marginTop: '25%',
    opacity: 0.4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  checkIcon: {
    color: Colors.dark.background,
    fontSize: 16,
    // Using Typography component weight
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    opacity: 0.5,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.page,
    paddingTop: 16,
  },
  bottomGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 60,
  },
});

export default SelectProfileScreen;
