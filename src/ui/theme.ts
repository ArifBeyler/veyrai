/**
 * FIT-SWAP Design System - Theme Constants
 * iOS premium "liquid glass" aesthetic
 */

export const Colors = {
  // Background
  dark: {
    background: '#0B0B0C',
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceElevated: 'rgba(255, 255, 255, 0.12)',
    stroke: 'rgba(255, 255, 255, 0.12)',
    strokeLight: 'rgba(255, 255, 255, 0.06)',
  },
  light: {
    background: '#F6F6F7',
    surface: 'rgba(0, 0, 0, 0.04)',
    surfaceElevated: 'rgba(0, 0, 0, 0.08)',
    stroke: 'rgba(0, 0, 0, 0.08)',
    strokeLight: 'rgba(0, 0, 0, 0.04)',
  },
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    inverse: '#0B0B0C',
  },
  // Accent - Soft lime green (premium feel)
  accent: {
    primary: '#B4FF6B',
    primaryDim: 'rgba(180, 255, 107, 0.2)',
    secondary: '#7DD3FC',
    secondaryDim: 'rgba(125, 211, 252, 0.2)',
  },
  // Status
  status: {
    success: '#4ADE80',
    error: '#F87171',
    warning: '#FBBF24',
  },
  // Glass
  glass: {
    white: 'rgba(255, 255, 255, 0.15)',
    whiteStrong: 'rgba(255, 255, 255, 0.25)',
    black: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  page: 16,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 22,
  pill: 26,
  full: 9999,
} as const;

export const Typography = {
  // Display - Headlines
  displayLarge: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.25,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: 0,
  },
  // Headlines
  headlineLarge: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: -0.41,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.24,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  // Labels
  labelLarge: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  labelMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.06,
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  }),
} as const;

export const Animation = {
  fast: 150,
  normal: 200,
  slow: 300,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

