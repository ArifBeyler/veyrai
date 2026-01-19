import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/ui/theme';
import {
  DisplaySmall,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
  EditorialText,
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
  const { t, currentLanguage } = useTranslation();
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

        {/* Time filter - Muted when empty */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.filterContainer}
        >
          {(['all', 'today', 'week'] as TimeFilter[]).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => handleFilterSelect(filter)}
              disabled={completedJobs.length === 0}
              style={[
                styles.filterChip,
                timeFilter === filter && styles.filterChipActive,
                completedJobs.length === 0 && styles.filterChipMuted,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: timeFilter === filter }}
            >
              <LabelMedium
                color={timeFilter === filter ? 'accent' : 'secondary'}
                style={completedJobs.length === 0 ? styles.filterTextMuted : undefined}
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
              <HeadlineSmall>{t('gallery.results')}</HeadlineSmall>
              <LabelSmall color="secondary">
                {filteredJobs.length === 1 
                  ? t('gallery.imageCount', { count: filteredJobs.length })
                  : t('gallery.imageCountPlural', { count: filteredJobs.length })}
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
                        {new Date(job.createdAt).toLocaleDateString(
                          currentLanguage === 'tr' ? 'tr-TR' : 'en-US',
                          {
                            day: 'numeric',
                            month: 'short',
                          }
                        )}
                      </LabelSmall>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : (
          /* Empty State - Premium Editorial Design */
          <EmptyStateView onPress={handleNewTryOn} t={t} />
        )}
      </ScrollView>
    </View>
  );
};

// Empty State Component with Editorial Design
const EmptyStateView: React.FC<{ onPress: () => void; t: (key: string) => string }> = ({
  onPress,
  t,
}) => {
  // Subtle float animation for icon
  const floatY = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(10);

  useEffect(() => {
    // Entry animation
    cardOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    cardScale.value = withSpring(1, { damping: 15, stiffness: 90 });
    
    // CTA appears last
    ctaOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    ctaTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 90 }));

    // Idle float animation (very slow, subtle)
    floatY.value = withRepeat(
      withTiming(-8, {
        duration: 5000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Subtle pulse for icon
    iconScale.value = withRepeat(
      withTiming(1.05, {
        duration: 6000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: iconScale.value },
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.emptyState, cardAnimatedStyle]}>
      <View style={styles.emptyCard}>
        {/* Icon with subtle animation */}
        <Animated.View style={iconAnimatedStyle}>
          <Image
            source={require('../../full3dicons/images/photo.png')}
            style={styles.emptyIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title - Canela (Editorial) */}
        <EditorialText
          size={28}
          weight="regular"
          letterSpacing={-1.5}
          color="primary"
          style={styles.emptyTitle}
        >
          {t('gallery.emptyTitle') || 'Your gallery starts here'}
        </EditorialText>

        {/* Subtitle - SF Pro Text */}
        <BodyMedium color="secondary" style={styles.emptySubtitle}>
          {t('gallery.emptySubtitle') || 'Every try-on you create will be saved here.'}
        </BodyMedium>

        {/* CTA Button - Same style as onboarding */}
        <Animated.View style={[styles.ctaContainer, ctaAnimatedStyle]}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={styles.ctaButton}
          >
            <LinearGradient
              colors={[Colors.accent.primary, '#8BE04F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <LabelLarge color="inverse" style={styles.ctaText}>
                {t('gallery.startFirstTry') || 'Create your first look'}
              </LabelLarge>
            </LinearGradient>
          </TouchableOpacity>

          {/* Optional helper text */}
          <BodySmall color="tertiary" style={styles.helperText}>
            {t('gallery.emptyHelper') || 'It only takes a few seconds'}
          </BodySmall>
        </Animated.View>
      </View>
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
  filterChipMuted: {
    opacity: 0.45,
  },
  filterTextMuted: {
    opacity: 0.6,
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
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 20,
    backgroundColor: Colors.dark.surface,
    borderRadius: 30, // 28-32 range, using 30
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
    ...Shadows.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    opacity: 0.5,
    marginBottom: 8,
  },
  emptyTitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    maxWidth: 280,
    lineHeight: 22,
  },
  ctaContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    width: '100%',
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
    ...Shadows.glow(Colors.accent.primary),
  },
  ctaGradient: {
    paddingVertical: Spacing.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    // Using LabelLarge from Typography system
    fontWeight: '600' as const,
  },
  helperText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});

export default GalleryScreen;

