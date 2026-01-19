import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius } from '../src/ui/theme';
import {
  HeadlineLarge,
  HeadlineMedium,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
  EditorialText,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { GlassCard } from '../src/ui/GlassCard';
import { useTranslation } from '../src/hooks/useTranslation';
import { IconButton } from '../src/ui/IconButton';

const { width, height } = Dimensions.get('window');

const PhotoGuideScreen = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-play animation for photo comparison
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out current image
      opacity.value = withTiming(0, { duration: 500 });
      scale.value = withTiming(0.95, { duration: 250 });
      
      // After fade out, switch image and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev === 0 ? 1 : 0));
        opacity.value = withTiming(1, { duration: 500 });
        scale.value = withTiming(1, { duration: 250 });
      }, 500);
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(interval);
  }, [opacity, scale]);
  
  // Animated styles
  const imageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Show action sheet for photo source selection
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t('create.photoGuide.cancel'),
            t('create.photoGuide.takePhoto'),
            t('create.photoGuide.chooseFromGallery'),
          ],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto();
          } else if (buttonIndex === 2) {
            await handleChooseFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        t('create.photoGuide.selectPhotoSource'),
        '',
        [
          {
            text: t('create.photoGuide.cancel'),
            style: 'cancel',
          },
          {
            text: t('create.photoGuide.takePhoto'),
            onPress: handleTakePhoto,
          },
          {
            text: t('create.photoGuide.chooseFromGallery'),
            onPress: handleChooseFromGallery,
          },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error'),
          t('create.photoGuide.cameraPermissionDenied')
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigate back with photo URI
        router.back();
        // Use setTimeout to ensure navigation completes before setting params
        setTimeout(() => {
          router.setParams({ selectedPhotoUri: result.assets[0].uri });
        }, 100);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(t('common.error'), t('create.photoGuide.cameraError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error'),
          t('create.photoGuide.galleryPermissionDenied')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigate back with photo URI
        router.back();
        // Use setTimeout to ensure navigation completes before setting params
        setTimeout(() => {
          router.setParams({ selectedPhotoUri: result.assets[0].uri });
        }, 100);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(t('common.error'), t('create.photoGuide.galleryError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#1a1a2e', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <IconButton
          icon="✕"
          onPress={() => router.back()}
          style={styles.closeButton}
        />
        <HeadlineLarge style={styles.title}>
          {t('create.photoGuide.title')}
        </HeadlineLarge>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Auto-playing Photo Comparison */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <View style={styles.comparisonHeader}>
            <BodyMedium color="primary" style={styles.comparisonTitle}>
              {t('create.photoGuide.photoExamples')}
            </BodyMedium>
          </View>
          
          <View style={styles.imageContainer}>
            {/* Bad Example */}
            {currentIndex === 0 && (
              <Animated.View style={[styles.imageWrapper, imageStyle]}>
                <GlassCard style={styles.imageCard}>
                  <Image
                    source={require('../assets/images/badligh.png')}
                    style={styles.exampleImage}
                    resizeMode="cover"
                  />
                  <View style={[styles.badgeOverlay, styles.badBadgeOverlay]}>
                    <LabelMedium style={styles.badgeOverlayText}>
                      {t('create.photoGuide.badLight')}
                    </LabelMedium>
                  </View>
                </GlassCard>
              </Animated.View>
            )}
            
            {/* Good Example */}
            {currentIndex === 1 && (
              <Animated.View style={[styles.imageWrapper, imageStyle]}>
                <GlassCard style={styles.imageCard}>
                  <Image
                    source={require('../assets/images/combines/female/female-outfit-9.png')}
                    style={styles.exampleImage}
                    resizeMode="cover"
                  />
                  <View style={[styles.badgeOverlay, styles.goodBadgeOverlay]}>
                    <LabelMedium style={styles.badgeOverlayText}>
                      {t('create.photoGuide.goodLight')}
                    </LabelMedium>
                  </View>
                </GlassCard>
              </Animated.View>
            )}
          </View>
          
          {/* Tips - Dynamic based on current image */}
          <View style={styles.tipsContainer}>
            {currentIndex === 1 ? (
              // Good Tips
              <>
                <View style={styles.tipRow}>
                  <LabelSmall style={styles.tipBullet}>✓</LabelSmall>
                  <BodySmall color="primary" style={styles.tipText}>
                    {t('create.photoGuide.goodLighting')} - {t('create.photoGuide.goodLightingDesc')}
                  </BodySmall>
                </View>
                <View style={styles.tipRow}>
                  <LabelSmall style={styles.tipBullet}>✓</LabelSmall>
                  <BodySmall color="primary" style={styles.tipText}>
                    {t('create.photoGuide.fullBody')} - {t('create.photoGuide.fullBodyDesc')}
                  </BodySmall>
                </View>
                <View style={styles.tipRow}>
                  <LabelSmall style={styles.tipBullet}>✓</LabelSmall>
                  <BodySmall color="primary" style={styles.tipText}>
                    {t('create.photoGuide.straightPosture')} - {t('create.photoGuide.straightPostureDesc')}
                  </BodySmall>
                </View>
              </>
            ) : (
              // Bad Tips
              <View style={styles.tipRow}>
                <LabelSmall style={[styles.tipBullet, styles.badBullet]}>✕</LabelSmall>
                <BodySmall color="secondary" style={styles.tipText}>
                  {t('create.photoGuide.avoidTitle')}: {t('create.photoGuide.avoidDesc')}
                </BodySmall>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <Animated.View
        entering={FadeInUp.delay(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
      >
        <PrimaryButton
          title={t('create.photoGuide.continue')}
          onPress={handleContinue}
          loading={isLoading}
          style={styles.continueButton}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: Spacing.page,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.page,
    top: 0,
    zIndex: 10,
  },
  title: {
    textAlign: 'center',
    marginTop: 0,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 40,
  },
  comparisonHeader: {
    paddingHorizontal: Spacing.page,
    marginBottom: 20,
    alignItems: 'center',
  },
  comparisonTitle: {
    textAlign: 'center',
    // BodyMedium already has proper weight
  },
  imageContainer: {
    width: width,
    height: width * 1.3,
    position: 'relative',
    marginBottom: 20,
    paddingHorizontal: Spacing.page,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  goodBadgeOverlay: {
    backgroundColor: '#22c55e',
  },
  badBadgeOverlay: {
    backgroundColor: '#ef4444',
  },
  badgeOverlayText: {
    color: '#fff',
    // LabelMedium already has proper weight
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goodBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    minWidth: 50,
  },
  goodBadgeText: {
    color: '#fff',
    // LabelMedium already has proper weight
  },
  badBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    minWidth: 50,
  },
  badBadgeText: {
    color: '#fff',
    // LabelMedium already has proper weight
  },
  exampleTitle: {
    flex: 1,
    // Using Typography component weight
  },
  imageCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    height: '100%',
  },
  exampleImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.lg,
  },
  tipsContainer: {
    gap: 14,
    paddingTop: 20,
    paddingHorizontal: Spacing.page,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  tipBullet: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#22c55e',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 2,
    // LabelSmall already has proper weight
  },
  badBullet: {
    backgroundColor: '#ef4444',
  },
  tipText: {
    flex: 1,
    lineHeight: 22,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: Spacing.page,
    paddingTop: 20,
  },
  continueButton: {
    width: '100%',
  },
});

export default PhotoGuideScreen;
