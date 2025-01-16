import { createAction } from '@reduxjs/toolkit'

import { Currency } from '@/types/currencies'

export const fiatCurrencyChanged = createAction<Currency>('settings/fiatCurrencyChanged')
