import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../../src/hooks/useTranslation';
import { translateGarmentTitle } from '../../src/utils/garmentTitle';
import {
  Garment,
  GarmentCategory,
  GarmentGender,
  LAYER_PRIORITY,
  MULTI_SELECT_CATEGORIES,
  UserProfile,
  useSessionStore,
} from '../../src/state/useSessionStore';
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

// Cinsiyet filtreleri - dinamik olarak t() ile doldurulacak
const getGenderFilters = (t: (key: string) => string): { key: GarmentGender | 'all'; label: string; icon: any }[] => [
  { key: 'all', label: t('create.gender.all'), icon: require('../../full3dicons/images/wardrobe.png') },
  { key: 'male', label: t('create.gender.male'), icon: require('../../full3dicons/images/profile.png') },
  { key: 'female', label: t('create.gender.female'), icon: require('../../full3dicons/images/profile.png') },
];

// Kategori tanımları - dinamik olarak t() ile doldurulacak
const getCategories = (t: (key: string) => string): { key: GarmentCategory | 'all'; label: string; icon: any }[] => [
  { key: 'all', label: t('create.category.all'), icon: require('../../full3dicons/images/wardrobe.png') },
  { key: 'tops', label: t('create.category.tops'), icon: require('../../full3dicons/images/t-shirt.png') },
  { key: 'bottoms', label: t('create.category.bottoms'), icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'onepiece', label: t('create.category.onepiece'), icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'outerwear', label: t('create.category.outerwear'), icon: require('../../full3dicons/images/flannel-shirt.png') },
  { key: 'footwear', label: t('create.category.footwear'), icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'bags', label: t('create.category.bags'), icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'accessories', label: t('create.category.accessories'), icon: require('../../full3dicons/images/clothes-hanger.png') },
];

// Kategori renkleri
const CATEGORY_COLORS: Record<GarmentCategory, string> = {
  tops: '#3B82F6',
  bottoms: '#8B5CF6',
  onepiece: '#EC4899',
  outerwear: '#F59E0B',
  footwear: '#10B981',
  bags: '#06B6D4',
  accessories: '#EF4444',
};

const CreateScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('profile');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<GarmentGender | 'all'>('all');
  const [selectedCategories, setSelectedCategories] = useState<(GarmentCategory | 'all')[]>(['all']);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [styleNoteInput, setStyleNoteInput] = useState('');
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);

  const profiles = useSessionStore((s) => s.profiles);
  const garments = useSessionStore((s) => s.garments);
  const addProfile = useSessionStore((s) => s.addProfile);
  const addGarment = useSessionStore((s) => s.addGarment);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const isPremium = useSessionStore((s) => s.isPremium);
  const credits = useSessionStore((s) => s.credits);
  
  // Store'dan seçili profil ID'sini al
  const storeSelectedProfileId = useSessionStore((s) => s.selectedProfileId);
  const activeProfileId = useSessionStore((s) => s.activeProfileId);
  
  // Multi-select state
  const selectedGarmentIds = useSessionStore((s) => s.selectedGarmentIds);
  const toggleSelectedGarment = useSessionStore((s) => s.toggleSelectedGarment);
  const clearSelectedGarments = useSessionStore((s) => s.clearSelectedGarments);
  const setStyleNote = useSessionStore((s) => s.setStyleNote);
  
  // Store'dan gelen seçili profil ID'sini local state'e senkronize et
  useEffect(() => {
    if (storeSelectedProfileId && profiles.some(p => p.id === storeSelectedProfileId)) {
      setSelectedProfileId(storeSelectedProfileId);
    } else if (activeProfileId && profiles.some(p => p.id === activeProfileId)) {
      setSelectedProfileId(activeProfileId);
    }
  }, [storeSelectedProfileId, activeProfileId, profiles]);

  // Trial logic: Show paywall only if free credits used AND not premium AND no credits
  const shouldShowPaywall = freeCreditsUsed && !isPremium && credits <= 0;

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  // Seçili kıyafetler (katman sırasına göre sıralı)
  const selectedGarments = useMemo(() => {
    const selected = garments.filter((g) => selectedGarmentIds.includes(g.id));
    return selected.sort((a, b) => {
      const priorityA = a.layerPriority ?? LAYER_PRIORITY[a.category] ?? 0;
      const priorityB = b.layerPriority ?? LAYER_PRIORITY[b.category] ?? 0;
      return priorityA - priorityB;
    });
  }, [garments, selectedGarmentIds]);

  // Filtrelenmiş kıyafetler (cinsiyet + kategori + benim kıyafetlerim)
  const filteredGarments = useMemo(() => {
    let filtered = garments;
    
    // Benim kıyafetlerim filtresi
    if (showOnlyMine) {
      filtered = filtered.filter((g) => g.isUserAdded === true);
    }
    
    // Cinsiyet filtresi (sadece showOnlyMine false ise)
    if (!showOnlyMine && selectedGender !== 'all') {
      filtered = filtered.filter((g) => 
        g.gender === selectedGender || g.gender === 'unisex' || !g.gender
      );
    }
    
    // Kategori filtresi (çoklu seçim) - sadece showOnlyMine false ise
    if (!showOnlyMine && !selectedCategories.includes('all')) {
      filtered = filtered.filter((g) => selectedCategories.includes(g.category));
    }
    
    return filtered;
  }, [garments, selectedGender, selectedCategories, showOnlyMine]);
  
  // Kullanıcının eklediği kıyafet sayısı
  const myGarmentsCount = useMemo(() => {
    return garments.filter((g) => g.isUserAdded === true).length;
  }, [garments]);

  // Cinsiyet bazlı sayılar
  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: garments.length };
    counts['male'] = garments.filter((g) => g.gender === 'male').length;
    counts['female'] = garments.filter((g) => g.gender === 'female').length;
    counts['unisex'] = garments.filter((g) => g.gender === 'unisex' || !g.gender).length;
    return counts;
  }, [garments]);

  // Gender ve Category filtreleri (dinamik çeviri ile)
  const genderFilters = useMemo(() => getGenderFilters(t), [t]);
  const categories = useMemo(() => getCategories(t), [t]);

  // Kategori bazlı sayılar (seçili cinsiyete göre)
  const categoryCounts = useMemo(() => {
    // Önce cinsiyete göre filtrele
    let filtered = garments;
    if (selectedGender !== 'all') {
      filtered = filtered.filter((g) => 
        g.gender === selectedGender || g.gender === 'unisex' || !g.gender
      );
    }
    
    const counts: Record<string, number> = { all: filtered.length };
    categories.forEach((cat) => {
      if (cat.key !== 'all') {
        counts[cat.key] = filtered.filter((g) => g.category === cat.key).length;
      }
    });
    return counts;
  }, [garments, selectedGender, categories]);

  const handleClose = () => {
    clearSelectedGarments();
    router.back();
  };

  // Cinsiyet seçimi handler
  const handleSelectGender = (gender: GarmentGender | 'all') => {
    setSelectedGender(gender);
    // Kategori seçimini sıfırla
    setSelectedCategories(['all']);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Kategori seçimi handler (çoklu seçim)
  const handleToggleCategory = (category: GarmentCategory | 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (category === 'all') {
      // Tümü seçildiğinde sadece all kalır
      setSelectedCategories(['all']);
      return;
    }
    
    setSelectedCategories(prev => {
      // Eğer all seçiliyse, onu kaldır ve yeni kategoriyi ekle
      if (prev.includes('all')) {
        return [category];
      }
      
      // Eğer kategori zaten seçiliyse, kaldır
      if (prev.includes(category)) {
        const newCategories = prev.filter(c => c !== category);
        // Hiçbir şey kalmadıysa all'a dön
        return newCategories.length === 0 ? ['all'] : newCategories;
      }
      
      // Yeni kategoriyi ekle
      return [...prev, category];
    });
  };

  const handleSelectProfile = (profile: UserProfile) => {
    setSelectedProfileId(profile.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleGarment = (garment: Garment) => {
    toggleSelectedGarment(garment.id, garment.category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveGarment = (garmentId: string) => {
    const garment = garments.find((g) => g.id === garmentId);
    if (garment) {
      toggleSelectedGarment(garmentId, garment.category);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Profil ekleme - önce guide modal'ı göster
  const handleAddProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPhotoGuide(true);
  };
  
  // Photo guide'dan devam et
  const handleContinueFromGuide = () => {
    setShowPhotoGuide(false);
    // Modal kapandıktan sonra action sheet aç
    setTimeout(() => {
      showPhotoSourcePicker();
    }, 400);
  };
  
  // Fotoğraf kaynağı seçimi
  const showPhotoSourcePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('create.photoSource.cancel'), t('create.photoSource.takePhoto'), t('create.photoSource.selectFromGallery')],
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
        t('selectProfile.addNewProfile'),
        t('selectProfile.info'),
        [
          { text: t('create.photoSource.cancel'), style: 'cancel' },
          { text: t('create.photoSource.takePhoto'), onPress: pickProfileFromCamera },
          { text: t('create.photoSource.selectFromGallery'), onPress: pickProfileFromGallery },
        ]
      );
    }
  };

  const pickProfileFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('create.permission.title'), t('create.permission.cameraRequired'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      createProfileFromUri(result.assets[0].uri);
    }
  };

  const pickProfileFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
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
          uri,
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

  // Kıyafet ekleme
  const handleAddGarment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('create.photoSource.cancel'), t('create.photoSource.takePhoto'), t('create.photoSource.selectFromGallery')],
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
        t('create.addGarment'),
        t('wardrobe.addGarmentSubtitle'),
        [
          { text: t('create.photoSource.cancel'), style: 'cancel' },
          { text: t('create.photoSource.takePhoto'), onPress: pickGarmentFromCamera },
          { text: t('create.photoSource.selectFromGallery'), onPress: pickGarmentFromGallery },
        ]
      );
    }
  };

  const pickGarmentFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('create.permission.title'), t('create.permission.cameraRequired'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      showCategoryPicker(result.assets[0].uri);
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
      showCategoryPicker(result.assets[0].uri);
    }
  };

  const showCategoryPicker = (uri: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: t('create.categoryPicker.title'),
          options: [
            t('create.photoSource.cancel'),
            t('create.category.tops'),
            t('create.category.bottoms'),
            t('create.category.onepiece'),
            t('create.category.outerwear'),
            t('create.category.footwear'),
            t('create.category.bags'),
            t('create.category.accessories')
          ],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          const categories: GarmentCategory[] = ['tops', 'bottoms', 'onepiece', 'outerwear', 'footwear', 'bags', 'accessories'];
          if (buttonIndex > 0 && buttonIndex <= categories.length) {
            createGarmentFromUri(uri, categories[buttonIndex - 1]);
          }
        }
      );
    } else {
      // Android için basit tops kategorisi
      createGarmentFromUri(uri, 'tops');
    }
  };

  const createGarmentFromUri = (uri: string, category: GarmentCategory) => {
    const newGarmentId = Date.now().toString();
    const categoryLabels: Record<GarmentCategory, string> = {
      tops: t('create.category.tops'),
      bottoms: t('create.category.bottoms'),
      onepiece: t('create.category.onepiece'),
      outerwear: t('create.category.outerwear'),
      footwear: t('create.category.footwear'),
      bags: t('create.category.bags'),
      accessories: t('create.category.accessories'),
    };
    
    const newGarment: Garment = {
      id: newGarmentId,
      title: `${categoryLabels[category]} ${garments.filter(g => g.category === category).length + 1}`,
      imageUri: uri,
      category,
      isUserAdded: true,
      createdAt: new Date(),
    };

    addGarment(newGarment);
    toggleSelectedGarment(newGarmentId, category);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Sonraki adıma geç
  const handleNextStep = useCallback(() => {
    if (step === 'profile' && selectedProfileId) {
      setStep('garment');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (step === 'garment' && selectedGarmentIds.length > 0) {
      setStep('confirm');
      setStyleNote(styleNoteInput);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [step, selectedProfileId, selectedGarmentIds.length, styleNoteInput]);

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
    // Check if user should see paywall (2nd generation and not premium)
    if (shouldShowPaywall) {
      router.push('/paywall');
      return;
    }

    if (!selectedProfileId || selectedGarmentIds.length === 0 || !selectedProfile) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const humanImageUri = selectedProfile.photos[0]?.uri;
    
    // Tüm seçili kıyafetlerin URI'lerini al (number için resolveAssetSource)
    const garmentImageUris = selectedGarments.map(g => {
      if (typeof g.imageUri === 'number') {
        const resolved = RNImage.resolveAssetSource(g.imageUri);
        return resolved?.uri || '';
      }
      return g.imageUri;
    }).filter(uri => uri);
    
    // Tüm seçili kıyafetlerin kategorilerini al
    const garmentCategories = selectedGarments.map(g => g.category);

    if (!humanImageUri || garmentImageUris.length === 0) {
      Alert.alert(t('common.error'), t('create.error.imageNotFound'));
      return;
    }

    const jobId = `job-${Date.now()}`;
    console.log('Navigating to generation with humanImageUri:', humanImageUri);
    router.replace({
      pathname: '/generation/[id]',
      params: {
        id: jobId,
        humanImageUri: encodeURIComponent(humanImageUri),
        // Tüm kıyafet URI'lerini ||| ile ayırarak gönder
        garmentImageUris: garmentImageUris.map(uri => encodeURIComponent(uri)).join('|||'),
        garmentCategories: garmentCategories.join(','),
        gender: selectedProfile.gender || 'male',
        garmentIds: selectedGarmentIds.join(','),
        styleNote: styleNoteInput,
      },
    });
  };

  const canProceed =
    (step === 'profile' && selectedProfileId) ||
    (step === 'garment' && selectedGarmentIds.length > 0) ||
    step === 'confirm';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Photo Guide Modal - Simple Text Alert */}
      <Modal
        visible={showPhotoGuide}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPhotoGuide(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={styles.photoGuideModal}
          >
            <LinearGradient
              colors={['#1a1a2e', '#16162a']}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Close Button */}
            <Pressable 
              style={styles.modalCloseButton}
              onPress={() => setShowPhotoGuide(false)}
            >
              <LabelMedium>✕</LabelMedium>
            </Pressable>
            
            {/* Title */}
            <View style={styles.photoGuideHeader}>
              <HeadlineMedium style={styles.photoGuideTitle}>
                {t('create.photoGuide.title')}
              </HeadlineMedium>
            </View>
            
            {/* Tips - Text Only */}
            <View style={styles.photoGuideTips}>
              <View style={styles.photoGuideTipRow}>
                <LabelMedium style={styles.tipBullet}>•</LabelMedium>
                <View style={styles.tipContent}>
                  <BodySmall color="primary">
                    {t('create.photoGuide.goodLighting')} - {t('create.photoGuide.goodLightingDesc')}
                  </BodySmall>
                </View>
              </View>
              
              <View style={styles.photoGuideTipRow}>
                <LabelMedium style={styles.tipBullet}>•</LabelMedium>
                <View style={styles.tipContent}>
                  <BodySmall color="primary">
                    {t('create.photoGuide.fullBody')} - {t('create.photoGuide.fullBodyDesc')}
                  </BodySmall>
                </View>
              </View>
              
              <View style={styles.photoGuideTipRow}>
                <LabelMedium style={styles.tipBullet}>•</LabelMedium>
                <View style={styles.tipContent}>
                  <BodySmall color="primary">
                    {t('create.photoGuide.straightPosture')} - {t('create.photoGuide.straightPostureDesc')}
                  </BodySmall>
                </View>
              </View>
              
              <View style={styles.photoGuideDivider} />
              
              <View style={styles.photoGuideTipRow}>
                <LabelMedium style={[styles.tipBullet, { color: '#ef4444' }]}>✕</LabelMedium>
                <View style={styles.tipContent}>
                  <BodySmall color="secondary">
                    {t('create.photoGuide.avoidTitle')}: {t('create.photoGuide.avoidDesc')}
                  </BodySmall>
                </View>
              </View>
            </View>
            
            {/* Continue Button */}
            <PrimaryButton
              title={t('create.photoGuide.continue')}
              onPress={handleContinueFromGuide}
              style={styles.photoGuideContinueButton}
            />
          </Animated.View>
        </View>
      </Modal>

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
        {!shouldShowPaywall && (
          <View style={styles.creditBadge}>
            <Image
              source={require('../../full3dicons/images/sparkle.png')}
              style={styles.creditBadgeIcon}
              resizeMode="contain"
            />
            <LabelSmall color="accent">
              {isPremium ? '∞' : credits > 0 ? credits : freeCreditsUsed ? '0' : '1'}
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
              <HeadlineMedium>{t('create.selectProfile')}</HeadlineMedium>
              <BodyMedium color="secondary">
                {t('create.selectProfileDescription')}
              </BodyMedium>
            </View>

            {/* Add Profile */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <GlassCard style={styles.addCard} onPress={handleAddProfile}>
                <Image
                  source={require('../../full3dicons/images/plus-sign.png')}
                  style={styles.addIcon}
                  resizeMode="contain"
                />
                <LabelMedium>{t('create.addNewProfile')}</LabelMedium>
              </GlassCard>
            </Animated.View>

            {/* Profile Grid */}
            {profiles.length > 0 ? (
              <View style={styles.profileGrid}>
                {profiles.map((profile, index) => (
                  <Animated.View
                    key={profile.id}
                    entering={FadeInDown.delay(300 + index * 50).springify()}
                  >
                    <Pressable
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
                  </Animated.View>
                ))}
              </View>
            ) : (
              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <GlassCard style={styles.emptyCard}>
                  <Image
                    source={require('../../full3dicons/images/profile.png')}
                    style={styles.emptyIcon}
                    resizeMode="contain"
                  />
                  <BodyMedium color="secondary" style={styles.emptyText}>
                    {t('create.noProfilesYet')}
                  </BodyMedium>
                </GlassCard>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* Step 2: Garment Selection - Multi-Select */}
        {step === 'garment' && (
          <Animated.View entering={SlideInRight}>
            <View style={styles.stepHeader}>
              <HeadlineMedium>{t('create.createCombination')}</HeadlineMedium>
              <BodyMedium color="secondary">
                {t('create.selectGarmentsDescription')}
              </BodyMedium>
            </View>

            {/* Selected Tray */}
            {selectedGarmentIds.length > 0 && (
              <Animated.View entering={FadeInDown} style={styles.selectedTray}>
                <View style={styles.selectedTrayHeader}>
                  <LabelMedium>{t('create.selectedCombination')}</LabelMedium>
                  <LabelSmall color="secondary">{selectedGarmentIds.length}{t('create.partsCount')}</LabelSmall>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedTrayScroll}
                >
                  {selectedGarments.map((garment, index) => (
                    <Animated.View 
                      key={garment.id} 
                      entering={FadeInRight.delay(index * 50)}
                      style={styles.selectedChip}
                    >
                      <Image
                        source={typeof garment.imageUri === 'number' ? garment.imageUri : { uri: garment.imageUri }}
                        style={styles.selectedChipImage}
                        resizeMode="cover"
                      />
                      <View style={[
                        styles.selectedChipCategory,
                        { backgroundColor: CATEGORY_COLORS[garment.category] }
                      ]}>
                        <LabelSmall style={styles.selectedChipCategoryText}>
                          {categories.find(c => c.key === garment.category)?.label}
                        </LabelSmall>
                      </View>
                      <Pressable
                        style={styles.selectedChipRemove}
                        onPress={() => handleRemoveGarment(garment.id)}
                      >
                        <LabelSmall style={styles.removeText}>×</LabelSmall>
                      </Pressable>
                    </Animated.View>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Main Tabs - Örnek Kıyafetler / Benim Kıyafetlerim */}
            <View style={styles.mainTabsContainer}>
              <Pressable
                onPress={() => {
                  setShowOnlyMine(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.mainTab,
                  !showOnlyMine && styles.mainTabActive,
                ]}
              >
                <Image
                  source={require('../../full3dicons/images/wardrobe.png')}
                  style={styles.mainTabIcon}
                  resizeMode="contain"
                />
                <LabelMedium color={!showOnlyMine ? 'accent' : 'secondary'}>
                  {t('create.exampleGarments')}
                </LabelMedium>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowOnlyMine(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.mainTab,
                  showOnlyMine && styles.mainTabActive,
                ]}
              >
                <Image
                  source={require('../../full3dicons/images/profile.png')}
                  style={styles.mainTabIcon}
                  resizeMode="contain"
                />
                <LabelMedium color={showOnlyMine ? 'accent' : 'secondary'}>
                  {t('create.myGarments')}
                </LabelMedium>
                {myGarmentsCount > 0 && (
                  <View style={[
                    styles.mainTabBadge,
                    showOnlyMine && styles.mainTabBadgeActive
                  ]}>
                    <LabelSmall style={styles.mainTabBadgeText}>
                      {myGarmentsCount}
                    </LabelSmall>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Gender & Category Filters - Sadece Örnek Kıyafetler sekmesinde */}
            {!showOnlyMine && (
              <>
                {/* Gender Tabs */}
                <View style={styles.filterSection}>
                  <LabelSmall color="secondary" style={styles.filterLabel}>{t('create.genderLabel')}</LabelSmall>
                  <View style={styles.genderTabs}>
                    {genderFilters.map((gender) => (
                      <Pressable
                        key={gender.key}
                        onPress={() => handleSelectGender(gender.key)}
                        style={[
                          styles.genderTab,
                          selectedGender === gender.key && styles.genderTabActive,
                        ]}
                      >
                        <LabelSmall color={selectedGender === gender.key ? 'accent' : 'secondary'}>
                          {gender.label}
                        </LabelSmall>
                        {genderCounts[gender.key] > 0 && (
                          <View style={[
                            styles.genderCount,
                            selectedGender === gender.key && styles.genderCountActive
                          ]}>
                            <LabelSmall style={styles.categoryCountText}>
                              {genderCounts[gender.key]}
                            </LabelSmall>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Category Tabs (Çoklu Seçim) */}
                <View style={styles.filterSection}>
                  <LabelSmall color="secondary" style={styles.filterLabel}>{t('create.categoryLabel')}</LabelSmall>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryTabs}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.key);
                  return (
                    <Pressable
                      key={cat.key}
                      onPress={() => handleToggleCategory(cat.key)}
                      style={[
                        styles.categoryTab,
                        isSelected && styles.categoryTabActive,
                      ]}
                    >
                      <Image source={cat.icon} style={styles.categoryTabIcon} resizeMode="contain" />
                      <LabelSmall color={isSelected ? 'accent' : 'secondary'}>
                        {cat.label}
                      </LabelSmall>
                      {categoryCounts[cat.key] > 0 && (
                        <View style={[
                          styles.categoryCount,
                          isSelected && styles.categoryCountActive
                        ]}>
                          <LabelSmall style={styles.categoryCountText}>
                            {categoryCounts[cat.key]}
                          </LabelSmall>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
              </>
            )}

            {/* Add Garment */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <GlassCard style={styles.addCard} onPress={handleAddGarment}>
                <Image
                  source={require('../../full3dicons/images/plus-sign.png')}
                  style={styles.addIcon}
                  resizeMode="contain"
                />
                <LabelMedium>{t('create.addGarment')}</LabelMedium>
              </GlassCard>
            </Animated.View>

            {/* Garment Grid */}
            {filteredGarments.length > 0 ? (
              <View style={styles.garmentGrid}>
                {filteredGarments.map((garment, index) => {
                  const isSelected = selectedGarmentIds.includes(garment.id);
                  const isMultiSelect = MULTI_SELECT_CATEGORIES.includes(garment.category);
                  
                  return (
                    <Animated.View
                      key={garment.id}
                      entering={FadeInDown.delay(300 + index * 50).springify()}
                    >
                      <Pressable
                        onPress={() => handleToggleGarment(garment)}
                      >
                        <GlassCard
                          style={StyleSheet.flatten([
                            styles.garmentCard,
                            isSelected ? styles.selectedCard : {},
                          ])}
                        >
                          <View style={styles.garmentImageContainer}>
                            {typeof garment.imageUri === 'number' ? (
                              <Image
                                source={garment.imageUri}
                                style={styles.garmentImage}
                                contentFit="cover"
                                transition={200}
                              />
                            ) : garment.imageUri && (garment.imageUri.startsWith('file') || garment.imageUri.startsWith('http')) ? (
                              <Image
                                source={{ uri: garment.imageUri }}
                                style={styles.garmentImage}
                                contentFit="cover"
                                transition={200}
                                cachePolicy="memory-disk"
                              />
                            ) : (
                              <Image
                                source={require('../../full3dicons/images/t-shirt.png')}
                                style={styles.placeholderImage}
                                resizeMode="contain"
                              />
                            )}
                            
                            {/* Category Badge */}
                            <View style={[
                              styles.garmentCategoryBadge,
                              { backgroundColor: CATEGORY_COLORS[garment.category] }
                            ]}>
                              <LabelSmall style={styles.garmentCategoryText}>
                                {categories.find(c => c.key === garment.category)?.label}
                              </LabelSmall>
                            </View>
                          </View>
                          
                          <View style={styles.garmentInfo}>
                            <LabelMedium numberOfLines={1}>{translateGarmentTitle(garment.title)}</LabelMedium>
                            {isMultiSelect && (
                              <LabelSmall color="tertiary">{t('create.multiSelect')}</LabelSmall>
                            )}
                          </View>
                          
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <LabelSmall color="inverse">✓</LabelSmall>
                            </View>
                          )}
                        </GlassCard>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            ) : (
              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <GlassCard style={styles.emptyCard}>
                  <Image
                    source={require('../../full3dicons/images/wardrobe.png')}
                    style={styles.emptyIcon}
                    resizeMode="contain"
                  />
                  <BodyMedium color="secondary" style={styles.emptyText}>
                    {selectedCategories.includes('all') && selectedGender === 'all'
                      ? t('create.wardrobeEmptyMessage')
                      : t('create.emptyGarmentMessage')}
                  </BodyMedium>
                </GlassCard>
              </Animated.View>
            )}

            {/* Style Note Input */}
            <View style={styles.styleNoteSection}>
              <LabelMedium style={styles.styleNoteLabel}>{t('create.styleNote')}</LabelMedium>
              <GlassCard style={styles.styleNoteCard}>
                <TextInput
                  style={styles.styleNoteInput}
                  placeholder="örn: minimal, siyah ağırlıklı, smart casual..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={styleNoteInput}
                  onChangeText={setStyleNoteInput}
                  multiline
                  maxLength={150}
                />
              </GlassCard>
              <LabelSmall color="tertiary" style={styles.styleNoteHint}>
                AI'a stil ipuçları vererek daha iyi sonuçlar alabilirsin
              </LabelSmall>
            </View>
          </Animated.View>
        )}

        {/* Step 3: Confirm - Yeniden Tasarım */}
        {step === 'confirm' && (
          <Animated.View entering={FadeIn} style={styles.confirmContainer}>
            {/* Hero Profile Section - Tam ekran profil */}
            <Animated.View entering={FadeIn.delay(100)}>
              <Pressable onPress={() => setStep('profile')} style={styles.heroProfileCard}>
                {selectedProfile?.photos[0] && (
                  <Image
                    source={{ uri: selectedProfile.photos[0].uri }}
                    style={styles.heroProfileImage}
                    resizeMode="cover"
                  />
                )}
                {/* Üst gradient - profil adı için */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'transparent']}
                  style={styles.heroTopGradient}
                >
                  <View style={styles.heroProfileBadge}>
                    <Image
                      source={require('../../full3dicons/images/profile.png')}
                      style={styles.heroProfileBadgeIcon}
                      resizeMode="contain"
                    />
                    <LabelMedium style={styles.heroProfileName}>
                      {selectedProfile?.name}
                    </LabelMedium>
                  </View>
                  <Pressable 
                    style={styles.heroChangeButton}
                    onPress={() => setStep('profile')}
                  >
                    <LabelSmall color="accent">{t('create.change')}</LabelSmall>
                  </Pressable>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Seçilen Kıyafetler - Kartlar */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.confirmGarmentsSection}>
              <View style={styles.confirmGarmentsHeader}>
                <View style={styles.confirmGarmentsHeaderLeft}>
                  <LabelMedium>{t('create.selectedParts')}</LabelMedium>
                  <View style={styles.selectedCountBadge}>
                    <LabelSmall style={styles.selectedCountText}>
                      {selectedGarmentIds.length}
                    </LabelSmall>
                  </View>
                </View>
                <Pressable 
                  style={styles.editGarmentsButton}
                  onPress={() => setStep('garment')}
                >
                  <LabelSmall color="accent">{t('create.edit')}</LabelSmall>
                </Pressable>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.confirmGarmentsScroll}
              >
                {selectedGarments.map((garment, index) => (
                  <Animated.View 
                    key={garment.id}
                    entering={FadeInRight.delay(300 + index * 80)}
                    style={styles.confirmGarmentCard}
                  >
                    <Image
                      source={typeof garment.imageUri === 'number' ? garment.imageUri : { uri: garment.imageUri }}
                      style={styles.confirmGarmentImage}
                      resizeMode="cover"
                    />
                    <View style={[
                      styles.confirmGarmentBadge,
                      { backgroundColor: CATEGORY_COLORS[garment.category] }
                    ]}>
                      <LabelSmall style={styles.confirmGarmentBadgeText}>
                        {categories.find(c => c.key === garment.category)?.label || garment.category}
                      </LabelSmall>
                    </View>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Style Note (if exists) */}
            {styleNoteInput ? (
              <Animated.View entering={FadeIn.delay(400)}>
                <View style={styles.confirmStyleNoteCard}>
                  <LabelSmall color="secondary">💬 {t('create.styleNoteLabel')}</LabelSmall>
                  <BodySmall style={styles.confirmStyleNoteText}>"{styleNoteInput}"</BodySmall>
                </View>
              </Animated.View>
            ) : null}

            {/* AI Generation Box - Modern */}
            <Animated.View entering={FadeInDown.delay(500)} style={styles.confirmAISection}>
              <LinearGradient
                colors={['rgba(181, 255, 31, 0.15)', 'rgba(181, 255, 31, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmAIBox}
              >
                <View style={styles.confirmAIIconContainer}>
                  <Image
                    source={require('../../full3dicons/images/ai-sparkle.png')}
                    style={styles.confirmAIIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.confirmAIText}>
                  <LabelMedium style={styles.confirmAITitle}>{t('create.aiCreateCombo')}</LabelMedium>
                  <LabelSmall color="secondary">
                    {t('create.aiDescription')}
                  </LabelSmall>
                </View>
              </LinearGradient>
              
              {/* Credit Info - Centered */}
              <View style={styles.confirmCreditRow}>
                <Image
                  source={require('../../full3dicons/images/sparkle.png')}
                  style={styles.confirmCreditIcon}
                  resizeMode="contain"
                />
                <LabelSmall color={(isPremium || credits > 0) ? 'accent' : 'tertiary'}>
                  {isPremium 
                    ? t('create.premiumUnlimited') 
                    : credits > 0 
                      ? t('home.credits', { count: credits }) 
                      : freeCreditsUsed
                        ? t('profile.freeTrialUsed')
                        : t('create.oneCreditWillBeUsed')}
                </LabelSmall>
              </View>
              
              {/* Free Credit Info */}
              {!freeCreditsUsed && !isPremium && credits === 0 && (
                <View style={styles.freeCreditInfoRow}>
                  <LabelSmall color="secondary" style={styles.freeCreditInfoText}>
                    {t('create.freeCreditInfo')}
                  </LabelSmall>
                </View>
              )}
              
              {/* AI Disclaimer */}
              <View style={styles.aiDisclaimerRow}>
                <LabelSmall color="tertiary" style={styles.aiDisclaimerText}>
                  {t('create.aiDisclaimer')}
                </LabelSmall>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 34) + 16 }]}>
        {step === 'profile' ? (
          <PrimaryButton
            title={t('create.continue')}
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
              title={`${t('create.continue')} (${selectedGarmentIds.length})`}
              onPress={handleNextStep}
              disabled={selectedGarmentIds.length === 0}
              style={styles.nextButton}
            />
          </>
        ) : (
          <>
            <PrimaryButton
              title={t('create.back')}
              variant="ghost"
              onPress={handlePrevStep}
              size="md"
              style={styles.backButton}
            />
            <SwipeToConfirm 
              onConfirm={handleGenerate}
              label={t('create.swipeToGenerate')}
            />
          </>
        )}
      </View>
    </View>
  );
};

// Step Indicator Dot
const StepDot: React.FC<{ active: boolean; completed?: boolean }> = ({
  active,
  completed,
}) => (
  <View
    style={[
      styles.stepDot,
      active && styles.stepDotActive,
      completed && styles.stepDotCompleted,
    ]}
  />
);

// Swipe to Confirm Component
const SWIPE_BUTTON_WIDTH = 70;
const SWIPE_TRACK_PADDING = 6;

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label: string;
}

const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({ onConfirm, label }) => {
  const translateX = useSharedValue(0);
  const trackWidth = width - Spacing.page * 2 - 80; // Geri butonu için yer bırak
  const maxTranslate = trackWidth - SWIPE_BUTTON_WIDTH - SWIPE_TRACK_PADDING * 2;
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const triggerSuccessHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm();
  };
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newValue = Math.max(0, Math.min(event.translationX, maxTranslate));
      translateX.value = newValue;
      
      // Her %20'de bir haptic feedback
      const progress = newValue / maxTranslate;
      const milestone = Math.floor(progress * 5);
      if (milestone > 0 && milestone !== Math.floor((translateX.value - 5) / maxTranslate * 5)) {
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd(() => {
      const progress = translateX.value / maxTranslate;
      
      if (progress > 0.85) {
        // Başarılı - sonuna kaydır ve onayla
        translateX.value = withSpring(maxTranslate, { damping: 15 });
        runOnJS(triggerSuccessHaptic)();
        runOnJS(handleConfirm)();
      } else {
        // Başarısız - geri dön
        translateX.value = withSpring(0, { damping: 15 });
      }
    });
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const textStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, maxTranslate * 0.5, maxTranslate],
      [1, 0.3, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });
  
  const progressStyle = useAnimatedStyle(() => {
    const progressWidth = interpolate(
      translateX.value,
      [0, maxTranslate],
      [0, trackWidth - SWIPE_TRACK_PADDING * 2],
      Extrapolate.CLAMP
    );
    return { width: progressWidth };
  });
  
  const arrowOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, maxTranslate * 0.3],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });
  
  return (
    <View style={[styles.swipeTrack, { width: trackWidth }]}>
      {/* Progress fill */}
      <Animated.View style={[styles.swipeProgress, progressStyle]} />
      
      {/* Label */}
      <Animated.View style={[styles.swipeLabelContainer, textStyle]}>
        <LabelMedium style={styles.swipeLabel}>{label}</LabelMedium>
        <Animated.View style={arrowOpacity}>
          <LabelSmall style={styles.swipeArrows}>→→→</LabelSmall>
        </Animated.View>
      </Animated.View>
      
      {/* Draggable button */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeButton, buttonStyle]}>
          <LinearGradient
            colors={[Colors.accent.primary, '#9AE600']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.swipeButtonGradient}
          >
            <LabelMedium style={styles.swipeButtonIcon}>
              {isConfirmed ? '✓' : '→'}
            </LabelMedium>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
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
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.strokeLight,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.pill,
  },
  creditBadgeIcon: {
    width: 16,
    height: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.page,
    paddingBottom: 120,
    gap: 16,
  },
  stepHeader: {
    gap: 4,
    marginBottom: 8,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  addIcon: {
    width: 22,
    height: 22,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileCard: {
    width: (width - Spacing.page * 2 - 10) / 2,
    padding: 8,
  },
  profileImageContainer: {
    aspectRatio: 0.85,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: 6,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '50%',
    height: '50%',
    alignSelf: 'center',
    marginTop: '25%',
    opacity: 0.4,
  },
  selectedCard: {
    borderColor: Colors.accent.primary,
    borderWidth: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
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
  // Selected Tray
  selectedTray: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 12,
  },
  selectedTrayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTrayScroll: {
    gap: 10,
  },
  selectedChip: {
    width: 70,
    height: 90,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  selectedChipImage: {
    width: '100%',
    height: '100%',
  },
  selectedChipCategory: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  selectedChipCategoryText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  selectedChipRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  // Filter Section
  filterSection: {
    gap: 8,
    marginBottom: 12,
  },
  filterLabel: {
    marginLeft: 4,
  },
  // Gender Tabs
  genderTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  genderTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.pill,
    borderWidth: 2,
    borderColor: Colors.dark.strokeLight,
  },
  genderTabActive: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  genderCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.sm,
  },
  genderCountActive: {
    backgroundColor: Colors.accent.primary,
  },
  // Category Tabs
  categoryTabs: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
  },
  categoryTabActive: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  categoryTabIcon: {
    width: 16,
    height: 16,
    opacity: 0.7,
  },
  categoryCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: BorderRadius.sm,
  },
  categoryCountActive: {
    backgroundColor: Colors.accent.primary,
  },
  categoryCountText: {
    color: '#fff',
    fontSize: 10,
  },
  // Garment Grid
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  garmentCard: {
    width: (width - Spacing.page * 2 - 10) / 2,
    padding: 8,
  },
  garmentImageContainer: {
    aspectRatio: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: 6,
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },
  garmentCategoryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  garmentCategoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  garmentInfo: {
    gap: 2,
  },
  // Style Note
  styleNoteSection: {
    marginTop: 8,
    gap: 8,
  },
  styleNoteLabel: {
    marginLeft: 4,
  },
  styleNoteCard: {
    padding: 12,
  },
  styleNoteInput: {
    color: Colors.text.primary,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  styleNoteHint: {
    marginLeft: 4,
  },
  // Confirm - Yeni Tasarım
  confirmContainer: {
    gap: 16,
  },
  // Hero Profile Section
  heroProfileCard: {
    width: width - Spacing.page * 2,
    height: 340,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  heroProfileImage: {
    width: '100%',
    height: '100%',
  },
  heroTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 14,
  },
  heroProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
  },
  heroProfileBadgeIcon: {
    width: 18,
    height: 18,
  },
  heroProfileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroChangeButton: {
    backgroundColor: 'rgba(181, 255, 31, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  // Garments Section
  confirmGarmentsSection: {
    gap: 12,
  },
  confirmGarmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmGarmentsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedCountBadge: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedCountText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  editGarmentsButton: {
    backgroundColor: 'rgba(181, 255, 31, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  confirmGarmentsScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  confirmGarmentCard: {
    width: 110,
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
  },
  confirmGarmentImage: {
    width: '100%',
    height: '100%',
  },
  confirmGarmentBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    alignItems: 'center',
  },
  confirmGarmentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  // Style Note
  confirmStyleNoteCard: {
    padding: 14,
    gap: 6,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
  },
  confirmStyleNoteText: {
    fontStyle: 'italic',
    color: Colors.text.secondary,
  },
  // AI Section - Modern
  confirmAISection: {
    gap: 14,
    marginTop: 4,
  },
  confirmAIBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(181, 255, 31, 0.3)',
  },
  confirmAIIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(181, 255, 31, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAIIcon: {
    width: 32,
    height: 32,
  },
  confirmAIText: {
    flex: 1,
    gap: 4,
  },
  confirmAITitle: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmCreditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(181, 255, 31, 0.05)',
    borderRadius: BorderRadius.md,
  },
  confirmCreditIcon: {
    width: 18,
    height: 18,
  },
  freeCreditInfoRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  freeCreditInfoText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },
  aiDisclaimerRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  aiDisclaimerText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.7,
  },
  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.page,
    paddingTop: 12,
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullButton: {
    width: '100%',
    minHeight: 56,
  },
  backButton: {
    minWidth: 80,
  },
  nextButton: {
    flex: 1,
    minHeight: 52,
  },
  generateButton: {
    flex: 1,
    minHeight: 52,
  },
  // Swipe to Confirm
  swipeTrack: {
    height: 56,
    backgroundColor: 'rgba(181, 255, 31, 0.1)',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(181, 255, 31, 0.3)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  swipeProgress: {
    position: 'absolute',
    left: SWIPE_TRACK_PADDING,
    top: SWIPE_TRACK_PADDING,
    bottom: SWIPE_TRACK_PADDING,
    backgroundColor: 'rgba(181, 255, 31, 0.15)',
    borderRadius: 22,
  },
  swipeLabelContainer: {
    position: 'absolute',
    left: SWIPE_BUTTON_WIDTH + 10,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  swipeLabel: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  swipeArrows: {
    color: Colors.accent.primary,
    letterSpacing: 2,
    opacity: 0.6,
  },
  swipeButton: {
    position: 'absolute',
    left: SWIPE_TRACK_PADDING,
    top: SWIPE_TRACK_PADDING,
    width: SWIPE_BUTTON_WIDTH,
    height: 56 - SWIPE_TRACK_PADDING * 2 - 4,
    borderRadius: 22,
    overflow: 'hidden',
  },
  swipeButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeButtonIcon: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
  },
  // Main Tabs - Örnek Kıyafetler / Benim Kıyafetlerim
  mainTabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mainTabActive: {
    backgroundColor: 'rgba(181, 255, 31, 0.1)',
    borderColor: Colors.accent.primary,
  },
  mainTabIcon: {
    width: 24,
    height: 24,
  },
  mainTabBadge: {
    backgroundColor: Colors.dark.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mainTabBadgeActive: {
    backgroundColor: Colors.accent.primary,
  },
  mainTabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  // Photo Guide Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  photoGuideModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: 24,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoGuideHeader: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  photoGuideIcon: {
    width: 64,
    height: 64,
  },
  photoGuideTitle: {
    textAlign: 'center',
    color: '#fff',
  },
  photoGuideTips: {
    gap: 16,
  },
  photoGuideTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIconGood: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBullet: {
    width: 20,
    color: Colors.accent.primary,
    fontSize: 16,
  },
  tipIconBad: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIconText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  photoGuideDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  photoGuideExamples: {
    marginTop: 20,
    marginBottom: 24,
  },
  exampleImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  exampleGood: {
    width: 100,
    height: 130,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 2,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  exampleBad: {
    width: 100,
    height: 130,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  exampleImage: {
    width: 60,
    height: 60,
  },
  exampleBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exampleBadgeBad: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exampleBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  photoGuideContinueButton: {
    marginTop: 8,
  },
});

export default CreateScreen;
