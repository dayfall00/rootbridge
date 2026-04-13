import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import bnTranslation from './locales/bn.json';
import mrTranslation from './locales/mr.json';
import taTranslation from './locales/ta.json';

// Detect default language
const getInitialLanguage = () => {
  const savedLang = localStorage.getItem('lang');
  if (savedLang) return savedLang;
  
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.toLowerCase().startsWith('hi')) {
    return 'hi';
  }
  return 'en';
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
      bn: { translation: bnTranslation },
      mr: { translation: mrTranslation },
      ta: { translation: taTranslation }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

// Setup listener to persist language
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
});

export default i18n;
