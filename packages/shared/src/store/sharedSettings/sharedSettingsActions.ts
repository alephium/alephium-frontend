import { createAction } from '@reduxjs/toolkit'

import { Currency } from '@/types/currencies'
import { SharedSettings } from '@/types/sharedSettings'

export const storedSharedSettingsLoaded = createAction<SharedSettings>('sharedSettings/storedSharedSettingsLoaded')

export const fiatCurrencyChanged = createAction<Currency>('sharedSettings/fiatCurrencyChanged')
