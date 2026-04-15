import { useEffect } from 'react'
import { getLocales } from 'react-native-localize'

import { sendAnalytics } from '~/analytics'
import i18next from '~/features/localization/i18n'
import { Language, languageOptions } from '~/features/localization/languages'
import { systemLanguageMatchFailed, systemLanguageMatchSucceeded } from '~/features/localization/localizationActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

export const useLocalization = () => {
  const language = useAppSelector((s) => s.settings.language)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (language === undefined) {
      const locales = getLocales()

      if (!locales.length) {
        dispatch(systemLanguageMatchFailed())
      } else {
        const systemLanguage = locales[0].languageTag

        if (systemLanguage && languageOptions.find((option) => option.value === systemLanguage)) {
          dispatch(systemLanguageMatchSucceeded(systemLanguage as Language))
        } else {
          dispatch(systemLanguageMatchFailed())
        }
      }
    } else {
      try {
        i18next.changeLanguage(language)
      } catch (error) {
        sendAnalytics({ type: 'error', error, message: 'Changing language' })
      }
    }
  }, [dispatch, language])
}
