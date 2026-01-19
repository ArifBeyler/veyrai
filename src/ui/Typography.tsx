import React from 'react';
import { Text, TextStyle, TextProps, Platform } from 'react-native';
import { Colors, Typography as TypographyStyles } from './theme';

type TypographyVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse' | 'error' | 'success';

type CustomTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: TypographyColor;
  style?: TextStyle;
  children: React.ReactNode;
};

// Canela font weights - ONLY regular or medium
type CanelaWeight = 'regular' | 'medium';

type EditorialTextProps = TextProps & {
  weight?: CanelaWeight;
  size?: number;
  lineHeight?: number;
  letterSpacing?: number; // Percentage (-1 to -2 recommended)
  color?: TypographyColor;
  style?: TextStyle;
  children: React.ReactNode;
};

/**
 * EditorialText - Canela font component
 * 
 * STRICT USAGE RULES:
 * - ONLY for hero headlines, onboarding titles, large emotional statements
 * - NEVER for buttons, body text, navigation, filters, forms, or long paragraphs
 * - Maximum 15-20% of visible text per screen
 * - Regular or Medium weight only
 * - Optional slight negative tracking (-1% to -2%)
 */
export const EditorialText: React.FC<EditorialTextProps> = ({
  weight = 'regular',
  size = 28,
  lineHeight,
  letterSpacing = -1.5, // Default -1.5% negative tracking
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const fontFamily = weight === 'medium' ? 'Canela-Medium' : 'Canela-Regular';
  // Editorial feel: 1.3-1.4 line height
  const defaultLineHeight = lineHeight || size * 1.35;
  // Convert percentage to pixels (letterSpacing in %)
  const letterSpacingPx = letterSpacing / 100 * size;
  
  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: size,
          lineHeight: defaultLineHeight,
          letterSpacing: letterSpacingPx,
          color: getColorValue(color),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const getColorValue = (color: TypographyColor): string => {
  switch (color) {
    case 'primary': return Colors.text.primary;
    case 'secondary': return Colors.text.secondary;
    case 'tertiary': return Colors.text.tertiary;
    case 'accent': return Colors.accent.primary;
    case 'inverse': return Colors.text.inverse;
    case 'error': return Colors.status.error;
    case 'success': return Colors.status.success;
    default: return Colors.text.primary;
  }
};

/**
 * AppText - SF Pro Text component (DEFAULT for all functional text)
 * 
 * USAGE:
 * - Body text, descriptions, subtitles
 * - Buttons & CTAs
 * - Navigation (tab bar, headers)
 * - Forms & filters
 * - Cards metadata
 * - Error / empty / helper states
 * - Settings
 * - Any interactive or functional text
 * 
 * Weights: Regular (400), Medium (500), Semibold (600) - sparingly
 * Line heights: 1.3-1.45 (optimized for readability)
 * 
 * iOS: Uses SF Pro Text automatically (system font)
 * Android: Falls back to system default (Roboto)
 */
export const AppText: React.FC<CustomTextProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  // iOS uses SF Pro Text by default (system font)
  // Android falls back to system default
  // No need to specify fontFamily explicitly
  return (
    <Text
      style={[
        TypographyStyles[variant],
        { color: getColorValue(color) },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

// Convenience components
export const DisplayLarge: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="displayLarge" {...props} />
);

export const DisplayMedium: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="displayMedium" {...props} />
);

export const DisplaySmall: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="displaySmall" {...props} />
);

export const HeadlineLarge: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="headlineLarge" {...props} />
);

export const HeadlineMedium: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="headlineMedium" {...props} />
);

export const HeadlineSmall: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="headlineSmall" {...props} />
);

export const BodyLarge: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="bodyLarge" {...props} />
);

export const BodyMedium: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="bodyMedium" {...props} />
);

export const BodySmall: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="bodySmall" {...props} />
);

export const LabelLarge: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="labelLarge" {...props} />
);

export const LabelMedium: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="labelMedium" {...props} />
);

export const LabelSmall: React.FC<Omit<CustomTextProps, 'variant'>> = (props) => (
  <AppText variant="labelSmall" {...props} />
);

export default AppText;

