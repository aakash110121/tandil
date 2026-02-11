import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, ar, ur } from './translations';
import { I18nManager } from 'react-native';

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
  ur: {
    translation: ur,
  },
};

// Disable RTL layout mirroring globally per user request
try {
  if (I18nManager.isRTL || I18nManager.getConstants?.().isRTL) {
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);
  } else {
    I18nManager.allowRTL(false);
  }
} catch (error) {
  console.error('Error configuring RTL:', error);
}

// Initialize i18n with error handling
try {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v4',
    });
} catch (error) {
  console.error('Error initializing i18n:', error);
  // Fallback: try to initialize with minimal config
  try {
    i18n.init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
    });
  } catch (fallbackError) {
    console.error('Critical: i18n initialization failed completely:', fallbackError);
  }
}

export async function setAppLanguage(languageCode: 'en' | 'ar' | 'ur') {
  try {
    await AsyncStorage.setItem('app_language', languageCode);
    await i18n.changeLanguage(languageCode);
  } catch (error) {
    console.error('Error setting app language:', error);
    // Still try to change language even if storage fails
    try {
      await i18n.changeLanguage(languageCode);
    } catch (langError) {
      console.error('Error changing i18n language:', langError);
    }
  }
}

// Load persisted language on startup with error handling
(async () => {
  try {
    const saved = await AsyncStorage.getItem('app_language');
    if (saved && (saved === 'en' || saved === 'ar' || saved === 'ur')) {
      await setAppLanguage(saved);
    }
  } catch (error) {
    console.error('Error loading persisted language:', error);
    // Continue with default language (en)
  }
})();

export default i18n; 