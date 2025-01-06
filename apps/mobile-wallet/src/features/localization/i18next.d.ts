import 'i18next'

import en from '../../../locales/en-US/translation.json'

type EnglishTranslationKeys = typeof en

export type TranslationKey = keyof EnglishTranslationKeys

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: EnglishTranslationKeys
    }
  }
}
