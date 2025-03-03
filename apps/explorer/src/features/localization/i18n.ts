import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { supportedLanguages } from '@/features/localization/languages'

import de from '../../../locales/de-DE/translation.json'
import el from '../../../locales/el-GR/translation.json'
import en from '../../../locales/en-US/translation.json'
import fr from '../../../locales/fr-FR/translation.json'
import id from '../../../locales/id-ID/translation.json'
import it from '../../../locales/it-IT/translation.json'
import pt from '../../../locales/pt-PT/translation.json'
import th from '../../../locales/th-TH/translation.json'
import vi from '../../../locales/vi-VN/translation.json'
import zh from '../../../locales/zh-CN/translation.json'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      id: { translation: id },
      el: { translation: el },
      de: { translation: de },
      vi: { translation: vi },
      zh: { translation: zh },
      it: { translation: it },
      pt: { translation: pt },
      th: { translation: th }
    },
    supportedLngs: supportedLanguages,
    fallbackLng: 'en',
    detection: {
      lookupLocalStorage: 'language'
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18next
