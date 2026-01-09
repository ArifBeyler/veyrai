import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Garment, GarmentCategory, useSessionStore } from '../../src/state/useSessionStore';
import { GlassCard } from '../../src/ui/GlassCard';
import { BorderRadius, Colors, Spacing } from '../../src/ui/theme';
import {
  BodyMedium,
  BodySmall,
  DisplaySmall,
  HeadlineSmall,
  LabelMedium,
  LabelSmall,
} from '../../src/ui/Typography';

const { width } = Dimensions.get('window');

type GenderFilter = 'all' | 'male' | 'female';

// Filtre ikonları
const getFilterIcon = (filter: GenderFilter) => {
  switch (filter) {
    case 'all':
      return require('../../full3dicons/images/wardrobe.png');
    case 'male':
      return require('../../full3dicons/images/man.png');
    case 'female':
      return require('../../full3dicons/images/woman.png');
    default:
      return require('../../full3dicons/images/wardrobe.png');
  }
};

const FILTERS: { key: GenderFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'male', label: 'Erkek' },
  { key: 'female', label: 'Kadın' },
];

const WardrobeScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<GenderFilter>('all');
  
  const garments = useSessionStore((s) => s.garments);
  const setSelectedGarmentId = useSessionStore((s) => s.setSelectedGarmentId);
  const removeGarment = useSessionStore((s) => s.removeGarment);

  // Filtrelenmiş kıyafetler (gender'a göre)
  const filteredGarments = useMemo(() => {
    if (selectedFilter === 'all') return garments;
    return garments.filter((g) => g.gender === selectedFilter);
  }, [garments, selectedFilter]);

  // Filtre sayıları
  const filterCounts = useMemo(() => {
    const counts: Record<GenderFilter, number> = {
      all: garments.length,
      male: 0,
      female: 0,
    };
    garments.forEach((g) => {
      if (g.gender === 'male') counts.male++;
      else if (g.gender === 'female') counts.female++;
    });
    return counts;
  }, [garments]);

  const handleFilterSelect = (filter: GenderFilter) => {
    setSelectedFilter(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleGarmentSelect = (garment: Garment) => {
    setSelectedGarmentId(garment.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create');
  };

  const handleGarmentLongPress = (garment: Garment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      garment.title,
      'Bu kıyafeti silmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            removeGarment(garment.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleAddGarment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-garment');
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
          <DisplaySmall>{t('wardrobe.title')}</DisplaySmall>
          <BodyMedium color="secondary">
            {garments.length > 0
              ? t('wardrobe.garmentsCount', { count: garments.length })
              : t('wardrobe.addAndTry')}
          </BodyMedium>
        </Animated.View>

        {/* Gender filter chips */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {FILTERS.map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => handleFilterSelect(filter.key)}
                style={[
                  styles.categoryChip,
                  selectedFilter === filter.key && styles.categoryChipActive,
                ]}
                accessibilityRole="tab"
                accessibilityLabel={filter.label}
                accessibilityState={{ selected: selectedFilter === filter.key }}
              >
                <Image
                  source={getFilterIcon(filter.key)}
                  style={[
                    styles.categoryIcon,
                    selectedFilter === filter.key && styles.categoryIconActive,
                  ]}
                  resizeMode="contain"
                />
                <LabelMedium
                  color={selectedFilter === filter.key ? 'accent' : 'secondary'}
                >
                  {filter.label}
                </LabelMedium>
                {filterCounts[filter.key] > 0 && (
                  <View style={styles.categoryCount}>
                    <LabelSmall color={selectedFilter === filter.key ? 'accent' : 'tertiary'}>
                      {filterCounts[filter.key]}
                    </LabelSmall>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Add garment button */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard style={styles.addCard} onPress={handleAddGarment}>
            <View style={styles.addCardContent}>
              <View style={styles.addIconContainer}>
                <Image
                  source={require('../../full3dicons/images/plus-sign.png')}
                  style={styles.addIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.addCardText}>
                <LabelMedium>{t('wardrobe.addGarment')}</LabelMedium>
                <BodySmall color="secondary">{t('wardrobe.addGarmentSubtitle')}</BodySmall>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Garments Section */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.garmentSection}
        >
          {filteredGarments.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <HeadlineSmall>{t('wardrobe.myGarments')}</HeadlineSmall>
                <LabelSmall color="secondary">
                  {t('wardrobe.productsCount', { count: filteredGarments.length })}
                </LabelSmall>
              </View>

              <View style={styles.garmentGrid}>
                {filteredGarments.map((garment, index) => (
                  <GarmentCard
                    key={garment.id}
                    garment={garment}
                    onPress={() => handleGarmentSelect(garment)}
                    onLongPress={() => handleGarmentLongPress(garment)}
                    delay={index * 50}
                  />
                ))}
              </View>
            </>
          ) : (
            /* Empty State */
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <GlassCard style={styles.emptyCard}>
                <Image
                  source={require('../../full3dicons/images/wardrobe.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
                <HeadlineSmall style={styles.emptyTitle}>
                  {selectedFilter === 'all'
                    ? t('wardrobe.wardrobeEmpty')
                    : t('wardrobe.categoryEmpty')}
                </HeadlineSmall>
                <BodyMedium color="secondary" style={styles.emptyText}>
                  {t('wardrobe.addGarmentsToStart')}
                </BodyMedium>
              </GlassCard>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

type GarmentCardProps = {
  garment: Garment;
  onPress: () => void;
  onLongPress: () => void;
  delay: number;
};

const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onPress,
  onLongPress,
  delay,
}) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <GlassCard style={styles.garmentCard}>
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
              style={styles.garmentImagePlaceholder}
              resizeMode="contain"
            />
          )}
          {/* Dene butonu - görsel içinde */}
          <View style={styles.tryOnBadge}>
            <Image
              source={require('../../full3dicons/images/ai-sparkle.png')}
              style={styles.tryOnIcon}
              resizeMode="contain"
            />
            <LabelSmall style={styles.tryOnText}>Dene</LabelSmall>
          </View>
        </View>
        <View style={styles.garmentInfo}>
          <LabelMedium numberOfLines={1}>{garment.title}</LabelMedium>
          {garment.brand && (
            <LabelSmall color="secondary">{garment.brand}</LabelSmall>
          )}
        </View>
      </GlassCard>
    </Pressable>
  </Animated.View>
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
    gap: 4,
  },
  categoriesScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  categoryIcon: {
    width: 20,
    height: 20,
    opacity: 0.5,
  },
  categoryIconActive: {
    opacity: 1,
  },
  categoryCount: {
    marginLeft: 2,
  },
  addCard: {
    padding: 16,
  },
  addCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 28,
    height: 28,
  },
  addCardText: {
    flex: 1,
    gap: 2,
  },
  garmentSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  garmentCard: {
    width: (width - Spacing.page * 2 - 12) / 2,
    padding: 10,
  },
  garmentImageContainer: {
    aspectRatio: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },
  garmentImagePlaceholder: {
    width: '60%',
    height: '60%',
    opacity: 0.5,
  },
  garmentInfo: {
    gap: 2,
  },
  tryOnBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(163, 230, 53, 0.95)',
    borderRadius: BorderRadius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tryOnIcon: {
    width: 14,
    height: 14,
    tintColor: '#0B0B0C',
  },
  tryOnText: {
    color: '#0B0B0C',
    fontWeight: '700',
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
});

export default WardrobeScreen;
