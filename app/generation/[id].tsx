import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Share,
  StyleSheet,
  View,
} from 'react-native';
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

// Mizahi mesaj havuzu
const LOADING_MESSAGES = [
  { text: 'Fotoğraflar yükleniyor...', emoji: '📸' },
  { text: 'Gardrop hazırlanıyor...', emoji: '👔' },
  { text: 'Kıyafet uygulanıyor...', emoji: '✨' },
  { text: 'Son rötuşlar...', emoji: '🎨' },
  { text: 'Kumaş fiziği simüle ediliyor...', emoji: '🧵' },
  { text: 'Düğmeler ikna ediliyor...', emoji: '🔘' },
  { text: 'Kombin evrenle hizalanıyor...', emoji: '🌟' },
  { text: 'Işık ayarı: sinematik mod', emoji: '🎬' },
  { text: 'Stil danışmanı çağrıldı...', emoji: '👨‍🎨' },
  { text: 'Moda matematiği hesaplanıyor...', emoji: '📐' },
  { text: 'Renk uyumu kontrol ediliyor...', emoji: '🎨' },
  { text: 'Birazdan hazır...', emoji: '⏳' },
];

type GenerationState = 'loading' | 'success' | 'error';

const GenerationScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    imageUrl?: string;
    humanImageUri?: string;
    garmentImageUri?: string;
    gender?: string;
    wantFullOutfit?: string;
    templateId?: string;
  }>();

  // States
  const [state, setState] = useState<GenerationState>('loading');
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(params.imageUrl ? decodeURIComponent(params.imageUrl) : null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const hasStartedRef = useRef(false);
  const { startTryOn } = useTryOnFlow();
  const isPremium = useSessionStore((s) => s.isPremium);
  const setFreeCreditsUsed = useSessionStore((s) => s.setFreeCreditsUsed);
  const addJob = useSessionStore((s) => s.addJob);

  // Animation values
  const shimmerPosition = useSharedValue(-width);
  const pulseScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const iconRotation = useSharedValue(0);

  // Shuffle messages
  const [messages] = useState(() => [...LOADING_MESSAGES].sort(() => Math.random() - 0.5));

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
      if (!params.humanImageUri || !params.garmentImageUri) return;

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
        const garmentImageUri = decodeURIComponent(params.garmentImageUri);
        const gender = params.gender || 'male';

        // Get model photo
        const modelPhoto = getRandomModelPhoto(gender as 'male' | 'female');
        console.log('Using model:', modelPhoto.name);

        // Start try-on
        const { jobId, result } = await startTryOn(
          humanImageUri,
          garmentImageUri,
          user.id,
          modelPhoto.imageUrl
        );

        if (result?.imageUrl) {
          // Success!
          setResultImageUrl(result.imageUrl);
          setState('success');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Update store
          if (!isPremium) {
            setFreeCreditsUsed(true);
          }
          
          addJob({
            id: jobId,
            userPhotoId: '',
            garmentId: '',
            status: 'completed',
            resultImageUrl: result.imageUrl, // Sonuç URL'ini kaydet
            createdAt: new Date(),
            completedAt: new Date(),
            params: { backgroundMode: 'original', quality: 'normal' },
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
  }, [params.humanImageUri, params.garmentImageUri, params.imageUrl]);

  // Rotate through loading messages
  useEffect(() => {
    if (state !== 'loading') return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [state, messages.length]);

  // Progress animation
  useEffect(() => {
    if (state === 'success') {
      setProgress(100);
      progressWidth.value = withTiming(100, { duration: 300 });
      return;
    }
    
    if (state !== 'loading') return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 10 + 5;
        const newProgress = Math.min(prev + increment, 90);
        progressWidth.value = withTiming(newProgress, { duration: 500 });
        return newProgress;
      });
    }, 1500);
    
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

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
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

  const handleClose = () => {
    router.replace('/(tabs)/home');
  };

  const handleShare = async () => {
    if (!resultImageUrl) return;
    try {
      await Share.share({
        message: 'FIT-SWAP ile kıyafet denedim! 👕✨',
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
          dialogTitle: 'Görseli Kaydet',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Hata', 'Paylaşım bu cihazda desteklenmiyor.');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Hata', 'Görsel kaydedilemedi.');
    }
  };

  const handleDone = () => {
    router.replace('/(tabs)/gallery');
  };

  const handleRetry = () => {
    router.replace('/create');
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
          accessibilityLabel="Ana Sayfa"
          variant="glass"
          size="sm"
        />
        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {state === 'error' ? (
          /* ❌ ERROR STATE */
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <LabelMedium style={styles.errorEmoji}>😔</LabelMedium>
            </View>
            <HeadlineMedium style={styles.errorTitle}>Bir Sorun Oluştu</HeadlineMedium>
            <BodyMedium color="secondary" style={styles.errorText}>
              {errorMessage || 'Lütfen tekrar deneyin'}
            </BodyMedium>
            <PrimaryButton
              title="Tekrar Dene"
              onPress={handleRetry}
              style={styles.retryButton}
            />
          </Animated.View>
        ) : state === 'success' && resultImageUrl ? (
          /* ✅ SUCCESS STATE */
          <Animated.View entering={ZoomIn.springify()} style={styles.resultContainer}>
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.resultCardWrapper}>
              <GlassCard style={styles.resultCard}>
                <View style={styles.resultImageContainer}>
                  <Image
                    source={{ uri: resultImageUrl }}
                    style={styles.resultImage}
                    resizeMode="cover"
                  />
                </View>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400)} style={styles.actionButtons}>
              <GlassCard style={styles.actionButton} onPress={handleSave}>
                <View style={styles.actionButtonContent}>
                  <Image
                    source={require('../../full3dicons/images/photo.png')}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                  <LabelMedium>Kaydet</LabelMedium>
                </View>
              </GlassCard>

              <GlassCard style={styles.actionButton} onPress={handleShare}>
                <View style={styles.actionButtonContent}>
                  <Image
                    source={require('../../full3dicons/images/sparkle.png')}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                  <LabelMedium>Paylaş</LabelMedium>
                </View>
              </GlassCard>
            </Animated.View>
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
                label="Yükleniyor" 
                completed={progress > 20} 
                active={progress <= 20} 
              />
              <View style={styles.stepConnector} />
              <ProgressStep 
                label="İşleniyor" 
                completed={progress > 60} 
                active={progress > 20 && progress <= 60} 
              />
              <View style={styles.stepConnector} />
              <ProgressStep 
                label="Tamamlanıyor" 
                completed={progress > 90} 
                active={progress > 60 && progress <= 90} 
              />
            </View>

            <GlassCard style={styles.tipCard}>
              <BodySmall color="secondary" style={styles.tipText}>
                💡 Bu işlem genellikle 15-30 saniye sürer
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
            title="Tamam"
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
    fontWeight: 'bold',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingVertical: 16,
  },
  resultCardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  resultCard: {
    padding: 8,
  },
  resultImageContainer: {
    width: width * 0.88,
    aspectRatio: 0.72,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 145,
    alignItems: 'center',
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
