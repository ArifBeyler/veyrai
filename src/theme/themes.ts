/**
 * Veyra Theme System
 * Farklı renk temalarını tanımlar
 */

export type ThemeId = 
  | 'midnight'    // Default - Koyu mavi/mor
  | 'aurora'      // Yeşil/Cyan aurora
  | 'sunset'      // Turuncu/Pembe gün batımı
  | 'ocean'       // Mavi okyanus
  | 'lavender'    // Mor/Pembe lavanta
  | 'emerald'     // Yeşil zümrüt
  | 'rose'        // Pembe gül
  | 'cyber';      // Neon siber

export type Theme = {
  id: ThemeId;
  name: string;
  emoji: string;
  colors: {
    // Background gradients
    backgroundGradient: readonly [string, string, string];
    // Accent color (primary brand color)
    accent: string;
    accentDim: string;
    // Secondary accent
    accentSecondary: string;
    accentSecondaryDim: string;
    // Surface colors
    surface: string;
    surfaceElevated: string;
    // Stroke colors
    stroke: string;
    strokeLight: string;
    // Glow color for effects
    glow: string;
  };
  preview: readonly [string, string]; // Preview gradient for theme selector
};

export const THEMES: Record<ThemeId, Theme> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    colors: {
      backgroundGradient: ['#0B0B0C', '#12121a', '#0B0B0C'],
      accent: '#B4FF6B',
      accentDim: 'rgba(180, 255, 107, 0.2)',
      accentSecondary: '#7DD3FC',
      accentSecondaryDim: 'rgba(125, 211, 252, 0.2)',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceElevated: 'rgba(255, 255, 255, 0.12)',
      stroke: 'rgba(255, 255, 255, 0.12)',
      strokeLight: 'rgba(255, 255, 255, 0.06)',
      glow: '#B4FF6B',
    },
    preview: ['#0B0B0C', '#12121a'],
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    colors: {
      backgroundGradient: ['#0a1628', '#0f2027', '#0a1628'],
      accent: '#00F5D4',
      accentDim: 'rgba(0, 245, 212, 0.2)',
      accentSecondary: '#00BBF9',
      accentSecondaryDim: 'rgba(0, 187, 249, 0.2)',
      surface: 'rgba(0, 245, 212, 0.08)',
      surfaceElevated: 'rgba(0, 245, 212, 0.12)',
      stroke: 'rgba(0, 245, 212, 0.15)',
      strokeLight: 'rgba(0, 245, 212, 0.08)',
      glow: '#00F5D4',
    },
    preview: ['#0f2027', '#00F5D4'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    colors: {
      backgroundGradient: ['#1a0a14', '#2d1f24', '#1a0a14'],
      accent: '#FF6B6B',
      accentDim: 'rgba(255, 107, 107, 0.2)',
      accentSecondary: '#FFE66D',
      accentSecondaryDim: 'rgba(255, 230, 109, 0.2)',
      surface: 'rgba(255, 107, 107, 0.08)',
      surfaceElevated: 'rgba(255, 107, 107, 0.12)',
      stroke: 'rgba(255, 107, 107, 0.15)',
      strokeLight: 'rgba(255, 107, 107, 0.08)',
      glow: '#FF6B6B',
    },
    preview: ['#2d1f24', '#FF6B6B'],
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    colors: {
      backgroundGradient: ['#0a1929', '#0d2137', '#0a1929'],
      accent: '#4FC3F7',
      accentDim: 'rgba(79, 195, 247, 0.2)',
      accentSecondary: '#81D4FA',
      accentSecondaryDim: 'rgba(129, 212, 250, 0.2)',
      surface: 'rgba(79, 195, 247, 0.08)',
      surfaceElevated: 'rgba(79, 195, 247, 0.12)',
      stroke: 'rgba(79, 195, 247, 0.15)',
      strokeLight: 'rgba(79, 195, 247, 0.08)',
      glow: '#4FC3F7',
    },
    preview: ['#0d2137', '#4FC3F7'],
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    emoji: '💜',
    colors: {
      backgroundGradient: ['#1a0f24', '#241432', '#1a0f24'],
      accent: '#C084FC',
      accentDim: 'rgba(192, 132, 252, 0.2)',
      accentSecondary: '#F0ABFC',
      accentSecondaryDim: 'rgba(240, 171, 252, 0.2)',
      surface: 'rgba(192, 132, 252, 0.08)',
      surfaceElevated: 'rgba(192, 132, 252, 0.12)',
      stroke: 'rgba(192, 132, 252, 0.15)',
      strokeLight: 'rgba(192, 132, 252, 0.08)',
      glow: '#C084FC',
    },
    preview: ['#241432', '#C084FC'],
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    emoji: '💎',
    colors: {
      backgroundGradient: ['#0a1a14', '#0f2920', '#0a1a14'],
      accent: '#34D399',
      accentDim: 'rgba(52, 211, 153, 0.2)',
      accentSecondary: '#6EE7B7',
      accentSecondaryDim: 'rgba(110, 231, 183, 0.2)',
      surface: 'rgba(52, 211, 153, 0.08)',
      surfaceElevated: 'rgba(52, 211, 153, 0.12)',
      stroke: 'rgba(52, 211, 153, 0.15)',
      strokeLight: 'rgba(52, 211, 153, 0.08)',
      glow: '#34D399',
    },
    preview: ['#0f2920', '#34D399'],
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    colors: {
      backgroundGradient: ['#1a0f14', '#2d1a22', '#1a0f14'],
      accent: '#FB7185',
      accentDim: 'rgba(251, 113, 133, 0.2)',
      accentSecondary: '#FDA4AF',
      accentSecondaryDim: 'rgba(253, 164, 175, 0.2)',
      surface: 'rgba(251, 113, 133, 0.08)',
      surfaceElevated: 'rgba(251, 113, 133, 0.12)',
      stroke: 'rgba(251, 113, 133, 0.15)',
      strokeLight: 'rgba(251, 113, 133, 0.08)',
      glow: '#FB7185',
    },
    preview: ['#2d1a22', '#FB7185'],
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    emoji: '🤖',
    colors: {
      backgroundGradient: ['#0a0a14', '#12121f', '#0a0a14'],
      accent: '#F0F',
      accentDim: 'rgba(255, 0, 255, 0.2)',
      accentSecondary: '#0FF',
      accentSecondaryDim: 'rgba(0, 255, 255, 0.2)',
      surface: 'rgba(255, 0, 255, 0.08)',
      surfaceElevated: 'rgba(255, 0, 255, 0.12)',
      stroke: 'rgba(255, 0, 255, 0.15)',
      strokeLight: 'rgba(255, 0, 255, 0.08)',
      glow: '#F0F',
    },
    preview: ['#12121f', '#F0F'],
  },
};

export const DEFAULT_THEME: ThemeId = 'midnight';

export const getTheme = (id: ThemeId): Theme => THEMES[id] || THEMES[DEFAULT_THEME];

export const getAllThemes = (): Theme[] => Object.values(THEMES);

