import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { getInitialLanguage } from '../i18n/config';

type I18nProviderProps = {
  children: React.ReactNode;
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const initialLang = await getInitialLanguage();
        await i18n.changeLanguage(initialLang);
      } catch (error) {
        console.error('Error initializing i18n:', error);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) {
    // Return a minimal loading state or null
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

