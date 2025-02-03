import { createAction } from '@reduxjs/toolkit'

import { Settings } from '~/types/settings'

export const numberFormatRegionChanged = createAction<Settings['general']['region']>(
  'settings/numberFormatRegionChanged'
)

export const systemRegionMatchSucceeded = createAction<string>('settings/systemRegionMatchSucceeded')

export const systemRegionMatchFailed = createAction('settings/systemRegionMatchFailed')
