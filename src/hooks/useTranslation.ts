import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom translation hook that provides a convenient `t` function
 * with proper typing and error handling
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const translate = (key: string, options?: any): string => {
    try {
      const translated = t(key, options);
      
      // In development, warn if translation is missing
      if (__DEV__ && translated === key) {
        console.warn(`[i18n] Missing translation for key: ${key}`);
      }
      
      // In production, return key as fallback if missing
      return translated || key;
    } catch (error) {
      console.error(`[i18n] Translation error for key: ${key}`, error);
      return key;
    }
  };

  return {
    t: translate,
    i18n,
    currentLanguage: i18n.language,
  };
};

