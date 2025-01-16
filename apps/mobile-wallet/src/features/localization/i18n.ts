import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import gr from '../../../locales/el-GR/translation.json'
import en from '../../../locales/en-US/translation.json'
import fr from '../../../locales/fr-FR/translation.json'
import pt from '../../../locales/pt-PT/translation.json'
import th from '../../../locales/th-TH/translation.json'
import vi from '../../../locales/vi-VN/translation.json'
import zh from '../../../locales/zh-CN/translation.json'

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    'en-US': { translation: en },
    'fr-FR': { translation: fr },
    'el-GR': { translation: gr },
    'vi-VN': { translation: vi },
    'pt-PT': { translation: pt },
    'zh-CN': { translation: zh },
    'th-TH': { translation: th }
  },
  lng: 'en-US',
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false
  }
})

export default i18next
