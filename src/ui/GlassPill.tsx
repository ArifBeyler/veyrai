import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows, Spacing } from './theme';

type GlassPillProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
};

export const GlassPill: React.FC<GlassPillProps> = ({
  children,
  style,
  intensity = 60,
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={[styles.container, style]}
    >
      <View style={styles.content}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.dark.strokeLight,
    overflow: 'hidden',
    ...Shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.glass.white,
  },
});

export default GlassPill;

