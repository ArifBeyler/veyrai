import React from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';
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

export const AppText: React.FC<CustomTextProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  style,
  children,
  ...props
}) => {
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

