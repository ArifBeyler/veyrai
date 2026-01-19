import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
import { translateGarmentTitle } from '../../src/utils/garmentTitle';
import { AppIcon } from '../../src/utils/iconHelper';
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
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

type GenderFilter = 'all' | 'male' | 'female';

// Filtre ikonları
const getFilterIconName = (filter: GenderFilter): string => {
  switch (filter) {
    case 'all':
      return 'wardrobe';
    case 'male':
      return 'man';
    case 'female':
      return 'woman';
    default:
      return 'wardrobe';
  }
};

// FILTERS will be created dynamically using translations

const WardrobeScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<GenderFilter>('all');
  
  const garments = useSessionStore((s) => s.garments);
  const setSelectedGarmentId = useSessionStore((s) => s.setSelectedGarmentId);
  const removeGarment = useSessionStore((s) => s.removeGarment);

  // Filtrelenmiş kıyafetler (gender'a göre) - Kadın kombinleri önce
  const filteredGarments = useMemo(() => {
    let filtered = garments;
    
    // Gender filtresi
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((g) => g.gender === selectedFilter);
    }
    
    // Sıralama: Kadın kombinleri önce, sonra erkek
    return filtered.sort((a, b) => {
      if (a.gender === 'female' && b.gender !== 'female') return -1;
      if (a.gender !== 'female' && b.gender === 'female') return 1;
      return 0;
    });
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
      translateGarmentTitle(garment.title),
      t('wardrobe.deleteGarmentConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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
        colors={theme.colors.backgroundGradient as unknown as [string, string, string]}
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
            {(['all', 'male', 'female'] as GenderFilter[]).map((filter) => {
              const label = filter === 'all' ? t('wardrobe.all') : 
                           filter === 'male' ? t('wardrobe.male') : 
                           t('wardrobe.female');
              return (
                <Pressable
                  key={filter}
                  onPress={() => handleFilterSelect(filter)}
                  style={[
                    styles.categoryChip,
                    selectedFilter === filter && styles.categoryChipActive,
                  ]}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: selectedFilter === filter }}
                >
                  <AppIcon
                    name={getFilterIconName(filter)}
                    size={20}
                    color={selectedFilter === filter ? Colors.accent.primary : Colors.text.secondary}
                    weight={selectedFilter === filter ? 'fill' : 'regular'}
                  />
                  <LabelMedium
                    color={selectedFilter === filter ? 'accent' : 'secondary'}
                  >
                    {label}
                  </LabelMedium>
                  {filterCounts[filter] > 0 && (
                    <View style={styles.categoryCount}>
                      <LabelSmall color={selectedFilter === filter ? 'accent' : 'tertiary'}>
                        {filterCounts[filter]}
                      </LabelSmall>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Add garment button */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Pressable onPress={handleAddGarment} style={styles.addCardWrapper}>
            <LinearGradient
              colors={[Colors.accent.primaryDim + '40', Colors.accent.primaryDim + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addCardGradient}
            >
              <BlurView intensity={40} tint="dark" style={styles.addCardBlur}>
                <View style={styles.addCardContent}>
                  <View style={styles.addIconContainer}>
                    <LinearGradient
                      colors={[Colors.accent.primary, Colors.accent.primaryDim]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.addIconGradient}
                    >
                      <AppIcon
                        name="plus-sign"
                        size={28}
                        color={Colors.dark.background}
                        weight="bold"
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.addCardText}>
                    <LabelMedium style={styles.addCardTitle}>{t('wardrobe.addGarment')}</LabelMedium>
                    <BodySmall color="secondary" style={styles.addCardSubtitle}>
                      {t('wardrobe.addGarmentSubtitle')}
                    </BodySmall>
                  </View>
                  <View style={styles.addCardArrow}>
                    <AppIcon
                      name="chevron-forward"
                      size={20}
                      color={Colors.accent.primary}
                      weight="bold"
                    />
                  </View>
                </View>
              </BlurView>
            </LinearGradient>
          </Pressable>
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
                <AppIcon
                  name="wardrobe"
                  size={64}
                  color={Colors.text.tertiary}
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
}) => {
  const { t } = useTranslation();
  return (
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
            <AppIcon
              name="t-shirt"
              size={48}
              color={Colors.text.tertiary}
            />
          )}
          {/* Dene butonu - görsel içinde */}
          <View style={styles.tryOnBadge}>
            <AppIcon
              name="ai-sparkle"
              size={20}
              color={Colors.accent.primary}
              weight="fill"
            />
            <LabelSmall style={styles.tryOnText}>{t('wardrobe.try')}</LabelSmall>
          </View>
        </View>
        <View style={styles.garmentInfo}>
          <LabelMedium numberOfLines={1}>{translateGarmentTitle(garment.title)}</LabelMedium>
          {garment.brand && (
            <LabelSmall color="secondary">{garment.brand}</LabelSmall>
          )}
        </View>
      </GlassCard>
    </Pressable>
  </Animated.View>
  );
};

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
  addCardWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.accent.primaryDim,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addCardGradient: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  addCardBlur: {
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  addCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  addIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    width: 28,
    height: 28,
  },
  addCardText: {
    flex: 1,
    gap: 4,
  },
  addCardTitle: {
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  addCardSubtitle: {
    opacity: 0.8,
  },
  addCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent.primaryDim + '30',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default WardrobeScreen;
