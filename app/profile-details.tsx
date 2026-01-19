import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineMedium,
  BodyMedium,
  LabelMedium,
} from '../src/ui/Typography';
import { GlassCard } from '../src/ui/GlassCard';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { useSessionStore } from '../src/state/useSessionStore';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

type Gender = 'male' | 'female' | 'other';

const ProfileDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { profileId, isUpdate } = useLocalSearchParams<{ profileId: string; isUpdate?: string }>();
  
  const profiles = useSessionStore((s) => s.profiles);
  const updateProfile = useSessionStore((s) => s.updateProfile);
  const setActiveProfileId = useSessionStore((s) => s.setActiveProfileId);

  const profile = profiles.find((p) => p.id === profileId);
  const isUpdateMode = isUpdate === 'true';
  
  const [gender, setGender] = useState<Gender | null>(profile?.gender || null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation
  const imageScale = useSharedValue(1);
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const handleGenderSelect = (g: Gender) => {
    setGender(g);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Pulse animation on profile image
    imageScale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  };

  const goBack = () => {
    if (isUpdateMode) {
      router.back();
    } else {
      router.back();
      router.back();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (profileId) {
      setActiveProfileId(profileId);
    }
    goBack();
  };

  const handleSave = () => {
    if (!profileId) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Update profile with gender only
    updateProfile(profileId, {
      gender: gender || undefined,
    });

    setActiveProfileId(profileId);

    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goBack();
    }, 300);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={handleSkip} style={styles.headerButton}>
          <LabelMedium color="secondary">{isUpdateMode ? t('profileDetails.cancel') : t('profileDetails.skip')}</LabelMedium>
        </Pressable>
        <HeadlineMedium>{t('profileDetails.title')}</HeadlineMedium>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        {/* Profile Preview with Animation */}
        <Animated.View 
          entering={FadeIn.delay(100)} 
          style={[styles.previewSection, imageAnimatedStyle]}
        >
          <View style={styles.profilePreview}>
            {profile?.photos[0] ? (
              <Image
                source={{ uri: profile.photos[0].uri }}
                style={styles.profileImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ) : (
              <Image
                source={require('../full3dicons/images/profile.png')}
                style={styles.placeholderImage}
                resizeMode="contain"
              />
            )}
            {/* Glow effect when selected */}
            {gender && (
              <View style={styles.selectedGlow} />
            )}
          </View>
          <BodyMedium color="secondary" style={styles.infoText}>
            {t('profileDetails.selectGenderForBetterResults')}
          </BodyMedium>
        </Animated.View>

        {/* Gender Selection - Big Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.genderSection}>
          <View style={styles.genderOptions}>
            <GenderCard
              label={t('profileDetails.male')}
              emoji="👨"
              selected={gender === 'male'}
              onPress={() => handleGenderSelect('male')}
            />
            <GenderCard
              label={t('profileDetails.female')}
              emoji="👩"
              selected={gender === 'female'}
              onPress={() => handleGenderSelect('female')}
            />
          </View>
        </Animated.View>
      </View>

      {/* Bottom Action */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton
          title={gender ? t('profileDetails.continue') : t('profileDetails.skip')}
          onPress={gender ? handleSave : handleSkip}
          loading={isLoading}
        />
      </View>
    </View>
  );
};

type GenderCardProps = {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
};

const GenderCard: React.FC<GenderCardProps> = ({
  label,
  emoji,
  selected,
  onPress,
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.genderCardWrapper}>
      <Animated.View style={animatedStyle}>
        <GlassCard
          style={[
            styles.genderCard,
            selected && styles.genderCardSelected,
          ]}
        >
          <View style={styles.emojiContainer}>
            <LabelMedium style={styles.genderEmoji}>{emoji}</LabelMedium>
          </View>
          <LabelMedium 
            color={selected ? 'primary' : 'secondary'}
            style={styles.genderLabel}
          >
            {label}
          </LabelMedium>
          {selected && (
            <View style={styles.checkMark}>
              <LabelMedium style={styles.checkIcon}>✓</LabelMedium>
            </View>
          )}
        </GlassCard>
      </Animated.View>
    </Pressable>
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
  headerButton: {
    width: 50,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.page,
    justifyContent: 'center',
    gap: 40,
  },
  previewSection: {
    alignItems: 'center',
    gap: 16,
  },
  profilePreview: {
    width: 140,
    height: 175,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '60%',
    height: '60%',
    alignSelf: 'center',
    marginTop: '20%',
    opacity: 0.4,
  },
  selectedGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.lg + 2,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  infoText: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  genderSection: {
    gap: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  genderCardWrapper: {
    width: (width - Spacing.page * 2 - 16) / 2,
  },
  genderCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 12,
    position: 'relative',
  },
  genderCardSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: 'rgba(181, 255, 31, 0.08)',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderEmoji: {
    fontSize: 32,
  },
  genderLabel: {
    fontSize: 16,
    // Using Typography component weight
  },
  checkMark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: Colors.dark.background,
    fontSize: 14,
    // Using Typography component weight
  },
  bottomActions: {
    paddingHorizontal: Spacing.page,
  },
});

export default ProfileDetailsScreen;
