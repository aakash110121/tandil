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
} catch {}

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

export async function setAppLanguage(languageCode: 'en' | 'ar' | 'ur') {
  try {
    await AsyncStorage.setItem('app_language', languageCode);
  } catch {}
  await i18n.changeLanguage(languageCode);
}

// Load persisted language on startup
(async () => {
  try {
    const saved = await AsyncStorage.getItem('app_language');
    if (saved && (saved === 'en' || saved === 'ar' || saved === 'ur')) {
      await setAppLanguage(saved);
    }
  } catch {}
})();

export default i18n; 