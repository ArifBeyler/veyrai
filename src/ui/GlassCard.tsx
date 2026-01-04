import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Shadows, Spacing, Animation } from './theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  haptic?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  onPress,
  disabled = false,
  variant = 'default',
  haptic = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.97, Animation.spring);
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring);
  };

  const handlePress = () => {
    if (onPress && !disabled) {
      onPress();
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...Shadows.md,
          backgroundColor: Colors.dark.surfaceElevated,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: Colors.dark.stroke,
          backgroundColor: 'transparent',
        };
      default:
        return {
          ...Shadows.sm,
          backgroundColor: Colors.dark.surface,
        };
    }
  };

  const content = (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[styles.blur, styles.container, getVariantStyles(), style]}
    >
      {children}
    </BlurView>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[animatedStyle, disabled && styles.disabled]}
        accessibilityRole="button"
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
    overflow: 'hidden',
  },
  blur: {
    padding: Spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GlassCard;

