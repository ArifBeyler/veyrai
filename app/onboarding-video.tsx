import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// import { Video, ResizeMode } from 'expo-av'; // Uncomment when video is added
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing } from '../src/ui/theme';
import {
  HeadlineLarge,
  BodyLarge,
  LabelMedium,
} from '../src/ui/Typography';
import { PrimaryButton } from '../src/ui/PrimaryButton';
import { useSessionStore } from '../src/state/useSessionStore';

const { width, height } = Dimensions.get('window');

const OnboardingVideoScreen = () => {
  const insets = useSafeAreaInsets();
  // const [videoRef, setVideoRef] = useState<Video | null>(null); // Uncomment when video is added
  // const [isPlaying, setIsPlaying] = useState(false); // Uncomment when video is added
  const [videoEnded, setVideoEnded] = useState(true); // Set to false when video is added

  const setHasCompletedOnboarding = useSessionStore((s) => s.setHasCompletedOnboarding);

  // Uncomment when video is added
  // useEffect(() => {
  //   // Auto-play video (muted initially)
  //   if (videoRef) {
  //     videoRef.playAsync().catch((err) => {
  //       console.log('Video play error:', err);
  //       // If video fails, allow user to proceed
  //     });
  //     setIsPlaying(true);
  //   }
  // }, [videoRef]);

  // const handlePlaybackStatusUpdate = (status: any) => {
  //   if (status.isLoaded && status.didJustFinish) {
  //     setVideoEnded(true);
  //     setIsPlaying(false);
  //   }
  // };

  // const handleTogglePlayback = async () => {
  //   if (!videoRef) return;
  //   
  //   if (isPlaying) {
  //     await videoRef.pauseAsync();
  //     setIsPlaying(false);
  //   } else {
  //     await videoRef.playAsync();
  //     setIsPlaying(true);
  //   }
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // };

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHasCompletedOnboarding(true);
    router.replace('/auth');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasCompletedOnboarding(true);
    router.replace('/auth');
  };

  const handleTogglePlayback = async () => {
    if (!videoRef) return;
    
    if (isPlaying) {
      await videoRef.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.playAsync();
      setIsPlaying(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B0C', '#1a1a2e', '#0B0B0C']}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button */}
      <Animated.View
        entering={FadeIn.delay(500)}
        style={[styles.skipButton, { top: insets.top + 16 }]}
      >
        <Pressable onPress={handleSkip}>
          <LabelMedium color="tertiary">Geç</LabelMedium>
        </Pressable>
      </Animated.View>

      {/* Video container */}
      <View style={styles.videoContainer}>
        {/* Placeholder - replace with actual video */}
        <View style={styles.videoPlaceholder}>
          <Image
            source={require('../full3dicons/images/t-shirts.png')}
            style={styles.placeholderIcon}
            resizeMode="contain"
          />
          <HeadlineLarge style={styles.placeholderTitle}>
            Nasıl Çalışır?
          </HeadlineLarge>
          <BodyLarge color="secondary" style={styles.placeholderText}>
            Video buraya eklenecek
          </BodyLarge>
        </View>

        {/* Uncomment when video is added */}
        {/* <Video
          ref={setVideoRef}
          source={{ uri: 'YOUR_VIDEO_URI_HERE' }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={false}
          isMuted={true}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        /> */}

        {/* Play/Pause overlay - will be added when video is implemented */}
        {/* {!videoEnded && (
          <Pressable
            style={styles.playOverlay}
            onPress={handleTogglePlayback}
          >
            <View style={styles.playButton}>
              <Image
                source={require('../full3dicons/images/play-button.png')}
                style={styles.playIcon}
                resizeMode="contain"
              />
            </View>
          </Pressable>
        )} */}
      </View>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInDown.delay(300)}
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 24 }]}
      >
        <PrimaryButton
          title={videoEnded ? 'Başlayalım' : 'Video bitince devam et'}
          onPress={handleStart}
          disabled={!videoEnded}
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
  skipButton: {
    position: 'absolute',
    right: Spacing.page,
    zIndex: 10,
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.page,
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: Spacing.page,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    opacity: 0.5,
  },
  placeholderTitle: {
    textAlign: 'center',
  },
  placeholderText: {
    textAlign: 'center',
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 40,
    height: 40,
    tintColor: Colors.text.inverse,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.page,
    paddingTop: 20,
  },
});

export default OnboardingVideoScreen;

