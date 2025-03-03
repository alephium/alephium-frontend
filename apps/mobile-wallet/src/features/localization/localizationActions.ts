import { createAction } from '@reduxjs/toolkit'

import { Language } from '~/features/localization/languages'

export const languageChanged = createAction<Language>('localization/languageChanged')

export const systemLanguageMatchSucceeded = createAction<Language>('localization/systemLanguageMatchSucceeded')

export const systemLanguageMatchFailed = createAction('localization/systemLanguageMatchFailed')
