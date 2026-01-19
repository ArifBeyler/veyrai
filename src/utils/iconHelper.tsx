import React from 'react';
import * as PhosphorIcons from 'phosphor-react-native';

// Phosphor Icons mappings
const PHOSPHOR_ICON_MAP: Record<string, keyof typeof PhosphorIcons> = {
  'home': 'House',
  'wardrobe': 'TShirt',
  'photo': 'Camera',
  'gallery': 'Images',
  'profile': 'User',
  'profile-icon': 'UserCircle',
  'camera': 'Camera',
  'plus-sign': 'Plus',
  't-shirt': 'TShirt',
  't-shirts': 'TShirt',
  'sparkle': 'Sparkle',
  'ai-sparkle': 'Sparkle',
  'checkmark': 'Check',
  'clothes-hanger': 'TShirt',
  'cross': 'X',
  'flannel-shirt': 'TShirt',
  'man': 'GenderMale',
  'woman': 'GenderFemale',
  'star': 'Star',
  'add': 'Plus',
  'chevron-forward': 'CaretRight',
  'close': 'X',
  'images': 'Images',
  'person': 'User',
  'person-circle': 'UserCircle',
};

type IconHelperProps = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

/**
 * Get Phosphor Icon component name for a given icon name
 */
export const getPhosphorIconName = (name: string): keyof typeof PhosphorIcons | null => {
  return PHOSPHOR_ICON_MAP[name] || null;
};

/**
 * Icon component using Phosphor Icons
 */
export const AppIcon: React.FC<IconHelperProps & { 
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}> = ({ 
  name, 
  size = 24, 
  color = '#FFFFFF', 
  style,
  weight = 'regular',
}) => {
  const iconName = PHOSPHOR_ICON_MAP[name];
  if (iconName) {
    const IconComponent = PhosphorIcons[iconName] as React.ComponentType<{
      size?: number;
      color?: string;
      weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
      style?: any;
    }>;
    
    if (IconComponent) {
      return (
        <IconComponent
          size={size}
          color={color}
          weight={weight}
          style={style}
        />
      );
    }
  }
  
  // Fallback: return null if icon not found
  return null;
};
