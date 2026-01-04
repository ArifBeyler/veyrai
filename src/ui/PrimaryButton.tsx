import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Typography, Spacing, Animation, Shadows } from './theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'lg',
  style,
  accessibilityLabel,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, Animation.spring);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
          text: Typography.labelMedium,
        };
      case 'md':
        return {
          container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
          text: Typography.labelLarge,
        };
      case 'lg':
      default:
        return {
          container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },
          text: Typography.headlineSmall,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.text.inverse : Colors.accent.primary}
          size="small"
        />
      );
    }
    return (
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          variant === 'primary' && styles.textPrimary,
          variant === 'secondary' && styles.textSecondary,
          variant === 'ghost' && styles.textGhost,
        ]}
      >
        {title}
      </Text>
    );
  };

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[animatedStyle, (disabled || loading) && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
      >
        <LinearGradient
          colors={[Colors.accent.primary, '#9AE65A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.container, sizeStyles.container, styles.primaryContainer, style]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        styles.container,
        sizeStyles.container,
        variant === 'secondary' && styles.secondaryContainer,
        variant === 'ghost' && styles.ghostContainer,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryContainer: {
    ...Shadows.glow(Colors.accent.primary),
  },
  secondaryContainer: {
    backgroundColor: Colors.accent.primaryDim,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  text: {
    textAlign: 'center',
  },
  textPrimary: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  textSecondary: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  textGhost: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PrimaryButton;

