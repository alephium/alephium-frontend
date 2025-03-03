import { createAction } from '@reduxjs/toolkit'

import { Language } from '@/features/localization/languages'

export const languageChangeStarted = createAction('localization/languageChangeStarted')

export const languageChangeFinished = createAction('localization/languageChangeFinished')

export const systemLanguageMatchSucceeded = createAction<Language>('localization/systemLanguageMatchSucceeded')

export const systemLanguageMatchFailed = createAction('localization/systemLanguageMatchFailed')

export const languageChanged = createAction<Language>('localization/languageChanged')
