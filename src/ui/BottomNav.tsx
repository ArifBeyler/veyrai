import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
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
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from './theme';
import { AppIcon } from '../utils/iconHelper';
import { useSessionStore } from '../state/useSessionStore';

// Design tokens
const TOKENS = {
  dock: {
    borderRadius: 28,
    blur: 40,
    paddingHorizontal: 18,
    paddingVertical: 12,
    bottomOffset: 12,
    shadow: {
      color: '#000000',
      offset: { width: 0, height: 10 },
      opacity: 0.26,
      radius: 20,
    },
    border: {
      width: 1,
      color: 'rgba(255, 255, 255, 0.08)',
    },
    background: 'rgba(20, 20, 22, 0.85)',
  },
  icon: {
    size: 28,
    containerSize: 50,
    activeColor: Colors.accent.primary,
    inactiveOpacity: 0.55,
  },
  glowDot: {
    size: 6,
    blur: 8,
    color: Colors.accent.primary,
  },
  createButton: {
    size: 60,
    iconSize: 28,
    elevation: 14,
    gradientColors: ['#C4FF70', '#8FD93A', '#6BC41B'] as const,
  },
  animation: {
    press: { damping: 15, stiffness: 400 },
    color: { duration: 180 },
    dot: { duration: 200 },
  },
};

type NavItem = {
  key: string;
  icon: ImageSourcePropType;
  iconName?: string;
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
const AnimatedView = Animated.View;

// NavButton with glow dot
const NavButton: React.FC<{
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => {
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(isActive ? 1 : 0);
  const dotScale = useSharedValue(isActive ? 1 : 0.5);
  const iconOpacity = useSharedValue(isActive ? 1 : TOKENS.icon.inactiveOpacity);
  const use3DIcons = useSessionStore((s) => s.use3DIcons);

  // Update animations when active state changes
  useEffect(() => {
    dotOpacity.value = withTiming(isActive ? 1 : 0, { duration: TOKENS.animation.dot.duration });
    dotScale.value = withSpring(isActive ? 1 : 0.5, TOKENS.animation.press);
    iconOpacity.value = withTiming(
      isActive ? 1 : TOKENS.icon.inactiveOpacity, 
      { duration: TOKENS.animation.color.duration }
    );
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, TOKENS.animation.press);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, TOKENS.animation.press);
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
      <AnimatedView style={[styles.iconWrapper, iconAnimatedStyle]}>
        {item.iconName && !use3DIcons ? (
          <AppIcon
            name={item.iconName}
            size={TOKENS.icon.size}
            color={TOKENS.icon.activeColor}
          />
        ) : (
          <Image
            source={item.icon}
            style={[styles.navIcon, { tintColor: TOKENS.icon.activeColor }]}
            resizeMode="contain"
          />
        )}
      </AnimatedView>
      
      {/* Glow Dot */}
      <AnimatedView style={[styles.glowDot, dotAnimatedStyle]}>
        <View style={styles.glowDotInner} />
        <View style={styles.glowDotGlow} />
      </AnimatedView>
    </AnimatedPressable>
  );
};

// Hero Create Button
const CreateButton: React.FC<{
  onPress: () => void;
  createIcon: ImageSourcePropType;
}> = ({ onPress, createIcon }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const use3DIcons = useSessionStore((s) => s.use3DIcons);

  // Subtle breathing glow animation
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, TOKENS.animation.press);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, TOKENS.animation.press);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.createButton, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel="Create new"
    >
      {/* Outer glow */}
      <AnimatedView style={[styles.createButtonGlow, glowStyle]} />
      
      {/* Button with gradient */}
      <View style={styles.createButtonInner}>
        <LinearGradient
          colors={TOKENS.createButton.gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        {!use3DIcons ? (
          <AppIcon
            name="plus-sign"
            size={TOKENS.createButton.iconSize}
            color="#000000"
          />
        ) : (
          <Image
            source={createIcon}
            style={styles.createIcon}
            resizeMode="contain"
          />
        )}
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

  return (
    <View style={[
      styles.container, 
      { paddingBottom: Math.max(insets.bottom, 8) + TOKENS.dock.bottomOffset }
    ]}>
      <View style={styles.navWrapper}>
        {/* Floating Glass Dock */}
        <View style={styles.dockContainer}>
          {/* Shadow layer */}
          <View style={styles.dockShadow} />
          
          {/* Glass background */}
          <BlurView
            intensity={TOKENS.dock.blur}
            tint="dark"
            style={styles.dockBlur}
          />
          
          {/* Dark overlay for better contrast */}
          <View style={styles.dockBackground} />
          
          {/* Top highlight border */}
          <View style={styles.dockHighlight} />
          
          {/* Navigation items */}
          <View style={styles.dockContent}>
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

        {/* Hero Create Button */}
        <CreateButton onPress={onCreatePress} createIcon={createIcon} />
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
    paddingHorizontal: 16,
  },
  navWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  // Dock styles
  dockContainer: {
    borderRadius: TOKENS.dock.borderRadius,
    overflow: 'hidden',
    position: 'relative',
  },
  dockShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TOKENS.dock.borderRadius,
    shadowColor: TOKENS.dock.shadow.color,
    shadowOffset: TOKENS.dock.shadow.offset,
    shadowOpacity: TOKENS.dock.shadow.opacity,
    shadowRadius: TOKENS.dock.shadow.radius,
    elevation: 12,
    backgroundColor: 'transparent',
  },
  dockBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  dockBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TOKENS.dock.background,
  },
  dockHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  dockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TOKENS.dock.paddingHorizontal,
    paddingVertical: TOKENS.dock.paddingVertical,
    gap: 4,
  },
  // Nav button styles
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: TOKENS.icon.containerSize,
    height: TOKENS.icon.containerSize + 8,
    position: 'relative',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: TOKENS.icon.size,
    height: TOKENS.icon.size,
  },
  // Glow dot
  glowDot: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDotInner: {
    width: TOKENS.glowDot.size,
    height: TOKENS.glowDot.size,
    borderRadius: TOKENS.glowDot.size / 2,
    backgroundColor: TOKENS.glowDot.color,
  },
  glowDotGlow: {
    position: 'absolute',
    width: TOKENS.glowDot.size + TOKENS.glowDot.blur,
    height: TOKENS.glowDot.size + TOKENS.glowDot.blur,
    borderRadius: (TOKENS.glowDot.size + TOKENS.glowDot.blur) / 2,
    backgroundColor: TOKENS.glowDot.color,
    opacity: 0.4,
  },
  // Create button styles
  createButton: {
    position: 'relative',
    marginTop: -8, // Float slightly higher
  },
  createButtonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: (TOKENS.createButton.size + 12) / 2,
    backgroundColor: Colors.accent.primary,
    opacity: 0.3,
  },
  createButtonInner: {
    width: TOKENS.createButton.size,
    height: TOKENS.createButton.size,
    borderRadius: TOKENS.createButton.size / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Shadow
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: TOKENS.createButton.elevation,
  },
  createIcon: {
    width: TOKENS.createButton.iconSize,
    height: TOKENS.createButton.iconSize,
    tintColor: '#000000',
  },
});

export default BottomNav;
