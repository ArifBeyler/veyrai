import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineMedium,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../src/ui/Typography';
import { GlassCard } from '../src/ui/GlassCard';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { IconButton } from '../src/ui/IconButton';
import { AppIcon } from '../src/utils/iconHelper';
import { useSessionStore, GarmentCategory } from '../src/state/useSessionStore';
import { useTranslation } from '../src/hooks/useTranslation';

const { width } = Dimensions.get('window');

type CategoryOption = {
  key: GarmentCategory;
  label: string;
  iconName: string;
};

const CATEGORIES: CategoryOption[] = [
  { key: 'tops', label: 'Üst Giyim', iconName: 't-shirt' },
  { key: 'pants', label: 'Alt Giyim', iconName: 'clothes-hanger' },
  { key: 'dresses', label: 'Elbise', iconName: 'clothes-hanger' },
  { key: 'outerwear', label: 'Dış Giyim', iconName: 'flannel-shirt' },
  { key: 'shoes', label: 'Ayakkabı', iconName: 'clothes-hanger' },
  { key: 'accessories', label: 'Aksesuar', iconName: 'clothes-hanger' },
];

const AddGarmentScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [isLoading, setIsLoading] = useState(false);

  const addGarment = useSessionStore((s) => s.addGarment);

  const handleClose = () => {
    router.back();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleCategorySelect = (cat: GarmentCategory) => {
    setCategory(cat);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Create garment
    const garment = {
      id: Date.now().toString(),
      title: title || t('addGarment.defaultTitle'),
      category,
      imageUri: selectedImage,
      brand: brand || undefined,
      isUserAdded: true,
      createdAt: new Date(),
    };

    addGarment(garment);

    // Simulate upload delay
    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    }, 500);
  };

  const canSave = selectedImage !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0B0B0C', '#12121a', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="home"
          onPress={handleClose}
          accessibilityLabel="Kapat"
          variant="glass"
          size="sm"
        />
        <HeadlineMedium>{t('addGarment.title')}</HeadlineMedium>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LabelMedium style={styles.sectionLabel}>{t('addGarment.garmentImage')}</LabelMedium>
          
          {selectedImage ? (
            <GlassCard style={styles.imagePreviewCard} onPress={handlePickImage}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <View style={styles.changeImageOverlay}>
                <LabelSmall color="primary">{t('addGarment.change')}</LabelSmall>
              </View>
            </GlassCard>
          ) : (
            <View style={styles.imagePickerOptions}>
              <GlassCard style={styles.imagePickerCard} onPress={handlePickImage}>
                <AppIcon
                  name="gallery"
                  size={32}
                  color={Colors.accent.primary}
                />
                <LabelMedium>{t('addGarment.selectFromGallery')}</LabelMedium>
              </GlassCard>
              
              <GlassCard style={styles.imagePickerCard} onPress={handleTakePhoto}>
                <AppIcon
                  name="camera"
                  size={32}
                  color={Colors.accent.primary}
                />
                <LabelMedium>{t('addGarment.takePhoto')}</LabelMedium>
              </GlassCard>
            </View>
          )}
        </Animated.View>

        {/* Category Selection */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <LabelMedium style={styles.sectionLabel}>{t('addGarment.category')}</LabelMedium>
          
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <GlassCard
                key={cat.key}
                style={[
                  styles.categoryCard,
                  category === cat.key && styles.categoryCardActive,
                ]}
                onPress={() => handleCategorySelect(cat.key)}
              >
                <AppIcon
                  name={cat.iconName}
                  size={24}
                  color={category === cat.key ? Colors.accent.primary : Colors.text.secondary}
                  weight={category === cat.key ? 'fill' : 'regular'}
                />
                <LabelSmall
                  color={category === cat.key ? 'accent' : 'secondary'}
                >
                  {cat.label}
                </LabelSmall>
              </GlassCard>
            ))}
          </View>
        </Animated.View>

        {/* Title Input */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <LabelMedium style={styles.sectionLabel}>{t('addGarment.nameOptional')}</LabelMedium>
          
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder={t('addGarment.namePlaceholder')}
              placeholderTextColor={Colors.text.tertiary}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </GlassCard>
        </Animated.View>

        {/* Brand Input */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <LabelMedium style={styles.sectionLabel}>{t('addGarment.brandOptional')}</LabelMedium>
          
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder={t('addGarment.brandPlaceholder')}
              placeholderTextColor={Colors.text.tertiary}
              value={brand}
              onChangeText={setBrand}
              returnKeyType="done"
            />
          </GlassCard>
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeIn.delay(500)}>
          <GlassCard style={styles.infoCard}>
            <AppIcon
              name="sparkle"
              size={20}
              color={Colors.accent.primary}
              weight="fill"
            />
            <BodySmall color="secondary" style={styles.infoText}>
              {t('addGarment.info')}
            </BodySmall>
          </GlassCard>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton
          title={t('addGarment.save')}
          onPress={handleSave}
          disabled={!canSave}
          loading={isLoading}
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 100,
    gap: 24,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  imagePickerOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  imagePickerCard: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  imagePickerIcon: {
    width: 48,
    height: 48,
  },
  imagePreviewCard: {
    padding: 8,
    alignSelf: 'center',
  },
  imagePreview: {
    width: width * 0.6,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.glass.black,
    borderRadius: BorderRadius.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: (width - Spacing.page * 2 - 20) / 3,
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  categoryCardActive: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primaryDim,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    opacity: 0.6,
  },
  categoryIconActive: {
    opacity: 1,
  },
  inputCard: {
    padding: 0,
  },
  input: {
    color: Colors.text.primary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  infoText: {
    flex: 1,
  },
  bottomActions: {
    paddingHorizontal: Spacing.page,
  },
});

export default AddGarmentScreen;

