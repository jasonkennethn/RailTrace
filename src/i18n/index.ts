import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import as from './locales/as.json';
import ur from './locales/ur.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  kn: { translation: kn },
  ml: { translation: ml },
  bn: { translation: bn },
  mr: { translation: mr },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur },
};

// Language configuration with proper font scaling
const languageConfig = {
  en: { fontScale: 1.0, fontFamily: 'Inter, sans-serif' },
  hi: { fontScale: 1.1, fontFamily: 'Noto Sans Devanagari, sans-serif' },
  te: { fontScale: 1.15, fontFamily: 'Noto Sans Telugu, sans-serif' },
  ta: { fontScale: 1.2, fontFamily: 'Noto Sans Tamil, sans-serif' },
  kn: { fontScale: 1.1, fontFamily: 'Noto Sans Kannada, sans-serif' },
  ml: { fontScale: 1.15, fontFamily: 'Noto Sans Malayalam, sans-serif' },
  bn: { fontScale: 1.1, fontFamily: 'Noto Sans Bengali, sans-serif' },
  mr: { fontScale: 1.1, fontFamily: 'Noto Sans Devanagari, sans-serif' },
  gu: { fontScale: 1.1, fontFamily: 'Noto Sans Gujarati, sans-serif' },
  pa: { fontScale: 1.1, fontFamily: 'Noto Sans Gurmukhi, sans-serif' },
  or: { fontScale: 1.1, fontFamily: 'Noto Sans Oriya, sans-serif' },
  as: { fontScale: 1.1, fontFamily: 'Noto Sans Bengali, sans-serif' },
  ur: { fontScale: 1.1, fontFamily: 'Noto Sans Arabic, sans-serif' },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    // Language-specific configuration
    react: {
      useSuspense: false,
    },
  });

// Export language configuration for font scaling
export { languageConfig };
export default i18n;
