import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Garment, UserProfile, useSessionStore } from '../../src/state/useSessionStore';
import { GlassCard } from '../../src/ui/GlassCard';
import { IconButton } from '../../src/ui/IconButton';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { BorderRadius, Colors, Spacing } from '../../src/ui/theme';
import {
  BodyMedium,
  BodySmall,
  HeadlineMedium,
  LabelMedium,
  LabelSmall
} from '../../src/ui/Typography';

const { width } = Dimensions.get('window');

type Step = 'profile' | 'garment' | 'confirm';

const CreateScreen = () => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('profile');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  

  const profiles = useSessionStore((s) => s.profiles);
  const garments = useSessionStore((s) => s.garments);
  const addProfile = useSessionStore((s) => s.addProfile);
  const addGarment = useSessionStore((s) => s.addGarment);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const isPremium = useSessionStore((s) => s.isPremium);

  const hasCredits = !freeCreditsUsed || isPremium;

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  const selectedGarment = useMemo(
    () => garments.find((g) => g.id === selectedGarmentId),
    [garments, selectedGarmentId]
  );

  const handleClose = () => {
    router.back();
  };

  const handleSelectProfile = (profile: UserProfile) => {
    setSelectedProfileId(profile.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectGarment = (garment: Garment) => {
    setSelectedGarmentId(garment.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Profil ekleme - direkt galeri/kamera seçimi
  const handleAddProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Fotoğraf Çek', 'Galeriden Seç'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickProfileFromCamera();
          } else if (buttonIndex === 2) {
            pickProfileFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Profil Fotoğrafı',
        'Nasıl eklemek istersin?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Fotoğraf Çek', onPress: pickProfileFromCamera },
          { text: 'Galeriden Seç', onPress: pickProfileFromGallery },
        ]
      );
    }
  };

  const pickProfileFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Kamera izni vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createProfileFromUri(result.assets[0].uri);
    }
  };

  const pickProfileFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createProfileFromUri(result.assets[0].uri);
    }
  };

  const createProfileFromUri = (uri: string) => {
    const newProfileId = Date.now().toString();
    const newProfile: UserProfile = {
      id: newProfileId,
      name: `Profil ${profiles.length + 1}`,
      photos: [
        {
          id: Date.now().toString(),
          uri: uri,
          kind: 'front',
          createdAt: new Date(),
        },
      ],
      isDefault: profiles.length === 0,
      createdAt: new Date(),
    };

    addProfile(newProfile);
    setSelectedProfileId(newProfileId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Kıyafet ekleme - direkt galeri/kamera seçimi
  const handleAddGarment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Fotoğraf Çek', 'Galeriden Seç'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickGarmentFromCamera();
          } else if (buttonIndex === 2) {
            pickGarmentFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        'Kıyafet Fotoğrafı',
        'Nasıl eklemek istersin?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Fotoğraf Çek', onPress: pickGarmentFromCamera },
          { text: 'Galeriden Seç', onPress: pickGarmentFromGallery },
        ]
      );
    }
  };

  const pickGarmentFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Kamera izni vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createGarmentFromUri(result.assets[0].uri);
    }
  };

  const pickGarmentFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createGarmentFromUri(result.assets[0].uri);
    }
  };

  const createGarmentFromUri = (uri: string) => {
    const newGarmentId = Date.now().toString();
    const newGarment: Garment = {
      id: newGarmentId,
      title: `Kıyafet ${garments.length + 1}`,
      imageUri: uri,
      category: 'tops',
      isUserAdded: true,
      createdAt: new Date(),
    };

    addGarment(newGarment);
    setSelectedGarmentId(newGarmentId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Sonraki adıma geç
  const handleNextStep = useCallback(() => {
    if (step === 'profile' && selectedProfileId) {
      setStep('garment');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (step === 'garment' && selectedGarmentId) {
      setStep('confirm');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [step, selectedProfileId, selectedGarmentId]);

  const handlePrevStep = () => {
    if (step === 'garment') {
      setStep('profile');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (step === 'confirm') {
      setStep('garment');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGenerate = async () => {
    if (!hasCredits) {
      router.push('/paywall');
      return;
    }

    if (!selectedProfileId || !selectedGarmentId || !selectedProfile || !selectedGarment) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const humanImageUri = selectedProfile.photos[0]?.uri;
    const garmentImageUri = selectedGarment.imageUri;

    if (!humanImageUri || !garmentImageUri) {
      Alert.alert('Hata', 'Görsel bulunamadı');
      return;
    }

    const jobId = `job-${Date.now()}`;
    router.replace({
      pathname: '/generation/[id]',
      params: {
        id: jobId,
        humanImageUri: encodeURIComponent(humanImageUri),
        garmentImageUri: encodeURIComponent(garmentImageUri),
        gender: selectedProfile.gender || 'male',
      },
    });
  };

  const canProceed =
    (step === 'profile' && selectedProfileId) ||
    (step === 'garment' && selectedGarmentId) ||
    step === 'confirm';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon={require('../../full3dicons/images/home.png')}
          onPress={handleClose}
          accessibilityLabel="Kapat"
          variant="glass"
          size="sm"
        />
        <View style={styles.stepIndicator}>
          <StepDot active={step === 'profile'} completed={step !== 'profile'} />
          <StepDot active={step === 'garment'} completed={step === 'confirm'} />
          <StepDot active={step === 'confirm'} />
        </View>
        {hasCredits && (
          <View style={styles.creditBadge}>
            <Image
              source={require('../../full3dicons/images/sparkle.png')}
              style={styles.creditIcon}
              resizeMode="contain"
            />
            <LabelSmall color="accent">
              {isPremium ? '∞' : '1'}
            </LabelSmall>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Profile Selection */}
        {step === 'profile' && (
          <Animated.View entering={FadeIn}>
            <View style={styles.stepHeader}>
              <HeadlineMedium>Profil Seç</HeadlineMedium>
              <BodyMedium color="secondary">
                Kıyafeti denemek için bir profil seç
              </BodyMedium>
            </View>

            {/* Add Profile */}
            <GlassCard style={styles.addCard} onPress={handleAddProfile}>
              <Image
                source={require('../../full3dicons/images/plus-sign.png')}
                style={styles.addIcon}
                resizeMode="contain"
              />
              <LabelMedium>Yeni Profil Ekle</LabelMedium>
            </GlassCard>

            {/* Profile Grid */}
            {profiles.length > 0 ? (
              <View style={styles.profileGrid}>
                {profiles.map((profile) => (
                  <Pressable
                    key={profile.id}
                    onPress={() => handleSelectProfile(profile)}
                  >
                    <GlassCard
                      style={StyleSheet.flatten([
                        styles.profileCard,
                        selectedProfileId === profile.id ? styles.selectedCard : {},
                      ])}
                    >
                      <View style={styles.profileImageContainer}>
                        {profile.photos[0] ? (
                          <Image
                            source={{ uri: profile.photos[0].uri }}
                            style={styles.profileImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Image
                            source={require('../../full3dicons/images/profile.png')}
                            style={styles.placeholderImage}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <LabelMedium numberOfLines={1}>{profile.name}</LabelMedium>
                      {selectedProfileId === profile.id && (
                        <View style={styles.checkBadge}>
                          <LabelSmall color="inverse">✓</LabelSmall>
                        </View>
                      )}
                    </GlassCard>
                  </Pressable>
                ))}
              </View>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Image
                  source={require('../../full3dicons/images/profile.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
                <BodyMedium color="secondary" style={styles.emptyText}>
                  Henüz profil yok. Yeni profil ekleyerek başla.
                </BodyMedium>
              </GlassCard>
            )}
          </Animated.View>
        )}

        {/* Step 2: Garment Selection */}
        {step === 'garment' && (
          <Animated.View entering={SlideInRight}>
            <View style={styles.stepHeader}>
              <HeadlineMedium>Kıyafet Seç</HeadlineMedium>
              <BodyMedium color="secondary">
                Denemek istediğin kıyafeti seç
              </BodyMedium>
            </View>

            {/* Add Garment */}
            <GlassCard style={styles.addCard} onPress={handleAddGarment}>
              <Image
                source={require('../../full3dicons/images/plus-sign.png')}
                style={styles.addIcon}
                resizeMode="contain"
              />
              <LabelMedium>Kıyafet Ekle</LabelMedium>
            </GlassCard>

            {/* Garment Grid */}
            {garments.length > 0 ? (
              <View style={styles.garmentGrid}>
                {garments.map((garment) => (
                  <Pressable
                    key={garment.id}
                    onPress={() => handleSelectGarment(garment)}
                  >
                    <GlassCard
                      style={StyleSheet.flatten([
                        styles.garmentCard,
                        selectedGarmentId === garment.id ? styles.selectedCard : {},
                      ])}
                    >
                      <View style={styles.garmentImageContainer}>
                        {garment.imageUri.startsWith('file') || garment.imageUri.startsWith('http') ? (
                          <Image
                            source={{ uri: garment.imageUri }}
                            style={styles.garmentImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Image
                            source={require('../../full3dicons/images/t-shirt.png')}
                            style={styles.placeholderImage}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <LabelMedium numberOfLines={1}>{garment.title}</LabelMedium>
                      {selectedGarmentId === garment.id && (
                        <View style={styles.checkBadge}>
                          <LabelSmall color="inverse">✓</LabelSmall>
                        </View>
                      )}
                    </GlassCard>
                  </Pressable>
                ))}
              </View>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Image
                  source={require('../../full3dicons/images/wardrobe.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
                <BodyMedium color="secondary" style={styles.emptyText}>
                  Gardrop boş. Kıyafet ekleyerek başla.
                </BodyMedium>
              </GlassCard>
            )}
          </Animated.View>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <Animated.View entering={SlideInRight} style={styles.confirmContainer}>
            {/* Header */}
            <View style={styles.confirmHeader}>
              <HeadlineMedium style={styles.confirmTitle}>Hazır! ✨</HeadlineMedium>
              <BodyMedium color="secondary" style={styles.confirmSubtitle}>
                Seçimlerini kontrol et ve başlat
              </BodyMedium>
            </View>

            {/* Big Cards Section */}
            <View style={styles.bigCardsSection}>
              {/* Profile Big Card */}
              <Pressable 
                style={styles.bigCardWrapper}
                onPress={() => setStep('profile')}
              >
                <GlassCard style={styles.bigCard}>
                  <View style={styles.bigCardImageContainer}>
                    {selectedProfile?.photos[0] ? (
                      <Image
                        source={{ uri: selectedProfile.photos[0].uri }}
                        style={styles.bigCardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require('../../full3dicons/images/profile.png')}
                        style={styles.bigCardPlaceholder}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={styles.bigCardInfo}>
                    <LabelSmall color="secondary">PROFİL</LabelSmall>
                    <LabelMedium numberOfLines={1}>{selectedProfile?.name}</LabelMedium>
                  </View>
                  <View style={styles.changeButton}>
                    <LabelSmall color="accent">Değiştir</LabelSmall>
                  </View>
                </GlassCard>
              </Pressable>

              {/* Spark Icon */}
              <View style={styles.sparkContainer}>
                <Image
                  source={require('../../full3dicons/images/ai-sparkle.png')}
                  style={styles.sparkIcon}
                  resizeMode="contain"
                />
              </View>

              {/* Garment Big Card */}
              <Pressable 
                style={styles.bigCardWrapper}
                onPress={() => setStep('garment')}
              >
                <GlassCard style={styles.bigCard}>
                  <View style={styles.bigCardImageContainer}>
                    {selectedGarment && (selectedGarment.imageUri.startsWith('file') || selectedGarment.imageUri.startsWith('http')) ? (
                      <Image
                        source={{ uri: selectedGarment.imageUri }}
                        style={styles.bigCardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require('../../full3dicons/images/t-shirt.png')}
                        style={styles.bigCardPlaceholder}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={styles.bigCardInfo}>
                    <LabelSmall color="secondary">KİYAFET</LabelSmall>
                    <LabelMedium numberOfLines={1}>{selectedGarment?.title}</LabelMedium>
                  </View>
                  <View style={styles.changeButton}>
                    <LabelSmall color="accent">Değiştir</LabelSmall>
                  </View>
                </GlassCard>
              </Pressable>
            </View>

            {/* Credit Info */}
            <GlassCard style={styles.creditInfoCard}>
              <Image
                source={require('../../full3dicons/images/sparkle.png')}
                style={styles.creditInfoIcon}
                resizeMode="contain"
              />
              <View style={styles.creditInfoText}>
                <LabelMedium>
                  {hasCredits 
                    ? (isPremium ? 'Sınırsız deneme hakkın var' : '1 ücretsiz deneme hakkın var')
                    : 'Kredi kalmadı'}
                </LabelMedium>
                {!hasCredits && (
                  <BodySmall color="secondary">
                    Premium'a yükselterek sınırsız deneme yapabilirsin
                  </BodySmall>
                )}
              </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        {step === 'profile' ? (
          <PrimaryButton
            title="Devam"
            onPress={handleNextStep}
            disabled={!canProceed}
            style={styles.fullButton}
          />
        ) : step !== 'confirm' ? (
          <>
            <PrimaryButton
              title="Geri"
              variant="ghost"
              onPress={handlePrevStep}
              size="md"
              style={styles.backButton}
            />
            <PrimaryButton
              title="Devam"
              onPress={handleNextStep}
              disabled={!canProceed}
              style={styles.nextButton}
            />
          </>
        ) : (
          <>
            <PrimaryButton
              title="Geri"
              variant="ghost"
              onPress={handlePrevStep}
              size="md"
              style={styles.backButton}
            />
            <PrimaryButton
              title={hasCredits ? 'Oluştur ✨' : "Premium'a Yükselt"}
              onPress={handleGenerate}
              style={styles.generateButton}
            />
          </>
        )}
      </View>

    </View>
  );
};

type StepDotProps = {
  active: boolean;
  completed?: boolean;
};

const StepDot: React.FC<StepDotProps> = ({ active, completed }) => (
  <View
    style={[
      styles.stepDot,
      active && styles.stepDotActive,
      completed && styles.stepDotCompleted,
    ]}
  />
);

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
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.surface,
  },
  stepDotActive: {
    width: 24,
    backgroundColor: Colors.accent.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.accent.primaryDim,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.pill,
  },
  creditIcon: {
    width: 14,
    height: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    paddingBottom: 100,
  },
  stepHeader: {
    marginBottom: 24,
    gap: 8,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
    marginBottom: 20,
  },
  addIcon: {
    width: 28,
    height: 28,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profileCard: {
    width: (width - Spacing.page * 2 - 12) / 2,
    padding: 10,
    gap: 8,
  },
  profileImageContainer: {
    aspectRatio: 0.8,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  garmentCard: {
    width: (width - Spacing.page * 2 - 12) / 2,
    padding: 10,
    gap: 8,
  },
  garmentImageContainer: {
    aspectRatio: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '50%',
    height: '50%',
    opacity: 0.4,
  },
  selectedCard: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primaryDim,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
  },
  // Confirm Step
  confirmContainer: {
    flex: 1,
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  confirmTitle: {
    fontSize: 28,
    textAlign: 'center',
  },
  confirmSubtitle: {
    textAlign: 'center',
  },
  bigCardsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  bigCardWrapper: {
    flex: 1,
    maxWidth: (width - Spacing.page * 2 - 60) / 2,
  },
  bigCard: {
    padding: 8,
    alignItems: 'center',
    gap: 8,
  },
  bigCardImageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCardImage: {
    width: '100%',
    height: '100%',
  },
  bigCardPlaceholder: {
    width: '50%',
    height: '50%',
    opacity: 0.4,
  },
  bigCardInfo: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.pill,
  },
  sparkContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkIcon: {
    width: 32,
    height: 32,
  },
  creditInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(181, 255, 31, 0.05)',
    borderColor: Colors.accent.primaryDim,
  },
  creditInfoIcon: {
    width: 28,
    height: 28,
  },
  creditInfoText: {
    flex: 1,
    gap: 2,
  },
  // Şablon info card
  templateInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    marginBottom: 12,
  },
  templateInfoEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateEmoji: {
    fontSize: 20,
  },
  templateInfoText: {
    flex: 1,
    gap: 2,
  },
  templateChangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.pill,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.page,
    gap: 12,
    justifyContent: 'center',
  },
  fullButton: {
    width: '100%',
  },
  backButton: {
    minWidth: 80,
  },
  nextButton: {
    flex: 1,
  },
  generateButton: {
    flex: 1,
    minHeight: 52,
  },
});

export default CreateScreen;
