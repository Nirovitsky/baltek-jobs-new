import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguagePersistence = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Ensure language is properly initialized from localStorage
    const initializeLanguage = () => {
      try {
        const storedLanguage = localStorage.getItem('i18nextLng');
        if (storedLanguage && ['en', 'ru', 'tk'].includes(storedLanguage)) {
          if (i18n.language !== storedLanguage) {
            i18n.changeLanguage(storedLanguage);
          }
        }
      } catch (error) {
        console.warn('Failed to initialize language from localStorage:', error);
      }
    };

    // Initialize on mount
    initializeLanguage();

    // Listen for language changes and ensure persistence
    const handleLanguageChange = (lng: string) => {
      try {
        localStorage.setItem('i18nextLng', lng);
      } catch (error) {
        console.error('Failed to save language to localStorage:', error);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
};
