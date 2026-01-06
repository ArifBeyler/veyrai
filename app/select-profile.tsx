import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
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
import { GlassCard } from '../src/ui/GlassCard';
import { IconButton } from '../src/ui/IconButton';
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
    
    // If no gender, go to profile details
    if (!profile.gender) {
      setSelectedProfileId(profile.id);
      router.push({
        pathname: '/profile-details',
        params: { profileId: profile.id },
      });
    } else {
      // Has gender, ready to go
      setSelectedProfileId(profile.id);
      setActiveProfileId(profile.id);
      router.back();
    }
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

  const createProfileAndNavigate = (imageUri: string) => {
    const newProfileId = Date.now().toString();
    const newProfile: UserProfile = {
      id: newProfileId,
      name: `Profil ${profiles.length + 1}`,
      photos: [
        {
          id: Date.now().toString(),
          uri: imageUri,
          kind: 'front',
          createdAt: new Date(),
        },
      ],
      isDefault: profiles.length === 0,
      createdAt: new Date(),
    };

    addProfile(newProfile);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Auto-select the new profile
    setSelectedId(newProfileId);
    
    // Navigate to profile details for gender
    router.push({
      pathname: '/profile-details',
      params: { profileId: newProfileId },
    });
  };

  const handleCreateProfile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createProfileAndNavigate(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createProfileAndNavigate(result.assets[0].uri);
    }
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
          icon={require('../full3dicons/images/home.png')}
          onPress={handleClose}
          accessibilityLabel="Geri"
          variant="glass"
          size="sm"
        />
        <HeadlineMedium>Profil Seç</HeadlineMedium>
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
            Try-on için profilini seç veya yeni profil oluştur
          </BodyMedium>
        </Animated.View>

        {/* Create Profile Options */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.createSection}
        >
          <LabelMedium style={styles.sectionLabel}>Yeni Profil Ekle</LabelMedium>
          
          <View style={styles.createOptions}>
            <CreateCard
              icon={require('../full3dicons/images/camera.png')}
              label="Fotoğraf Çek"
              onPress={handleTakePhoto}
            />
            <CreateCard
              icon={require('../full3dicons/images/photo.png')}
              label="Galeriden Seç"
              onPress={handleCreateProfile}
            />
          </View>
        </Animated.View>

        {/* Existing Profiles */}
        {profiles.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.profilesSection}
          >
            <LabelMedium style={styles.sectionLabel}>
              Profillerim ({profiles.length})
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
              <Image
                source={require('../full3dicons/images/profile.png')}
                style={styles.emptyIcon}
                resizeMode="contain"
              />
              <HeadlineSmall style={styles.emptyTitle}>
                Henüz profil yok
              </HeadlineSmall>
              <BodyMedium color="secondary" style={styles.emptyText}>
                Fotoğrafını ekleyerek ilk profilini oluştur
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
            title="Devam Et"
            onPress={handleContinue}
          />
        </Animated.View>
      )}
    </View>
  );
};

// Create Card Component
type CreateCardProps = {
  icon: any;
  label: string;
  onPress: () => void;
};

const CreateCard: React.FC<CreateCardProps> = ({ icon, label, onPress }) => {
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
    <Pressable onPress={handlePress} style={styles.createCardWrapper}>
      <Animated.View style={animatedStyle}>
        <GlassCard style={styles.createCard}>
          <Image source={icon} style={styles.createIcon} resizeMode="contain" />
          <LabelMedium>{label}</LabelMedium>
        </GlassCard>
      </Animated.View>
    </Pressable>
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
                <Image
                  source={require('../full3dicons/images/profile.png')}
                  style={styles.profilePlaceholder}
                  resizeMode="contain"
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
  createOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  createCardWrapper: {
    flex: 1,
  },
  createCard: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  createIcon: {
    width: 48,
    height: 48,
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
    fontWeight: 'bold',
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
