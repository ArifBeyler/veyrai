import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from './locales/tr.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

const LANGUAGE_STORAGE_KEY = '@fit_swap:language';

// Supported languages
export const SUPPORTED_LANGUAGES = ['tr', 'en', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export type LanguageSetting = 'system' | SupportedLanguage;

// Map device locales to supported languages
export const mapDeviceLocale = (deviceLocale: string | null | undefined): SupportedLanguage => {
  if (!deviceLocale || typeof deviceLocale !== 'string') {
    return 'en';
  }
  
  const langCode = deviceLocale.split('-')[0].toLowerCase();
  
  if (SUPPORTED_LANGUAGES.includes(langCode as SupportedLanguage)) {
    return langCode as SupportedLanguage;
  }
  
  // Default fallback
  return 'en';
};

// Get initial language
export const getInitialLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (stored === 'system' || !stored) {
      // Use device locale
      const deviceLocale = Localization.locale;
      return mapDeviceLocale(deviceLocale);
    }
    
    if (SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
    
    return 'en';
  } catch (error) {
    console.error('Error getting initial language:', error);
    return 'en';
  }
};

// Save language preference
export const saveLanguagePreference = async (lang: LanguageSetting): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Resolve language setting to actual language
export const resolveLanguage = async (setting: LanguageSetting): Promise<SupportedLanguage> => {
  if (setting === 'system') {
    const deviceLocale = Localization.locale;
    return mapDeviceLocale(deviceLocale);
  }
  return setting;
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: 'en', // Will be set dynamically
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

