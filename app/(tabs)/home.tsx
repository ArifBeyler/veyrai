import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/ui/theme';
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
import { useTranslation } from '../../src/hooks/useTranslation';
import { useTheme } from '../../src/theme';
import { AppIcon } from '../../src/utils/iconHelper';
import { Sparkle, Star, Plus, CaretRight } from 'phosphor-react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.55;
const CARD_HEIGHT = height * 0.42;
const ITEM_CARD_WIDTH = 140;

// Sample outfit images for empty state fan-out effect - using all available images
const SAMPLE_OUTFITS = [
  require('../../assets/images/combines/female/female-outfit-4.png'),
  require('../../assets/images/combines/female/female-outfit-5.png'),
  require('../../assets/images/combines/female/female-outfit-6.png'),
  require('../../assets/images/combines/female/female-outfit-7.png'),
  require('../../assets/images/combines/female/female-outfit-8.png'),
  require('../../assets/images/combines/female/female-outfit-1.png'),
  require('../../assets/images/combines/female/female-outfit-3.png'),
  require('../../assets/images/combines/female/56869c66f7915f78a8eb1adf57acb321.jpg'),
  require('../../assets/images/combines/female/295ccb2641f5cd5e1262c009899cd844.jpg'),
  require('../../assets/images/combines/female/female-outfit-2.jpg'),
];

// Sample items for Items section - using all available images including new ones
const SAMPLE_ITEMS = [
  { id: 'sample-1', title: 'Elegant Dress', image: require('../../assets/images/combines/female/female-outfit-4.png'), brand: 'Zara' },
  { id: 'sample-2', title: 'Casual Look', image: require('../../assets/images/combines/female/female-outfit-5.png'), brand: 'H&M' },
  { id: 'sample-3', title: 'Street Style', image: require('../../assets/images/combines/female/female-outfit-6.png'), brand: 'Mango' },
  { id: 'sample-4', title: 'Chic Outfit', image: require('../../assets/images/combines/female/female-outfit-7.png'), brand: 'Massimo' },
  { id: 'sample-5', title: 'Modern Style', image: require('../../assets/images/combines/female/female-outfit-8.png'), brand: 'COS' },
  { id: 'sample-7', title: 'Trendy Style', image: require('../../assets/images/combines/female/female-outfit-1.png'), brand: 'H&M' },
  { id: 'sample-8', title: 'Fashion Forward', image: require('../../assets/images/combines/female/female-outfit-3.png'), brand: 'Mango' },
  { id: 'sample-9', title: 'Boho Chic', image: require('../../assets/images/combines/female/ed3ff803e77d722d29078ede9f4fcdf9.jpg'), brand: 'COS' },
  { id: 'sample-10', title: 'Minimalist', image: require('../../assets/images/combines/female/a072d4d0fbc826eaf3a2b3becf28bcb1.jpg'), brand: 'Zara' },
  { id: 'sample-11', title: 'Urban Style', image: require('../../assets/images/combines/female/00e646e68b9f4550586f9b52b5177a3d.jpg'), brand: 'H&M' },
  { id: 'sample-12', title: 'Elegant', image: require('../../assets/images/combines/female/70f262731db5398076d324601b9a5068.jpg'), brand: 'Massimo' },
  { id: 'sample-13', title: 'Casual Elegance', image: require('../../assets/images/combines/female/4aad39624b4dac3a99b905ba2252919c.jpg'), brand: 'COS' },
  { id: 'sample-14', title: 'Stylish', image: require('../../assets/images/combines/female/03046389600-p.jpg'), brand: 'Zara' },
  { id: 'sample-15', title: 'Contemporary', image: require('../../assets/images/combines/female/03046312500-p.jpg'), brand: 'H&M' },
  { id: 'sample-16', title: 'Fashionista', image: require('../../assets/images/combines/female/56869c66f7915f78a8eb1adf57acb321.jpg'), brand: 'Mango' },
  { id: 'sample-17', title: 'Sophisticated', image: require('../../assets/images/combines/female/295ccb2641f5cd5e1262c009899cd844.jpg'), brand: 'COS' },
  { id: 'sample-18', title: 'Chic Look', image: require('../../assets/images/combines/female/04d381e7a12ad1f24eeb1639dd94062f.jpg'), brand: 'Zara' },
  { id: 'sample-19', title: 'Trendsetter', image: require('../../assets/images/combines/female/134bab4b62a7d9990770d5c8212458a1.jpg'), brand: 'H&M' },
  { id: 'sample-20', title: 'Elegance', image: require('../../assets/images/combines/female/27b11e9ad4a5c914d40365b82ec7776e.jpg'), brand: 'Massimo' },
  { id: 'sample-21', title: 'Style Icon', image: require('../../assets/images/combines/female/60934af5e9cb442c129d39947dac7aa1.jpg'), brand: 'COS' },
  { id: 'sample-22', title: 'Fashionable', image: require('../../assets/images/combines/female/6812b7202d76ebb975a23732af8bd399.jpg'), brand: 'Zara' },
  { id: 'sample-23', title: 'Modern Chic', image: require('../../assets/images/combines/female/6bdddc3a1081edfcfbe6e6aaea72df2c.jpg'), brand: 'H&M' },
  { id: 'sample-24', title: 'Classic Look', image: require('../../assets/images/combines/female/female-outfit-2.jpg'), brand: 'Zara' },
];

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const jobs = useSessionStore((s) => s.jobs);
  const garments = useSessionStore((s) => s.garments);
  const profiles = useSessionStore((s) => s.profiles);
  const freeCreditsUsed = useSessionStore((s) => s.freeCreditsUsed);
  const isPremium = useSessionStore((s) => s.isPremium);
  const credits = useSessionStore((s) => s.credits);
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Tamamlanmış üretimler (Styles) - En yeni önce
  const completedJobs = jobs
    .filter((j) => j.status === 'completed' && j.resultImageUrl)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const hasCompletedResults = completedJobs.length > 0;
  
  // En son görseli ortada göstermek için scroll
  useEffect(() => {
    if (hasCompletedResults && flatListRef.current && completedJobs.length > 0) {
      // En son görseli ortada göstermek için scroll
      setTimeout(() => {
        const lastIndex = completedJobs.length - 1;
        const offset = lastIndex * (CARD_WIDTH + 16) - (width - CARD_WIDTH) / 2;
        flatListRef.current?.scrollToOffset({
          offset: Math.max(0, offset),
          animated: false,
        });
        setActiveStyleIndex(lastIndex);
      }, 200);
    }
  }, [hasCompletedResults, completedJobs.length]);

  const handleNewTryOn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create');
  };

  const handleViewResult = (job: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/generation/[id]',
      params: {
        id: job.id,
        imageUrl: encodeURIComponent(job.resultImageUrl!),
        humanImageUri: job.humanImageUri ? encodeURIComponent(job.humanImageUri) : undefined,
      },
    });
  };

  const handleGarmentPress = (garment: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Gardrop sayfasına git veya direkt create'e yönlendir
    router.push('/(tabs)/wardrobe');
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
          { paddingTop: insets.top + 12, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Minimal */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <DisplaySmall style={styles.brandName}>{t('home.welcome')}</DisplaySmall>
          </View>
          <View style={styles.headerRight}>
            {/* Credits Display */}
            {!isPremium && (
              <Pressable 
                style={styles.creditsContainer}
                onPress={() => router.push('/paywall')}
              >
                <View style={styles.creditsBadge}>
                  <Sparkle size={16} color={Colors.accent.primary} weight="regular" />
                  <LabelMedium color="primary" style={styles.creditsText}>
                    {!freeCreditsUsed ? 1 : credits}
                  </LabelMedium>
                </View>
              </Pressable>
            )}
            {isPremium && (
              <View style={styles.creditsContainer}>
                <View style={[styles.creditsBadge, styles.premiumBadge]}>
                  <Star size={16} color={Colors.accent.primary} weight="fill" />
                  <LabelMedium color="primary" style={styles.creditsText}>
                    Premium
                  </LabelMedium>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Styles Section - Card Stack */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          {hasCompletedResults && (
            <View style={styles.sectionHeader}>
              <View style={styles.headerLeft} />
              <Pressable onPress={() => router.push('/(tabs)/gallery')}>
                <LabelMedium color="accent">{t('home.seeAll')}</LabelMedium>
              </Pressable>
            </View>
          )}

          {hasCompletedResults ? (
            <View style={styles.cardStackContainer}>
              <FlatList
                ref={flatListRef}
                data={completedJobs}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.cardStackContent}
                getItemLayout={(data, index) => ({
                  length: CARD_WIDTH + 16,
                  offset: (CARD_WIDTH + 16) * index,
                  index,
                })}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
                  setActiveStyleIndex(index);
                }}
                onScrollToIndexFailed={(info) => {
                  // Index bulunamazsa scrollToOffset kullan
                  const wait = new Promise((resolve) => setTimeout(resolve, 500));
                  wait.then(() => {
                    flatListRef.current?.scrollToOffset({
                      offset: info.averageItemLength * info.index,
                      animated: true,
                    });
                    setActiveStyleIndex(info.index);
                  });
                }}
                renderItem={({ item: job, index }) => (
                  <Pressable
                    key={job.id}
                    onPress={() => handleViewResult(job)}
                    style={[
                      styles.styleCard,
                      index === activeStyleIndex && styles.styleCardActive,
                    ]}
                  >
                    <Image
                      source={{ uri: job.resultImageUrl }}
                      style={styles.styleCardImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
              />
              {/* Pagination Dots */}
              <View style={styles.pagination}>
                {completedJobs.slice(0, 10).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === activeStyleIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
              
              {/* Generate Button - Centered below cards */}
              <View style={styles.generateButtonContainer}>
                <PrimaryButton
                  title={t('home.start')}
                  onPress={handleNewTryOn}
                  size="md"
                />
              </View>
            </View>
          ) : (
            /* Empty State - Fan-out Card Stack */
            <View style={styles.emptyCardStack}>
              {/* Back cards - Sample outfits (fan spread) */}
              <View style={[styles.fanCard, styles.fanCardFarLeft]}>
                <Image
                  source={SAMPLE_OUTFITS[0]}
                  style={styles.fanCardImage}
                  contentFit="cover"
                />
              </View>
              <View style={[styles.fanCard, styles.fanCardLeft]}>
                <Image
                  source={SAMPLE_OUTFITS[1]}
                  style={styles.fanCardImage}
                  contentFit="cover"
                />
              </View>
              
              {/* Center card with image */}
              <View style={[styles.fanCard, styles.fanCardCenterBg]}>
                <Image
                  source={SAMPLE_OUTFITS[3]}
                  style={styles.fanCardImage}
                  contentFit="cover"
                />
              </View>
              
              <View style={[styles.fanCard, styles.fanCardRight]}>
                <Image
                  source={SAMPLE_OUTFITS[2]}
                  style={styles.fanCardImage}
                  contentFit="cover"
                />
              </View>
              <View style={[styles.fanCard, styles.fanCardFarRight]}>
                <Image
                  source={SAMPLE_OUTFITS[4]}
                  style={styles.fanCardImage}
                  contentFit="cover"
                />
              </View>
              
              {/* Center overlay - Blurred without border */}
              <View style={styles.fanCardOverlay}>
                <BlurView intensity={60} tint="dark" style={styles.fanCardBlur}>
                  <View style={styles.fanCardCTA}>
                    <View style={styles.emptyIconContainer}>
                      <Sparkle size={36} color={Colors.accent.primary} weight="regular" />
                    </View>
                    <HeadlineMedium style={styles.emptyTitle}>
                      {!freeCreditsUsed 
                        ? t('home.tryFreeYouHaveCredit')
                        : credits > 0
                          ? t('home.youHaveCredits', { count: credits })
                          : t('home.createFirst')
                      }
                    </HeadlineMedium>
                    {!freeCreditsUsed ? (
                      <BodySmall color="secondary" style={styles.emptySubtitle}>
                        {t('home.youHaveOneFreeCredit')}
                      </BodySmall>
                    ) : (
                      <BodySmall color="secondary" style={styles.emptySubtitle}>
                        {t('home.createFirstDesc')}
                      </BodySmall>
                    )}
                    {/* Try it now button inside the box */}
                    {!freeCreditsUsed && (
                      <TryItNowButton onPress={handleNewTryOn} />
                    )}
                  </View>
                </BlurView>
              </View>
              
              {/* Generate Button - Centered below empty state */}
              <View style={styles.generateButtonContainer}>
                <PrimaryButton
                  title={t('home.start')}
                  onPress={handleNewTryOn}
                  size="md"
                />
              </View>
              
              {/* Pagination Dots */}
              <View style={styles.paginationEmpty}>
                <View style={styles.paginationDot} />
                <View style={styles.paginationDot} />
                <View style={[styles.paginationDot, styles.paginationDotActive]} />
                <View style={styles.paginationDot} />
                <View style={styles.paginationDot} />
              </View>
            </View>
          )}
        </Animated.View>

        {/* Items Section - Horizontal Scroll */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <HeadlineSmall style={styles.sectionTitle}>{t('home.items')}</HeadlineSmall>
            <Pressable onPress={() => router.push('/(tabs)/wardrobe')}>
              <LabelMedium color="accent">{t('home.seeAll')}</LabelMedium>
            </Pressable>
          </View>

          <FlatList
            data={SAMPLE_ITEMS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itemsScrollContent}
            renderItem={({ item, index }) => (
              <ItemCard key={item.id} item={item} index={index} />
            )}
            keyExtractor={(item) => item.id}
          />
        </Animated.View>

        {/* Quick Start Card */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Pressable onPress={handleNewTryOn}>
            <GlassCard style={styles.quickStartCard}>
              <View style={styles.quickStartContent}>
                <View style={styles.quickStartIcon}>
                  <Plus size={28} color={Colors.accent.primary} weight="regular" />
                </View>
                <View style={styles.quickStartText}>
                  <LabelMedium>{t('home.quickStart')}</LabelMedium>
                  <BodySmall color="secondary">{t('home.quickStartDesc')}</BodySmall>
                </View>
                <CaretRight size={20} color={Colors.text.secondary} weight="regular" />
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// TryItNowButton component with press animation
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TryItNowButtonProps = {
  onPress: () => void;
};

const TryItNowButton: React.FC<TryItNowButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.tryItNowButton, animatedStyle]}
    >
      <LabelMedium color="primary" style={styles.tryItNowText}>
        {t('home.tryItNow')}
      </LabelMedium>
    </AnimatedPressable>
  );
};

// ItemCard component with press animation
type ItemCardProps = {
  item: { id: string; title: string; image: any; brand: string };
  index: number;
};

const ItemCard: React.FC<ItemCardProps> = ({ item, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create');
  };

  return (
    <Animated.View entering={FadeInDown.delay(450 + index * 50).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.itemCard, animatedStyle]}
      >
        <View style={styles.itemImageContainer}>
          <Image
            source={item.image}
            style={styles.itemImage}
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.itemInfo}>
          <LabelMedium numberOfLines={2} style={styles.itemTitle}>
            {item.title}
          </LabelMedium>
          <View style={styles.itemBrand}>
            <View style={styles.brandDot} />
            <LabelSmall color="secondary">{item.brand}</LabelSmall>
          </View>
        </View>
      </AnimatedPressable>
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
    gap: 24,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.page,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  brandName: {
    // Using DisplaySmall variant - SF Pro Text Semibold
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.accent.primaryDim,
  },
  premiumBadge: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.accent.primaryDim + '20',
  },
  creditsText: {
    // Using LabelMedium variant - fontWeight adjusted via component
    color: Colors.accent.primary,
    fontWeight: '600' as const,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...Typography.labelSmall,
    fontWeight: '600' as const,
    color: Colors.dark.background,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.page,
    marginBottom: 12,
  },
  sectionTitle: {
    // Using HeadlineSmall variant - SF Pro Text Semibold
  },
  // Card Stack
  cardStackContainer: {
    alignItems: 'center',
  },
  cardStackContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    gap: 16,
  },
  styleCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  styleCardActive: {
    transform: [{ scale: 1 }],
  },
  styleCardImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.strokeLight,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: Colors.accent.primary,
  },
  // Empty Card Stack (Fan-out effect like Dress It Yourself)
  emptyCardStack: {
    alignItems: 'center',
    justifyContent: 'center',
    height: CARD_HEIGHT + 60,
    marginHorizontal: Spacing.page,
  },
  fanCard: {
    position: 'absolute',
    width: CARD_WIDTH * 0.85,
    height: CARD_HEIGHT * 0.85,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fanCardImage: {
    width: '100%',
    height: '100%',
  },
  fanCardFarLeft: {
    transform: [{ rotate: '-18deg' }, { translateX: -70 }, { translateY: 10 }],
    opacity: 0.6,
    zIndex: 1,
  },
  fanCardLeft: {
    transform: [{ rotate: '-9deg' }, { translateX: -35 }, { translateY: 5 }],
    opacity: 0.8,
    zIndex: 2,
  },
  fanCardCenterBg: {
    zIndex: 3,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  fanCardRight: {
    transform: [{ rotate: '9deg' }, { translateX: 35 }, { translateY: 5 }],
    opacity: 0.8,
    zIndex: 2,
  },
  fanCardFarRight: {
    transform: [{ rotate: '18deg' }, { translateX: 70 }, { translateY: 10 }],
    opacity: 0.6,
    zIndex: 1,
  },
  fanCardOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    zIndex: 10,
  },
  generateButtonContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.page,
  },
  fanCardBlur: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fanCardCTA: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  tryItNowButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.accent.primary,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  tryItNowText: {
    // Using LabelMedium variant - SF Pro Text Medium
    color: Colors.text.inverse,
    fontWeight: '600' as const,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    // Using HeadlineMedium variant - SF Pro Text Semibold
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 200,
    // Using BodySmall variant - SF Pro Text Regular
  },
  emptySubtitleAction: {
    textAlign: 'center',
    maxWidth: 200,
    // Using BodySmall variant - SF Pro Text Semibold
    fontWeight: '600' as const,
    marginTop: 4,
  },
  emptyButton: {
    marginTop: 4,
  },
  paginationEmpty: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
  },
  // Items Section
  itemsScrollContent: {
    paddingHorizontal: Spacing.page,
    gap: 12,
  },
  itemCard: {
    width: ITEM_CARD_WIDTH,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.stroke,
  },
  itemImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.dark.surfaceElevated,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    padding: 12,
    gap: 4,
  },
  itemTitle: {
    fontSize: 13,
    lineHeight: 17,
  },
  itemBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.primary,
  },
  // Empty Items
  emptyItemsCard: {
    marginHorizontal: Spacing.page,
    height: 100,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.stroke,
    borderStyle: 'dashed',
  },
  emptyItemsContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  // Quick Start
  quickStartCard: {
    marginHorizontal: Spacing.page,
    padding: 0,
  },
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartText: {
    flex: 1,
    gap: 2,
  },
});

export default HomeScreen;
