import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'bn' | 'gu' | 'mr' | 'ml' | 'pa' | 'or' | 'as' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation cache
const translationCache: Record<Language, any> = {} as Record<Language, any>;

// Load translation file dynamically
const loadTranslations = async (language: Language): Promise<any> => {
  if (translationCache[language]) {
    return translationCache[language];
  }

  try {
    const translations = await import(`../locales/${language}.json`);
    translationCache[language] = translations.default;
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${language}:`, error);
    // Fallback to English
    if (language !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'hi', 'te', 'ta', 'kn', 'bn', 'gu', 'mr', 'ml', 'pa', 'or', 'as', 'ur'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Load translations when language changes
    loadTranslations(language).then(setTranslations);
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        if (language !== 'en') {
          const englishTranslations = translationCache['en'];
          if (englishTranslations) {
            let fallbackValue = englishTranslations;
            for (const fallbackKey of keys) {
              if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
                fallbackValue = fallbackValue[fallbackKey];
              } else {
                return key; // Return key if not found in English either
              }
            }
            return fallbackValue;
          }
        }
        return key; // Return key if not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}