import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../state/useSessionStore';

// 3D icon mappings
const ICON_3D_MAP: Record<string, ImageSourcePropType> = {
  'home': require('../../full3dicons/images/home.png'),
  'wardrobe': require('../../full3dicons/images/wardrobe.png'),
  'photo': require('../../full3dicons/images/photo.png'),
  'gallery': require('../../full3dicons/images/photo.png'),
  'profile': require('../../full3dicons/images/profile.png'),
  'profile-icon': require('../../full3dicons/images/profile-icon.png'),
  'camera': require('../../full3dicons/images/camera.png'),
  'plus-sign': require('../../full3dicons/images/plus-sign.png'),
  't-shirt': require('../../full3dicons/images/t-shirt.png'),
  't-shirts': require('../../full3dicons/images/t-shirts.png'),
  'sparkle': require('../../full3dicons/images/sparkle.png'),
  'ai-sparkle': require('../../full3dicons/images/ai-sparkle.png'),
  'checkmark': require('../../full3dicons/images/checkmark.png'),
  'clothes-hanger': require('../../full3dicons/images/clothes-hanger.png'),
  'cross': require('../../full3dicons/images/cross.png'),
  'flannel-shirt': require('../../full3dicons/images/flannel-shirt.png'),
  'man': require('../../full3dicons/images/man.png'),
  'woman': require('../../full3dicons/images/woman.png'),
};

// Normal icon mappings (Ionicons)
const ICON_NORMAL_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'home': 'home',
  'wardrobe': 'shirt',
  'photo': 'camera',
  'gallery': 'images',
  'profile': 'person',
  'profile-icon': 'person-circle',
  'camera': 'camera',
  'plus-sign': 'add',
  't-shirt': 'shirt-outline',
  't-shirts': 'shirt',
  'sparkle': 'sparkles',
  'ai-sparkle': 'sparkles',
  'checkmark': 'checkmark',
  'clothes-hanger': 'shirt',
  'cross': 'close',
  'flannel-shirt': 'shirt',
  'man': 'man',
  'woman': 'woman',
};

type IconHelperProps = {
  name: string;
  size?: number;
  color?: string;
  style?: any;
};

/**
 * Returns the appropriate icon based on use3DIcons preference
 * Returns Image component for 3D icons, Ionicons for normal icons
 */
export const useIcon = (name: string): ImageSourcePropType | null => {
  const use3DIcons = useSessionStore((s) => s.use3DIcons);
  
  if (use3DIcons) {
    return ICON_3D_MAP[name] || null;
  }
  
  // For normal icons, we'll return a special marker that the component can handle
  return null;
};

/**
 * Icon component that automatically switches between 3D and normal icons
 */
export const AppIcon: React.FC<IconHelperProps & { 
  asImage?: boolean;
  tintColor?: string;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}> = ({ 
  name, 
  size = 24, 
  color = '#FFFFFF', 
  style,
  asImage = false,
  tintColor,
  resizeMode = 'contain',
}) => {
  const use3DIcons = useSessionStore((s) => s.use3DIcons);
  
  if (use3DIcons || asImage) {
    const iconSource = ICON_3D_MAP[name];
    if (iconSource) {
      return (
        <Image
          source={iconSource}
          style={[
            { width: size, height: size },
            tintColor && { tintColor },
            style,
          ]}
          resizeMode={resizeMode}
        />
      );
    }
  }
  
  // Normal icon (Ionicons)
  const iconName = ICON_NORMAL_MAP[name];
  if (iconName) {
    return (
      <Ionicons
        name={iconName}
        size={size}
        color={color}
        style={style}
      />
    );
  }
  
  // Fallback: return a placeholder or null
  return null;
};

/**
 * Get icon source for direct Image usage (only for 3D icons)
 * Note: This function should only be called when use3DIcons is true
 * For dynamic icon switching, use AppIcon component instead
 */
export const getIconSource = (name: string): ImageSourcePropType | null => {
  // Always return 3D icon - caller is responsible for checking use3DIcons state
  return ICON_3D_MAP[name] || null;
};