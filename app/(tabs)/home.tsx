import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../../src/ui/theme';
import {
  DisplaySmall,
  HeadlineMedium,
  HeadlineSmall,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../../src/ui/Typography';
import { GlassCard } from '../../src/ui/GlassCard';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { useSessionStore } from '../../src/state/useSessionStore';

const { width } = Dimensions.get('window');
const CARD_GAP = 16;

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const jobs = useSessionStore((s) => s.jobs);
  const profiles = useSessionStore((s) => s.profiles);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const isPremium = useSessionStore((s) => s.isPremium);

  // Tamamlanmış üretimler
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const hasCompletedResults = completedJobs.length > 0;
  const hasCredits = !freeCreditsUsed || isPremium;

  // Profil fotoğrafı sayısı
  const totalProfilePhotos = profiles.reduce(
    (acc, p) => acc + (p.photos?.length || 0),
    0
  );

  const handleNewTryOn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create');
  };

  const handleAddPhoto = () => {
    router.push('/create');
  };

  const handleViewGallery = () => {
    router.push('/(tabs)/gallery');
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
          <View style={styles.headerLeft}>
            <BodySmall color="secondary">Hoş geldin 👋</BodySmall>
            <DisplaySmall>FIT-SWAP</DisplaySmall>
          </View>
          <View style={styles.creditBadge}>
            <Image
              source={require('../../full3dicons/images/sparkle.png')}
              style={styles.creditIcon}
              resizeMode="contain"
            />
            <LabelSmall color={hasCredits ? 'accent' : 'secondary'}>
              {isPremium ? 'Premium' : freeCreditsUsed ? '0 Kredi' : '1 Kredi'}
            </LabelSmall>
          </View>
        </Animated.View>

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.heroCard} onPress={handleNewTryOn}>
            <LinearGradient
              colors={[Colors.accent.primaryDim, 'transparent']}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroText}>
                <HeadlineMedium>Yeni Deneme</HeadlineMedium>
                <BodyMedium color="secondary" style={styles.heroDescription}>
                  Kıyafeti üzerinde gör, tek tıkla
                </BodyMedium>
                <PrimaryButton
                  title="Başla"
                  onPress={handleNewTryOn}
                  size="md"
                  style={styles.heroButton}
                />
              </View>
              <Image
                source={require('../../full3dicons/images/t-shirt.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.quickActions}
        >
          <QuickActionCard
            icon={require('../../full3dicons/images/camera.png')}
            title="Fotoğraf Ekle"
            subtitle={totalProfilePhotos > 0 ? `${totalProfilePhotos} fotoğraf` : 'Profil ekle'}
            onPress={handleAddPhoto}
          />
          <QuickActionCard
            icon={require('../../full3dicons/images/wardrobe.png')}
            title="Gardrop"
            subtitle="Kıyafetleri gör"
            onPress={() => router.push('/(tabs)/wardrobe')}
          />
        </Animated.View>

        {/* Completed Results Grid */}
        {hasCompletedResults ? (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.sectionHeader}>
              <HeadlineSmall>Son Sonuçlar</HeadlineSmall>
              <Pressable onPress={handleViewGallery}>
                <LabelMedium color="accent">Tümünü Gör</LabelMedium>
              </Pressable>
            </View>

            {/* Dinamik grid - görsel sayısına göre */}
            <View style={[
              styles.resultsGrid,
              completedJobs.length === 1 && styles.resultsGridSingle,
              completedJobs.length === 2 && styles.resultsGridDouble,
            ]}>
              {completedJobs.filter(job => job.resultImageUrl).slice(0, 6).map((job, index) => (
                <Pressable
                  key={job.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: '/generation/[id]',
                      params: {
                        id: job.id,
                        imageUrl: encodeURIComponent(job.resultImageUrl!),
                      },
                    });
                  }}
                  style={[
                    completedJobs.length === 1 && styles.resultCardSingle,
                    completedJobs.length === 2 && styles.resultCardDouble,
                  ]}
                >
                  <GlassCard style={[
                    styles.resultGridCard,
                    completedJobs.length === 1 && styles.resultGridCardSingle,
                    completedJobs.length === 2 && styles.resultGridCardDouble,
                  ]}>
                    <Image
                      source={{ uri: job.resultImageUrl }}
                      style={[
                        styles.resultGridImage,
                        completedJobs.length === 1 && styles.resultGridImageSingle,
                        completedJobs.length === 2 && styles.resultGridImageDouble,
                      ]}
                      resizeMode="cover"
                    />
                  </GlassCard>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          /* Empty State */
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <GlassCard style={styles.emptyCard}>
              <Image
                source={require('../../full3dicons/images/ai-sparkle.png')}
                style={styles.emptyIcon}
                resizeMode="contain"
              />
              <HeadlineSmall style={styles.emptyTitle}>
                Henüz sonuç yok
              </HeadlineSmall>
              <BodyMedium color="secondary" style={styles.emptyText}>
                İlk denemenizi yaparak başlayın
              </BodyMedium>
              <PrimaryButton
                title="İlk Denemeyi Yap"
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

type QuickActionCardProps = {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => (
  <GlassCard style={styles.quickActionCard} onPress={onPress}>
    <Image source={icon} style={styles.quickActionIcon} resizeMode="contain" />
    <View style={styles.quickActionText}>
      <LabelMedium>{title}</LabelMedium>
      <BodySmall color="secondary">{subtitle}</BodySmall>
    </View>
  </GlassCard>
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
    gap: CARD_GAP,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    gap: 4,
  },
  creditBadge: {
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
  creditIcon: {
    width: 16,
    height: 16,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  heroContent: {
    flexDirection: 'row',
    padding: 20,
  },
  heroText: {
    flex: 1,
    gap: 8,
  },
  heroDescription: {
    marginBottom: 8,
  },
  heroButton: {
    alignSelf: 'flex-start',
  },
  heroImage: {
    width: 100,
    height: 100,
    marginLeft: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - Spacing.page * 2 - CARD_GAP) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
  },
  quickActionText: {
    flex: 1,
    gap: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Grid for completed results
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultsGridSingle: {
    justifyContent: 'center',
  },
  resultsGridDouble: {
    justifyContent: 'space-between',
  },
  resultGridCard: {
    width: (width - Spacing.page * 2 - 24) / 3,
    padding: 6,
  },
  resultGridCardSingle: {
    width: width - Spacing.page * 2,
    padding: 10,
  },
  resultGridCardDouble: {
    width: (width - Spacing.page * 2 - 12) / 2,
    padding: 8,
  },
  resultCardSingle: {
    width: '100%',
  },
  resultCardDouble: {
    width: (width - Spacing.page * 2 - 12) / 2,
  },
  resultGridImage: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: BorderRadius.sm,
  },
  resultGridImageSingle: {
    aspectRatio: 0.8,
    borderRadius: BorderRadius.md,
  },
  resultGridImageDouble: {
    aspectRatio: 0.75,
    borderRadius: BorderRadius.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    opacity: 0.8,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default HomeScreen;
