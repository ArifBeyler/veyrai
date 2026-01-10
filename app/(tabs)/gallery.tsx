import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../../src/ui/theme';
import {
  DisplaySmall,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../../src/ui/Typography';
import { GlassCard } from '../../src/ui/GlassCard';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { useSessionStore } from '../../src/state/useSessionStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

type TimeFilter = 'all' | 'today' | 'week';

const GalleryScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const jobs = useSessionStore((s) => s.jobs);

  // Sadece tamamlanmış ve resultImageUrl'si olan job'ları al
  const completedJobs = jobs.filter((j) => j.status === 'completed' && j.resultImageUrl);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filteredJobs = completedJobs.filter((job) => {
    if (timeFilter === 'all') return true;
    const jobDate = new Date(job.createdAt);
    if (timeFilter === 'today') return jobDate >= todayStart;
    if (timeFilter === 'week') return jobDate >= weekStart;
    return true;
  });

  const handleFilterSelect = (filter: TimeFilter) => {
    setTimeFilter(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleJobPress = (job: typeof completedJobs[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/generation/[id]',
      params: {
        id: job.id,
        imageUrl: encodeURIComponent(job.resultImageUrl!),
        humanImageUri: job.humanImageUri ? encodeURIComponent(job.humanImageUri) : undefined,
      },
    });
  };

  const handleNewTryOn = () => {
    router.push('/create');
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
          <DisplaySmall>{t('gallery.title')}</DisplaySmall>
          <BodyMedium color="secondary">
            {t('gallery.subtitle')}
          </BodyMedium>
        </Animated.View>

        {/* Time filter */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.filterContainer}
        >
          {(['all', 'today', 'week'] as TimeFilter[]).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => handleFilterSelect(filter)}
              style={[
                styles.filterChip,
                timeFilter === filter && styles.filterChipActive,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: timeFilter === filter }}
            >
              <LabelMedium
                color={timeFilter === filter ? 'accent' : 'secondary'}
              >
                {filter === 'all' && t('gallery.all')}
                {filter === 'today' && t('gallery.today')}
                {filter === 'week' && t('gallery.thisWeek')}
              </LabelMedium>
            </Pressable>
          ))}
        </Animated.View>

        {/* Gallery Grid */}
        {filteredJobs.length > 0 ? (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.gallerySection}
          >
            <View style={styles.sectionHeader}>
              <HeadlineSmall>Sonuçlar</HeadlineSmall>
              <LabelSmall color="secondary">
                {filteredJobs.length} görsel
              </LabelSmall>
            </View>

            <View style={[
              styles.galleryGrid,
              filteredJobs.length === 1 && styles.galleryGridSingle,
            ]}>
              {filteredJobs.map((job, index) => (
                <Animated.View
                  key={job.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={filteredJobs.length === 1 ? styles.galleryCardWrapperSingle : undefined}
                >
                  <GlassCard
                    style={[
                      styles.galleryCard,
                      filteredJobs.length === 1 && styles.galleryCardSingle,
                    ]}
                    onPress={() => handleJobPress(job)}
                  >
                    <View style={[
                      styles.galleryImageContainer,
                      filteredJobs.length === 1 && styles.galleryImageContainerSingle,
                    ]}>
                      <Image
                        source={{ uri: job.resultImageUrl }}
                        style={styles.galleryImage}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </View>

                    <View style={styles.galleryCardInfo}>
                      <LabelSmall color="secondary">
                        {new Date(job.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </LabelSmall>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : (
          /* Empty State */
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.emptyState}
          >
            <GlassCard style={styles.emptyCard}>
              <Image
                source={require('../../full3dicons/images/photo.png')}
                style={styles.emptyIcon}
                resizeMode="contain"
              />
              <HeadlineSmall style={styles.emptyTitle}>
                {t('gallery.emptyTitle')}
              </HeadlineSmall>
              <BodyMedium color="secondary" style={styles.emptyText}>
                {t('gallery.emptySubtitle')}
              </BodyMedium>
              <PrimaryButton
                title={t('gallery.startFirstTry')}
                onPress={handleNewTryOn}
                size="md"
              />
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
  },
  filterChipActive: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  gallerySection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryGridSingle: {
    justifyContent: 'center',
  },
  galleryCard: {
    width: (width - Spacing.page * 2 - 12) / 2,
    padding: 8,
  },
  galleryCardSingle: {
    width: width - Spacing.page * 2,
    padding: 10,
  },
  galleryCardWrapperSingle: {
    width: '100%',
  },
  galleryImageContainer: {
    aspectRatio: 0.75,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  galleryImageContainerSingle: {
    aspectRatio: 0.8,
  },
  galleryImage: {
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
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.surface,
  },
  statusProcessing: {
    backgroundColor: Colors.accent.primaryDim,
  },
  statusQueued: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  statusFailed: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
  },
  galleryCardInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  emptyState: {
    marginTop: 40,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    opacity: 0.4,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default GalleryScreen;

