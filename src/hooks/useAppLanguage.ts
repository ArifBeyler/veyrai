import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveLanguagePreference,
  resolveLanguage,
  mapDeviceLocale,
  type LanguageSetting,
  type SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from '../i18n/config';
import i18n from '../i18n/config';

export const useAppLanguage = () => {
  const [languageSetting, setLanguageSetting] = useState<LanguageSetting>('system');
  const [resolvedLang, setResolvedLang] = useState<SupportedLanguage>('tr');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        setIsLoading(true);
        const LANGUAGE_STORAGE_KEY = '@fit_swap:language';
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        let initialLang: SupportedLanguage;
        let langSetting: LanguageSetting;
        
        if (stored === 'system' || !stored) {
          langSetting = 'system';
          const deviceLocale = Localization.locale;
          initialLang = mapDeviceLocale(deviceLocale);
        } else if (SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
          langSetting = stored as SupportedLanguage;
          initialLang = stored as SupportedLanguage;
        } else {
          langSetting = 'system';
          initialLang = 'tr';
        }
        
        setResolvedLang(initialLang);
        setLanguageSetting(langSetting);
        await i18n.changeLanguage(initialLang);
      } catch (error) {
        console.error('Error initializing language:', error);
        setResolvedLang('tr');
        setLanguageSetting('system');
        await i18n.changeLanguage('tr');
      } finally {
        setIsLoading(false);
      }
    };

    initLanguage();
  }, []);

  // Set language
  const setLang = useCallback(async (lang: LanguageSetting) => {
    try {
      setLanguageSetting(lang);
      await saveLanguagePreference(lang);
      
      const resolved = await resolveLanguage(lang);
      setResolvedLang(resolved);
      await i18n.changeLanguage(resolved);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }, []);

  // Get current device locale
  const deviceLocale = Localization.locale;

  return {
    lang: languageSetting,
    setLang,
    resolvedLang,
    deviceLocale,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};

