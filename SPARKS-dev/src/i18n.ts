import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enPricing from './locales/en/pricing.json';
import jaCommon from './locales/ja/common.json';
import jaLanding from './locales/ja/landing.json';
import jaPricing from './locales/ja/pricing.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, landing: enLanding, pricing: enPricing },
      ja: { common: jaCommon, landing: jaLanding, pricing: jaPricing },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ja'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'sparks_language',
    },
    interpolation: { escapeValue: false },
    defaultNS: 'common',
  });

export default i18n;
