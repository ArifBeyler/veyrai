import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRandomModelPhoto } from '../../src/constants/modelPhotos';
import { useTryOnFlow } from '../../src/hooks/useTryOn';
import { supabase } from '../../src/services/supabase';
import { useSessionStore } from '../../src/state/useSessionStore';
import { useTranslation } from '../../src/hooks/useTranslation';
import { GlassCard } from '../../src/ui/GlassCard';
import { IconButton } from '../../src/ui/IconButton';
import { PrimaryButton } from '../../src/ui/PrimaryButton';
import { BorderRadius, Colors, Spacing } from '../../src/ui/theme';
import {
  BodyMedium,
  BodySmall,
  HeadlineMedium,
  LabelMedium,
  LabelSmall,
} from '../../src/ui/Typography';

const { width } = Dimensions.get('window');

type GenerationState = 'loading' | 'success' | 'error';

const GenerationScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  // Mizahi mesaj havuzu - dinamik çeviri
  const getLoadingMessages = () => [
    { text: t('generation.loadingMessages.loadingPhotos'), emoji: '📸' },
    { text: t('generation.loadingMessages.preparingWardrobe'), emoji: '👔' },
    { text: t('generation.loadingMessages.applyingGarment'), emoji: '✨' },
    { text: t('generation.loadingMessages.finalTouches'), emoji: '🎨' },
    { text: t('generation.loadingMessages.simulatingFabric'), emoji: '🧵' },
    { text: t('generation.loadingMessages.convincingButtons'), emoji: '🔘' },
    { text: t('generation.loadingMessages.aligningUniverse'), emoji: '🌟' },
    { text: t('generation.loadingMessages.cinematicMode'), emoji: '🎬' },
    { text: t('generation.loadingMessages.stylistCalled'), emoji: '👨‍🎨' },
    { text: t('generation.loadingMessages.fashionMath'), emoji: '📐' },
    { text: t('generation.loadingMessages.colorCheck'), emoji: '🎨' },
    { text: t('generation.loadingMessages.almostReady'), emoji: '⏳' },
  ];
  const params = useLocalSearchParams<{
    id: string;
    imageUrl?: string;
    humanImageUri?: string;
    garmentImageUris?: string; // Multiple URIs separated by |||
    garmentCategories?: string; // Categories separated by ,
    gender?: string;
    styleNote?: string;
    wantFullOutfit?: string;
    templateId?: string;
  }>();

  // States
  const [state, setState] = useState<GenerationState>('loading');
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(params.imageUrl ? decodeURIComponent(params.imageUrl) : null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Get original profile photo
  const originalPhotoUri = params.humanImageUri ? decodeURIComponent(params.humanImageUri) : null;
  
  // Debug log
  console.log('Generation params:', { 
    humanImageUri: params.humanImageUri ? 'exists' : 'missing',
    originalPhotoUri: originalPhotoUri ? 'decoded' : 'null'
  });
  
  const hasStartedRef = useRef(false);
  const { startTryOn } = useTryOnFlow();
  const isPremium = useSessionStore((s) => s.isPremium);
  const credits = useSessionStore((s) => s.credits);
  const setFreeCreditsUsed = useSessionStore((s) => s.setFreeCreditsUsed);
  const useCredit = useSessionStore((s) => s.useCredit);
  const addJob = useSessionStore((s) => s.addJob);
  const removeJob = useSessionStore((s) => s.removeJob);

  // Animation values
  const shimmerPosition = useSharedValue(-width);
  const successShimmerPosition = useSharedValue(-width);
  const pulseScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const imageOpacity = useSharedValue(0);

  // Shuffle messages
  const [messages] = useState(() => getLoadingMessages().sort(() => Math.random() - 0.5));

  // If imageUrl is already provided, show result immediately
  useEffect(() => {
    if (params.imageUrl) {
      setState('success');
      setResultImageUrl(decodeURIComponent(params.imageUrl));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [params.imageUrl]);

  // Start generation when component mounts (if we have image URIs)
  useEffect(() => {
    const startGeneration = async () => {
      if (hasStartedRef.current) return;
      if (params.imageUrl) return; // Already have result
      if (!params.humanImageUri || !params.garmentImageUris) return;

      hasStartedRef.current = true;

      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setErrorMessage('Giriş yapmanız gerekiyor');
          setState('error');
          return;
        }

        const humanImageUri = decodeURIComponent(params.humanImageUri);
        
        // Parse multiple garment URIs (separated by |||)
        const garmentImageUris = params.garmentImageUris
          .split('|||')
          .map(uri => decodeURIComponent(uri));
        
        // Parse garment categories
        const garmentCategories = params.garmentCategories
          ? params.garmentCategories.split(',')
          : [];
        
        const styleNote = params.styleNote || '';
        const gender = params.gender || 'male';

        // Get model photo
        const modelPhoto = getRandomModelPhoto(gender as 'male' | 'female');
        console.log('Using model:', modelPhoto.name);
        console.log('Garment count:', garmentImageUris.length);
        console.log('Categories:', garmentCategories);

        // Start try-on with all garments
        const { jobId, result } = await startTryOn(
          humanImageUri,
          garmentImageUris,
          user.id,
          modelPhoto.imageUrl,
          garmentCategories,
          styleNote
        );

        if (result?.imageUrl) {
          // Success!
          setResultImageUrl(result.imageUrl);
          setState('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Update store - Kredi düşür
          if (!isPremium) {
            if (credits > 0) {
              // Kredi varsa düşür
              useCredit();
              console.log('Kredi kullanıldı, kalan:', credits - 1);
              
              // Supabase'de de kredi düşür
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user?.id) {
                await supabase.rpc('use_credit', { p_user_id: session.user.id });
              }
            } else {
              // İlk ücretsiz kullanım
              setFreeCreditsUsed(true);
            }
          }
          
          addJob({
            id: jobId,
            userPhotoId: '',
            garmentId: '',
            humanImageUri: humanImageUri, // Önce/sonra için orijinal fotoğraf
            status: 'completed',
            resultImageUrl: result.imageUrl,
            createdAt: new Date(),
            completedAt: new Date(),
            params: { 
              backgroundMode: 'original', 
              quality: 'normal',
              garmentCount: garmentImageUris.length,
              categories: garmentCategories,
            },
          });
        } else {
          throw new Error('Sonuç alınamadı');
        }
      } catch (error: any) {
        console.error('Generation error:', error);
        setErrorMessage(error.message || 'Bir hata oluştu');
        setState('error');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    startGeneration();
  }, [params.humanImageUri, params.garmentImageUris, params.imageUrl]);

  // Rotate through loading messages
  useEffect(() => {
    if (state !== 'loading') return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [state, messages.length]);

  // Progress animation - Rastgele ilerleme
  useEffect(() => {
    if (state === 'success') {
      setProgress(100);
      progressWidth.value = withTiming(100, { duration: 300 });
      return;
    }
    
    if (state !== 'loading') return;

    // Rastgele başlangıç değeri (15-35 arası)
    const initialProgress = Math.random() * 20 + 15;
    setProgress(initialProgress);
    progressWidth.value = withTiming(initialProgress, { duration: 300 });

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // 95'e kadar çık, sonra beklesin
        
        // Her seferinde farklı artış miktarı (rastgele)
        const increment = Math.random() * 12 + 3; // 3-15 arası
        const newProgress = Math.min(prev + increment, 95);
        
        // Rastgele animasyon süresi (400-800ms)
        const duration = Math.random() * 400 + 400;
        progressWidth.value = withTiming(newProgress, { duration });
        
        return newProgress;
      });
    }, Math.random() * 1000 + 800); // 800-1800ms arası rastgele interval
    
    return () => clearInterval(progressInterval);
  }, [state]);

  // Animations
  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(width * 2, { duration: 2000 }),
      -1,
      false
    );

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    iconRotation.value = withRepeat(
      withTiming(360, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  // Success shimmer animation and image fade-in
  useEffect(() => {
    if (state === 'success') {
      // Image fade-in
      imageOpacity.value = withTiming(1, { duration: 600 });
      
      // Success shimmer animation
      successShimmerPosition.value = withRepeat(
        withTiming(width * 2, { duration: 2500 }),
        -1,
        false
      );
    } else {
      imageOpacity.value = 0;
    }
  }, [state]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));

  const successShimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: successShimmerPosition.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const imageFadeStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const handleClose = () => {
    router.replace('/(tabs)/home');
  };

  const handleShare = async () => {
    if (!resultImageUrl) return;
    try {
      await Share.share({
        message: t('generation.shareMessage'),
        url: resultImageUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSave = async () => {
    if (!resultImageUrl) return;

    try {
      const fileUri = FileSystem.documentDirectory + `tryon_${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(resultImageUrl, fileUri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: t('generation.saveImage'),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(t('common.error'), t('generation.shareNotAvailable'));
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(t('common.error'), t('generation.saveError'));
    }
  };

  const handleDone = () => {
    router.replace('/(tabs)/gallery');
  };

  const handleRetry = () => {
    router.replace('/create');
  };

  const handleDelete = () => {
    Alert.alert(
      t('generation.deleteImage'),
      t('generation.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            if (params.id) {
              removeJob(params.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/(tabs)/home');
            }
          },
        },
      ]
    );
  };

  const currentMessage = messages[currentMessageIndex];

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
          accessibilityLabel={t('generation.home')}
          variant="glass"
          size="sm"
        />
        {state === 'success' && resultImageUrl && (
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <LabelMedium color="error">{t('common.delete')}</LabelMedium>
          </Pressable>
        )}
        {state !== 'success' && <View style={{ width: 36 }} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {state === 'error' ? (
          /* ❌ ERROR STATE */
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <LabelMedium style={styles.errorEmoji}>😔</LabelMedium>
            </View>
            <HeadlineMedium style={styles.errorTitle}>{t('generation.error')}</HeadlineMedium>
            <BodyMedium color="secondary" style={styles.errorText}>
              {errorMessage || t('generation.pleaseRetry')}
            </BodyMedium>
            <PrimaryButton
              title={t('common.retry')}
              onPress={handleRetry}
              style={styles.retryButton}
            />
          </Animated.View>
        ) : state === 'success' && resultImageUrl ? (
          /* ✅ SUCCESS STATE - Redesigned */
          <Animated.View entering={ZoomIn.springify()} style={styles.resultContainer}>
            {/* Image Card */}
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.resultCardWrapper}>
              <View style={styles.resultImageContainer}>
                <Image
                  source={{ uri: showOriginal && originalPhotoUri ? originalPhotoUri : resultImageUrl }}
                  style={styles.resultImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                
                {/* Before/After Toggle - Inside Image */}
                {originalPhotoUri && (
                  <Pressable 
                    style={styles.beforeAfterToggle}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowOriginal(!showOriginal);
                    }}
                  >
                    <LinearGradient
                      colors={showOriginal ? ['#7C3AED', '#9333EA'] : [Colors.accent.primary, '#22c55e']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.beforeAfterGradient}
                    >
                      <LabelMedium style={styles.beforeAfterText}>
                        {showOriginal ? `👤 ${t('generation.before')}` : `👔 ${t('generation.after')}`}
                      </LabelMedium>
                    </LinearGradient>
                  </Pressable>
                )}
                
                {/* Shimmer effect */}
                {!showOriginal && (
                  <Animated.View style={[styles.successShimmer, successShimmerStyle]}>
                    <LinearGradient
                      colors={['transparent', 'rgba(181, 255, 31, 0.3)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                )}
              </View>
            </Animated.View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              {/* Success Message */}
              <Animated.View entering={FadeIn.delay(400)} style={styles.successMessage}>
                <LabelMedium color="accent" style={styles.successText}>
                  ✨ {t('generation.success')}
                </LabelMedium>
              </Animated.View>

              {/* Action Buttons - Full Width */}
              <Animated.View entering={FadeIn.delay(500)} style={styles.actionButtons}>
                <Pressable style={styles.actionButton} onPress={handleSave}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.actionButtonGradient}
                  >
                    <Image
                      source={require('../../full3dicons/images/photo.png')}
                      style={styles.actionIcon}
                      resizeMode="contain"
                    />
                    <LabelMedium style={styles.actionButtonText}>{t('common.save')}</LabelMedium>
                  </LinearGradient>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={handleShare}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.actionButtonGradient}
                  >
                    <Image
                      source={require('../../full3dicons/images/sparkle.png')}
                      style={styles.actionIcon}
                      resizeMode="contain"
                    />
                    <LabelMedium style={styles.actionButtonText}>{t('generation.share')}</LabelMedium>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        ) : (
          /* ⏳ LOADING STATE */
          <Animated.View entering={FadeIn} style={styles.processingContainer}>
            <Animated.View style={[styles.previewWrapper, pulseStyle]}>
              <GlassCard style={styles.previewCard}>
                <View style={styles.skeletonImage}>
                  <Animated.View style={[styles.shimmer, shimmerStyle]}>
                    <LinearGradient
                      colors={['transparent', 'rgba(181, 255, 31, 0.1)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.shimmerGradient}
                    />
                  </Animated.View>

                  <Animated.Image
                    source={require('../../full3dicons/images/ai-sparkle.png')}
                    style={[styles.processingIcon, iconStyle]}
                    resizeMode="contain"
                  />
                </View>
              </GlassCard>
            </Animated.View>

            <View style={styles.messageContainer}>
              <LabelMedium style={styles.messageEmoji}>{currentMessage.emoji}</LabelMedium>
              <BodyMedium style={styles.messageText}>{currentMessage.text}</BodyMedium>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressStyle]}>
                  <LinearGradient
                    colors={[Colors.accent.primary, Colors.accent.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <LabelSmall color="tertiary" style={styles.progressText}>
                {Math.round(progress)}%
              </LabelSmall>
            </View>

            <View style={styles.stepsContainer}>
              <ProgressStep 
                label={t('generation.loading')} 
                completed={progress > 20} 
                active={progress <= 20} 
              />
              <View style={styles.stepConnector} />
              <ProgressStep 
                label={t('generation.processing')} 
                completed={progress > 60} 
                active={progress > 20 && progress <= 60} 
              />
              <View style={styles.stepConnector} />
              <ProgressStep 
                label={t('generation.completing')} 
                completed={progress > 90} 
                active={progress > 60 && progress <= 90} 
              />
            </View>

            <GlassCard style={styles.tipCard}>
              <BodySmall color="secondary" style={styles.tipText}>
                {t('generation.tip')}
              </BodySmall>
            </GlassCard>
          </Animated.View>
        )}
      </View>

      {/* Bottom Action */}
      {state === 'success' && (
        <Animated.View 
          entering={FadeIn.delay(600)}
          style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}
        >
          <PrimaryButton
            title={t('common.done')}
            onPress={handleDone}
            style={styles.bigButton}
          />
        </Animated.View>
      )}
    </View>
  );
};

// Progress Step Component
type ProgressStepProps = {
  label: string;
  completed: boolean;
  active: boolean;
};

const ProgressStep: React.FC<ProgressStepProps> = ({ label, completed, active }) => (
  <View style={styles.progressStep}>
    <View
      style={[
        styles.stepDot,
        completed && styles.stepDotCompleted,
        active && styles.stepDotActive,
      ]}
    >
      {completed && <LabelSmall style={styles.stepCheck}>✓</LabelSmall>}
    </View>
    <LabelSmall 
      color={completed ? 'accent' : active ? 'primary' : 'tertiary'}
      style={styles.stepLabel}
    >
      {label}
    </LabelSmall>
  </View>
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
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.page,
    justifyContent: 'center',
  },

  // Error State
  errorContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 40,
    lineHeight: 50,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    minWidth: 150,
  },

  // Loading State
  processingContainer: {
    alignItems: 'center',
    gap: 28,
  },
  previewWrapper: {
    alignItems: 'center',
  },
  previewCard: {
    padding: 10,
  },
  skeletonImage: {
    width: width * 0.6,
    aspectRatio: 0.75,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerGradient: {
    flex: 1,
    width: 150,
  },
  processingIcon: {
    width: 50,
    height: 50,
    opacity: 0.7,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  messageEmoji: {
    fontSize: 28,
    lineHeight: 36,
    width: 36,
    textAlign: 'center',
  },
  messageText: {
    textAlign: 'center',
    flex: 1,
  },
  progressContainer: {
    width: '85%',
    gap: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.dark.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressText: {
    textAlign: 'right',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressStep: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.accent.primaryDim,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.accent.primary,
  },
  stepCheck: {
    color: Colors.dark.background,
    fontSize: 12,
    // Using Typography component weight
  },
  stepLabel: {
    fontSize: 11,
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: Colors.dark.surface,
    marginBottom: 22,
  },
  tipCard: {
    padding: 14,
    marginTop: 8,
  },
  tipText: {
    textAlign: 'center',
  },

  // Success State
  resultContainer: {
    flex: 1,
    paddingHorizontal: Spacing.page,
  },
  resultCardWrapper: {
    width: '100%',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  resultCard: {
    padding: 8,
    position: 'relative',
  },
  resultGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BorderRadius.md + 4,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  resultImageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.dark.surface,
  },
  beforeAfterToggle: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    zIndex: 10,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  beforeAfterGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  beforeAfterText: {
    color: '#FFFFFF',
    fontSize: 14,
    // Using Typography component weight
  },
  bottomSection: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
  },
  resultImageWrapper: {
    width: '100%',
    height: '100%',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  successShimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  successMessage: {
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    textAlign: 'center',
    // Using Typography component weight
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  actionButtonText: {
    color: '#FFFFFF',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 24,
    height: 24,
  },

  // Bottom Actions
  bottomActions: {
    paddingHorizontal: Spacing.page,
    paddingTop: 0,
  },
  bigButton: {
    paddingVertical: 14,
  },
});

export default GenerationScreen;
