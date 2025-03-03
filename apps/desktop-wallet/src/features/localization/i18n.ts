import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import bg from '../../../locales/bg-BG/translation.json'
import de from '../../../locales/de-DE/translation.json'
import el from '../../../locales/el-GR/translation.json'
import en from '../../../locales/en-US/translation.json'
import es from '../../../locales/es-ES/translation.json'
import fr from '../../../locales/fr-FR/translation.json'
import id from '../../../locales/id-ID/translation.json'
import it from '../../../locales/it-IT/translation.json'
import pt from '../../../locales/pt-PT/translation.json'
import ru from '../../../locales/ru-RU/translation.json'
import th from '../../../locales/th-TH/translation.json'
import tr from '../../../locales/tr-TR/translation.json'
import vi from '../../../locales/vi-VN/translation.json'
import zh from '../../../locales/zh-CN/translation.json'

i18next.use(initReactI18next).init({
  resources: {
    'en-US': { translation: en },
    'bg-BG': { translation: bg },
    'es-ES': { translation: es },
    'de-DE': { translation: de },
    'id-ID': { translation: id },
    'it-IT': { translation: it },
    'fr-FR': { translation: fr },
    'pt-PT': { translation: pt },
    'ru-RU': { translation: ru },
    'tr-TR': { translation: tr },
    'vi-VN': { translation: vi },
    'el-GR': { translation: el },
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
