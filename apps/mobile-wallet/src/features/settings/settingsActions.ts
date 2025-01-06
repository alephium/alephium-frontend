import { createAction } from '@reduxjs/toolkit'

import { GeneralSettings } from '~/types/settings'

export const analyticsIdGenerated = createAction<GeneralSettings['analyticsId']>('settings/analyticsIdGenerated')

export const allBiometricsEnabled = createAction('settings/allBiometricsEnabled')
