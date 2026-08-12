'use client';

import React, { createContext, useContext } from 'react';
import { SupportedLanguage, getTranslation, LANGUAGES } from '../lib/i18n';

interface I18nContextType {
  language: SupportedLanguage;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  t: (key: string, fallback?: string) => fallback || key,
  isRtl: false,
});

export const I18nProvider: React.FC<{
  language: SupportedLanguage;
  children: React.ReactNode;
}> = ({ language, children }) => {
  const currentLang = language || 'en';
  const langObj = LANGUAGES.find((l) => l.code === currentLang);
  const isRtl = langObj?.dir === 'rtl';

  const t = (key: string, fallback?: string) => {
    return getTranslation(key, currentLang, fallback);
  };

  return (
    <I18nContext.Provider value={{ language: currentLang, t, isRtl }}>
      <div dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>{children}</div>
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
