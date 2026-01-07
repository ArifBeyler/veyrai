/**
 * Wearify Color Constants
 * Re-exported from design system theme
 */

export { Colors } from '../src/ui/theme';

// Legacy compatibility (for existing components)
const tintColorLight = '#B4FF6B';
const tintColorDark = '#B4FF6B';

export default {
  light: {
    text: '#0B0B0C',
    background: '#F6F6F7',
    tint: tintColorLight,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#0B0B0C',
    tint: tintColorDark,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
