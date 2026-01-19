import React from 'react';
import {
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { AppIcon } from '../utils/iconHelper';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Shadows, Animation } from './theme';

type IconButtonProps = {
  icon: string; // Icon name for AppIcon
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'filled' | 'glass' | 'accent';
  disabled?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
  active?: boolean;
  iconColor?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  accessibilityLabel,
  style,
  active = false,
  iconColor,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, Animation.spring);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring);
  };

  const getSizeValue = () => {
    switch (size) {
      case 'sm': return { container: 36, icon: 20 };
      case 'md': return { container: 44, icon: 24 };
      case 'lg': return { container: 52, icon: 28 };
      case 'xl': return { container: 64, icon: 36 };
      default: return { container: 44, icon: 24 };
    }
  };

  const sizeValue = getSizeValue();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: sizeValue.container,
      height: sizeValue.container,
      borderRadius: sizeValue.container / 2,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: Colors.dark.surfaceElevated,
          ...Shadows.sm,
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: Colors.accent.primary,
          ...Shadows.glow(Colors.accent.primary),
        };
      case 'glass':
        return baseStyle;
      default:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
    }
  };

  const iconColorValue = iconColor || (active ? Colors.accent.primary : Colors.text.primary);
  
  const content = (
    <AppIcon
      name={icon}
      size={sizeValue.icon}
      color={iconColorValue}
      weight={active ? 'fill' : 'regular'}
    />
  );

  if (variant === 'glass') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={[animatedStyle, disabled && styles.disabled, style]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
      >
        <BlurView
          intensity={40}
          tint="dark"
          style={[
            styles.glassContainer,
            getContainerStyle(),
            active && styles.activeContainer,
          ]}
        >
          {content}
        </BlurView>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={[
        animatedStyle,
        styles.container,
        getContainerStyle(),
        active && styles.activeContainer,
        disabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {content}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
    overflow: 'hidden',
  },
  activeContainer: {
    backgroundColor: Colors.accent.primaryDim,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default IconButton;

