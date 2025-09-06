import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ru from './locales/ru.json';
import tk from './locales/tk.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  tk: { translation: tk },
};

// Get stored language from localStorage
const getStoredLanguage = (): string => {
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && ['en', 'ru', 'tk'].includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  return 'en'; // fallback to English
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(), // Use stored language or fallback to English
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      cookieMinutes: 10080, // 7 days
      cookieDomain: 'localhost',
      cookieOptions: { path: '/', sameSite: 'strict' }
    },
    
    // Ensure language is persisted properly
    saveMissing: false,
    debug: false,
  });

export default i18n;