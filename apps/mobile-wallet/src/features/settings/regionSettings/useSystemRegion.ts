import { useEffect } from 'react'
import { getLocales } from 'react-native-localize'

import {
  systemRegionMatchFailed,
  systemRegionMatchSucceeded
} from '~/features/settings/regionSettings/regionSettingsActions'
import { regionOptions } from '~/features/settings/regionSettings/regionsUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

export const useSystemRegion = () => {
  const region = useAppSelector((s) => s.settings.region)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!settingsLoadedFromStorage || region !== undefined) return

    const locales = getLocales()

    if (!locales.length) {
      dispatch(systemRegionMatchFailed())
    } else {
      const systemLanguage = locales[0].languageTag

      if (systemLanguage && regionOptions.find((option) => option.value === systemLanguage)) {
        dispatch(systemRegionMatchSucceeded(systemLanguage))
      } else {
        dispatch(systemRegionMatchFailed())
      }
    }
  }, [dispatch, region, settingsLoadedFromStorage])
}
