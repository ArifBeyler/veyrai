import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineMedium,
  BodyMedium,
  LabelMedium,
  LabelSmall,
} from '../src/ui/Typography';
import { GlassCard } from '../src/ui/GlassCard';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { AppIcon } from '../src/utils/iconHelper';
import { IconButton } from '../src/ui/IconButton';
import { useSessionStore } from '../src/state/useSessionStore';
import { useTranslation } from '../src/hooks/useTranslation';
import { useTheme } from '../src/theme';

const { width } = Dimensions.get('window');

const AddProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const profiles = useSessionStore((s) => s.profiles);
  const addProfile = useSessionStore((s) => s.addProfile);
  const setActiveProfileId = useSessionStore((s) => s.setActiveProfileId);
  const setSelectedProfileId = useSessionStore((s) => s.setSelectedProfileId);
  
  const [profileName, setProfileName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const imageScale = useSharedValue(1);
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        t('addProfile.cameraPermissionTitle'),
        t('addProfile.cameraPermissionMessage')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Pulse animation
      imageScale.value = withSpring(1.05, {}, () => {
        imageScale.value = withSpring(1);
      });
    }
  };

  const handleSelectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Pulse animation
      imageScale.value = withSpring(1.05, {}, () => {
        imageScale.value = withSpring(1);
      });
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    if (!profileName.trim()) {
      Alert.alert(
        t('addProfile.nameRequiredTitle'),
        t('addProfile.nameRequiredMessage')
      );
      return;
    }

    if (!photoUri) {
      Alert.alert(
        t('addProfile.photoRequiredTitle'),
        t('addProfile.photoRequiredMessage')
      );
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newProfileId = Date.now().toString();
    const newProfile = {
      id: newProfileId,
      name: profileName.trim(),
      photos: [
        {
          id: Date.now().toString(),
          uri: photoUri,
          kind: 'front' as const,
          createdAt: new Date(),
        },
      ],
      isDefault: profiles.length === 0,
      createdAt: new Date(),
    };

    addProfile(newProfile);
    setActiveProfileId(newProfileId);
    setSelectedProfileId(newProfileId);

    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }, 300);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.backgroundGradient as unknown as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="close"
          onPress={handleClose}
          accessibilityLabel={t('common.close')}
          variant="glass"
          size="sm"
        />
        <HeadlineMedium>{t('addProfile.title')}</HeadlineMedium>
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
        {/* Photo Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.photoSection}>
            <Animated.View style={[styles.photoContainer, imageAnimatedStyle]}>
              {photoUri ? (
                <>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.photo}
                    contentFit="cover"
                    transition={200}
                  />
                  <Pressable
                    style={styles.removePhotoButton}
                    onPress={handleRemovePhoto}
                  >
                    <AppIcon
                      name="cross"
                      size={16}
                      color={Colors.text.inverse}
                      weight="bold"
                    />
                  </Pressable>
                </>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <AppIcon
                    name="camera"
                    size={48}
                    color={Colors.text.tertiary}
                  />
                  <LabelSmall color="tertiary" style={styles.photoPlaceholderText}>
                    {t('addProfile.addPhoto')}
                  </LabelSmall>
                </View>
              )}
            </Animated.View>

            {/* Photo Action Buttons */}
            {!photoUri ? (
              <View style={styles.photoActions}>
                <Pressable
                  style={styles.photoActionButton}
                  onPress={handleTakePhoto}
                >
                  <GlassCard style={styles.photoActionCard}>
                    <AppIcon
                      name="camera"
                      size={24}
                      color={Colors.accent.primary}
                    />
                    <LabelMedium style={styles.photoActionText}>
                      {t('addProfile.takePhoto')}
                    </LabelMedium>
                  </GlassCard>
                </Pressable>
                <Pressable
                  style={styles.photoActionButton}
                  onPress={handleSelectFromGallery}
                >
                  <GlassCard style={styles.photoActionCard}>
                    <AppIcon
                      name="gallery"
                      size={24}
                      color={Colors.accent.primary}
                    />
                    <LabelMedium style={styles.photoActionText}>
                      {t('addProfile.selectFromGallery')}
                    </LabelMedium>
                  </GlassCard>
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoActions}>
                <Pressable
                  style={styles.photoActionButton}
                  onPress={handleTakePhoto}
                >
                  <GlassCard style={styles.photoActionCard}>
                    <AppIcon
                      name="camera"
                      size={20}
                      color={Colors.text.secondary}
                    />
                    <LabelSmall color="secondary">
                      {t('addProfile.changePhoto')}
                    </LabelSmall>
                  </GlassCard>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Name Input Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.nameSection}>
            <LabelMedium style={styles.label}>
              {t('addProfile.profileName')}
            </LabelMedium>
            <GlassCard style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('addProfile.profileNamePlaceholder')}
                placeholderTextColor={Colors.text.tertiary}
                value={profileName}
                onChangeText={setProfileName}
                autoFocus={false}
                maxLength={30}
              />
            </GlassCard>
            <LabelSmall color="tertiary" style={styles.hint}>
              {t('addProfile.nameHint')}
            </LabelSmall>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton
          title={t('addProfile.createProfile')}
          onPress={handleSave}
          loading={isLoading}
          disabled={!profileName.trim() || !photoUri}
        />
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 32,
    paddingTop: 24,
  },
  photoSection: {
    alignItems: 'center',
    gap: 20,
  },
  photoContainer: {
    width: width * 0.5,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.dark.surface,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.accent.primaryDim,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  photoPlaceholderText: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  photoActionButton: {
    flex: 1,
  },
  photoActionCard: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  photoActionText: {
    textAlign: 'center',
  },
  nameSection: {
    gap: 12,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    padding: 0,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text.primary,
    fontFamily: 'SF Pro Text',
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  bottomActions: {
    paddingHorizontal: Spacing.page,
    paddingTop: 16,
  },
});

export default AddProfileScreen;
