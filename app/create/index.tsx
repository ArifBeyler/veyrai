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
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  SlideInRight
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Garment,
  GarmentCategory,
  LAYER_PRIORITY,
  MULTI_SELECT_CATEGORIES,
  UserProfile,
  useSessionStore
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

// Kategori tanımları
const CATEGORIES: { key: GarmentCategory | 'all'; label: string; icon: any }[] = [
  { key: 'all', label: 'Tümü', icon: require('../../full3dicons/images/wardrobe.png') },
  { key: 'tops', label: 'Üst', icon: require('../../full3dicons/images/t-shirt.png') },
  { key: 'bottoms', label: 'Alt', icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'onepiece', label: 'Elbise', icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'outerwear', label: 'Dış', icon: require('../../full3dicons/images/flannel-shirt.png') },
  { key: 'footwear', label: 'Ayakkabı', icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'bags', label: 'Çanta', icon: require('../../full3dicons/images/clothes-hanger.png') },
  { key: 'accessories', label: 'Aksesuar', icon: require('../../full3dicons/images/clothes-hanger.png') },
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
  const [step, setStep] = useState<Step>('profile');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all');
  const [styleNoteInput, setStyleNoteInput] = useState('');

  const profiles = useSessionStore((s) => s.profiles);
  const garments = useSessionStore((s) => s.garments);
  const addProfile = useSessionStore((s) => s.addProfile);
  const addGarment = useSessionStore((s) => s.addGarment);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const isPremium = useSessionStore((s) => s.isPremium);
  
  // Multi-select state
  const selectedGarmentIds = useSessionStore((s) => s.selectedGarmentIds);
  const toggleSelectedGarment = useSessionStore((s) => s.toggleSelectedGarment);
  const clearSelectedGarments = useSessionStore((s) => s.clearSelectedGarments);
  const setStyleNote = useSessionStore((s) => s.setStyleNote);

  // Trial logic: First generation is free, then show paywall
  const shouldShowPaywall = freeCreditsUsed && !isPremium;

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

  // Filtrelenmiş kıyafetler
  const filteredGarments = useMemo(() => {
    if (selectedCategory === 'all') return garments;
    return garments.filter((g) => g.category === selectedCategory);
  }, [garments, selectedCategory]);

  // Kategori bazlı sayılar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: garments.length };
    CATEGORIES.forEach((cat) => {
      if (cat.key !== 'all') {
        counts[cat.key] = garments.filter((g) => g.category === cat.key).length;
      }
    });
    return counts;
  }, [garments]);

  const handleClose = () => {
    clearSelectedGarments();
    router.back();
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

  // Profil ekleme
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
      Alert.alert('İzin Gerekli', 'Kamera izni gerekli');
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
        'Kıyafet Ekle',
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
      Alert.alert('İzin Gerekli', 'Kamera izni gerekli');
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
          title: 'Kategori Seç',
          options: ['İptal', 'Üst', 'Alt', 'Elbise/Tulum', 'Dış Giyim', 'Ayakkabı', 'Çanta', 'Aksesuar'],
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
      tops: 'Üst',
      bottoms: 'Alt',
      onepiece: 'Elbise',
      outerwear: 'Dış Giyim',
      footwear: 'Ayakkabı',
      bags: 'Çanta',
      accessories: 'Aksesuar',
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
    
    // Tüm seçili kıyafetlerin URI'lerini al
    const garmentImageUris = selectedGarments.map(g => g.imageUri);
    
    // Tüm seçili kıyafetlerin kategorilerini al
    const garmentCategories = selectedGarments.map(g => g.category);

    if (!humanImageUri || garmentImageUris.length === 0) {
      Alert.alert('Hata', 'Görsel bulunamadı');
      return;
    }

    const jobId = `job-${Date.now()}`;
    router.replace({
      pathname: '/generation/[id]',
      params: {
        id: jobId,
        humanImageUri: encodeURIComponent(humanImageUri),
        // Tüm kıyafet URI'lerini virgülle ayırarak gönder
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
              {isPremium ? '∞' : freeCreditsUsed ? '0' : '1'}
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

        {/* Step 2: Garment Selection - Multi-Select */}
        {step === 'garment' && (
          <Animated.View entering={SlideInRight}>
            <View style={styles.stepHeader}>
              <HeadlineMedium>Kombin Oluştur</HeadlineMedium>
              <BodyMedium color="secondary">
                Denemek istediğin parçaları seç
              </BodyMedium>
            </View>

            {/* Selected Tray */}
            {selectedGarmentIds.length > 0 && (
              <Animated.View entering={FadeInDown} style={styles.selectedTray}>
                <View style={styles.selectedTrayHeader}>
                  <LabelMedium>Seçilen Kombinim</LabelMedium>
                  <LabelSmall color="secondary">{selectedGarmentIds.length}/8 parça</LabelSmall>
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
                        source={{ uri: garment.imageUri }}
                        style={styles.selectedChipImage}
                        resizeMode="cover"
                      />
                      <View style={[
                        styles.selectedChipCategory,
                        { backgroundColor: CATEGORY_COLORS[garment.category] }
                      ]}>
                        <LabelSmall style={styles.selectedChipCategoryText}>
                          {CATEGORIES.find(c => c.key === garment.category)?.label}
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

            {/* Category Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabs}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => {
                    setSelectedCategory(cat.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.categoryTab,
                    selectedCategory === cat.key && styles.categoryTabActive,
                  ]}
                >
                  <Image source={cat.icon} style={styles.categoryTabIcon} resizeMode="contain" />
                  <LabelSmall color={selectedCategory === cat.key ? 'accent' : 'secondary'}>
                    {cat.label}
                  </LabelSmall>
                  {categoryCounts[cat.key] > 0 && (
                    <View style={[
                      styles.categoryCount,
                      selectedCategory === cat.key && styles.categoryCountActive
                    ]}>
                      <LabelSmall style={styles.categoryCountText}>
                        {categoryCounts[cat.key]}
                      </LabelSmall>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

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
            {filteredGarments.length > 0 ? (
              <View style={styles.garmentGrid}>
                {filteredGarments.map((garment) => {
                  const isSelected = selectedGarmentIds.includes(garment.id);
                  const isMultiSelect = MULTI_SELECT_CATEGORIES.includes(garment.category);
                  
                  return (
                    <Pressable
                      key={garment.id}
                      onPress={() => handleToggleGarment(garment)}
                    >
                      <GlassCard
                        style={StyleSheet.flatten([
                          styles.garmentCard,
                          isSelected ? styles.selectedCard : {},
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
                          
                          {/* Category Badge */}
                          <View style={[
                            styles.garmentCategoryBadge,
                            { backgroundColor: CATEGORY_COLORS[garment.category] }
                          ]}>
                            <LabelSmall style={styles.garmentCategoryText}>
                              {CATEGORIES.find(c => c.key === garment.category)?.label}
                            </LabelSmall>
                          </View>
                        </View>
                        
                        <View style={styles.garmentInfo}>
                          <LabelMedium numberOfLines={1}>{garment.title}</LabelMedium>
                          {isMultiSelect && (
                            <LabelSmall color="tertiary">Çoklu seçim</LabelSmall>
                          )}
                        </View>
                        
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <LabelSmall color="inverse">✓</LabelSmall>
                          </View>
                        )}
                      </GlassCard>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <GlassCard style={styles.emptyCard}>
                <Image
                  source={require('../../full3dicons/images/wardrobe.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
                <BodyMedium color="secondary" style={styles.emptyText}>
                  {selectedCategory === 'all' 
                    ? 'Gardrop boş. Kıyafet ekleyerek başla.'
                    : 'Bu kategoride kıyafet yok.'}
                </BodyMedium>
              </GlassCard>
            )}

            {/* Style Note Input */}
            <View style={styles.styleNoteSection}>
              <LabelMedium style={styles.styleNoteLabel}>Stil Notu (Opsiyonel)</LabelMedium>
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

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <Animated.View entering={SlideInRight} style={styles.confirmContainer}>
            {/* Large Profile Photo */}
            <Animated.View entering={FadeIn.delay(100)} style={styles.confirmProfileSection}>
              <Pressable onPress={() => setStep('profile')} style={styles.confirmProfileCard}>
                {selectedProfile?.photos[0] && (
                  <Image
                    source={{ uri: selectedProfile.photos[0].uri }}
                    style={styles.confirmProfileImage}
                    resizeMode="cover"
                  />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.confirmProfileGradient}
                >
                  <View style={styles.confirmProfileInfo}>
                    <LabelMedium style={styles.confirmProfileName}>
                      {selectedProfile?.name}
                    </LabelMedium>
                    <LabelSmall color="accent">Değiştir</LabelSmall>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Selected Garments Row */}
            <Animated.View entering={FadeIn.delay(200)} style={styles.confirmGarmentsSection}>
              <View style={styles.confirmGarmentsHeader}>
                <LabelMedium>Seçilen Parçalar</LabelMedium>
                <Pressable onPress={() => setStep('garment')}>
                  <LabelSmall color="accent">Düzenle</LabelSmall>
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
                      source={{ uri: garment.imageUri }}
                      style={styles.confirmGarmentImage}
                      resizeMode="cover"
                    />
                    <View style={[
                      styles.confirmGarmentBadge,
                      { backgroundColor: CATEGORY_COLORS[garment.category] }
                    ]}>
                      <LabelSmall style={styles.confirmGarmentBadgeText}>
                        {CATEGORIES.find(c => c.key === garment.category)?.label}
                      </LabelSmall>
                    </View>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Style Note (if exists) */}
            {styleNoteInput ? (
              <Animated.View entering={FadeIn.delay(400)}>
                <GlassCard style={styles.confirmStyleNote}>
                  <LabelSmall color="secondary">💬 Stil Notu</LabelSmall>
                  <BodySmall style={styles.confirmStyleNoteText}>"{styleNoteInput}"</BodySmall>
                </GlassCard>
              </Animated.View>
            ) : null}

            {/* AI Generation Preview */}
            <Animated.View entering={FadeIn.delay(500)} style={styles.confirmAISection}>
              <View style={styles.confirmAIBox}>
                <Image
                  source={require('../../full3dicons/images/ai-sparkle.png')}
                  style={styles.confirmAIIcon}
                  resizeMode="contain"
                />
                <View style={styles.confirmAIText}>
                  <LabelMedium>AI ile Kombin Oluştur</LabelMedium>
                  <LabelSmall color="secondary">
                    Profil fotoğrafın üzerinde kıyafetleri deneyeceksin
                  </LabelSmall>
                </View>
              </View>
              
              {/* Credit Info */}
              <View style={styles.confirmCreditRow}>
                <Image
                  source={require('../../full3dicons/images/sparkle.png')}
                  style={styles.confirmCreditIcon}
                  resizeMode="contain"
                />
                <LabelSmall color={isPremium ? 'accent' : 'tertiary'}>
                  {isPremium ? 'Premium Üye - Sınırsız Deneme' : '1 Kredi Kullanılacak'}
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
              title={`Devam (${selectedGarmentIds.length})`}
              onPress={handleNextStep}
              disabled={selectedGarmentIds.length === 0}
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
              title="Oluştur"
              onPress={handleGenerate}
              style={styles.generateButton}
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
  // Category Tabs
  categoryTabs: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 8,
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
  // Confirm
  confirmContainer: {
    gap: 20,
  },
  // Profile Section - Large Photo
  confirmProfileSection: {
    alignItems: 'center',
  },
  confirmProfileCard: {
    width: width - Spacing.page * 2,
    height: 280,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  confirmProfileImage: {
    width: '100%',
    height: '100%',
  },
  confirmProfileGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: 16,
  },
  confirmProfileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmProfileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
  confirmGarmentsScroll: {
    gap: 12,
  },
  confirmGarmentCard: {
    width: 100,
    height: 130,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
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
    fontSize: 11,
    fontWeight: '600',
  },
  // Style Note
  confirmStyleNote: {
    padding: 14,
    gap: 6,
  },
  confirmStyleNoteText: {
    fontStyle: 'italic',
    color: Colors.text.secondary,
  },
  // AI Section
  confirmAISection: {
    gap: 12,
    marginTop: 8,
  },
  confirmAIBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(181, 255, 31, 0.08)',
    borderWidth: 1,
    borderColor: Colors.accent.primaryDim,
  },
  confirmAIIcon: {
    width: 40,
    height: 40,
  },
  confirmAIText: {
    flex: 1,
    gap: 2,
  },
  confirmCreditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmCreditIcon: {
    width: 16,
    height: 16,
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
});

export default CreateScreen;
