import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animation, BorderRadius, Colors, Shadows, Spacing } from './theme';
import { Image as ExpoImage } from 'expo-image';

type NavItem = {
  key: string;
  icon: ImageSourcePropType;
  accessibilityLabel: string;
};

type BottomNavProps = {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  onCreatePress: () => void;
  createIcon: ImageSourcePropType;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, Animation.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.navButton, animatedStyle]}
      accessibilityRole="tab"
      accessibilityLabel={item.accessibilityLabel}
      accessibilityState={{ selected: isActive }}
    >
      <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
        <Image
          source={item.icon}
          style={[
            styles.navIcon,
            !isActive && styles.inactiveIcon,
          ]}
          resizeMode="contain"
        />
      </View>
    </AnimatedPressable>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeKey,
  onSelect,
  onCreatePress,
  createIcon,
}) => {
  const insets = useSafeAreaInsets();
  const createScale = useSharedValue(1);

  const createAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createScale.value }],
  }));

  const handleCreatePressIn = () => {
    createScale.value = withSpring(0.9, Animation.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCreatePressOut = () => {
    createScale.value = withSpring(1, Animation.spring);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) + -10 }]}>
      <View style={styles.navWrapper}>
        {/* Glass3D Container */}
        <View style={styles.glass3dContainer}>
          {/* Outer shadows layer - multiple shadow simulation */}
          <View style={styles.glass3dShadowOuter} />
          <View style={styles.glass3dShadowOuter2} />
          
          {/* Main blur and background layer */}
          <BlurView
            intensity={80}
            tint="dark"
            style={styles.glass3dBlur}
          >
            {/* Background color overlay */}
            <View style={styles.glass3dBackground} />
            
            {/* Noise texture overlay - with fallback */}
            <View style={styles.glass3dNoiseContainer}>
              <ExpoImage
                source={{ uri: 'https://www.transparenttextures.com/patterns/egg-shell.png' }}
                style={styles.glass3dNoise}
                contentFit="repeat"
                cachePolicy="memory-disk"
                onError={() => {
                  // Fallback handled by container background
                }}
              />
            </View>
          </BlurView>
          
          {/* Inner highlight overlay (top-left) */}
          <View style={styles.glass3dInnerHighlight} />
          
          {/* Inner shadow overlay (bottom-right) */}
          <View style={styles.glass3dInnerShadow} />
          
          {/* Content */}
          <View style={styles.glass3dContent}>
            {items.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                onPress={() => onSelect(item.key)}
              />
            ))}
          </View>
        </View>

        <AnimatedPressable
          onPressIn={handleCreatePressIn}
          onPressOut={handleCreatePressOut}
          onPress={onCreatePress}
          style={[styles.createButton, createAnimatedStyle]}
          accessibilityRole="button"
          accessibilityLabel="Yeni oluştur"
        >
          <View style={styles.createButtonInner}>
            <Image
              source={createIcon}
              style={styles.createIcon}
              resizeMode="contain"
            />
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  navWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Glass3D Styles
  glass3dContainer: {
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  glass3dShadowOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.pill,
    shadowColor: 'hsl(205, 20%, 10%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 0.75,
    elevation: 2,
  },
  glass3dShadowOuter2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.pill,
    shadowColor: 'hsl(205, 20%, 10%)',
    shadowOffset: { width: 0.7, height: 0.8 },
    shadowOpacity: 0.1,
    shadowRadius: 1.2,
    elevation: 3,
  },
  glass3dBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.pill,
  },
  glass3dBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'hsla(189, 80%, 10%, 0.2)', // hsl(189 80% 10% / 0.2)
    borderRadius: BorderRadius.pill,
  },
  glass3dNoiseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
  },
  glass3dNoise: {
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  glass3dInnerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.pill,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'hsla(205, 20%, 90%, 0.8)',
    opacity: 0.6,
  },
  glass3dInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.pill,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0.25,
    borderBottomWidth: 0.25,
    borderColor: 'hsla(205, 20%, 10%, 0.3)',
    opacity: 0.4,
  },
  glass3dContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm + 2,
    position: 'relative',
    zIndex: 6,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'relative',
  },
  iconContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  activeIconContainer: {
    backgroundColor: Colors.accent.primaryDim,
  },
  navIcon: {
    width: 40,
    height: 40,
  },
  inactiveIcon: {
    opacity: 0.5,
  },
  createButton: {
    ...Shadows.glow(Colors.accent.primary),
  },
  createButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIcon: {
    width: 34,
    height: 34,
  },
});

export default BottomNav;
