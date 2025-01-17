import { localStorageNetworkSettingsLoaded, NetworkSettings } from '@alephium/shared'
import { useEffect } from 'react'

import { favoriteDAppsLoadedFromStorage } from '~/features/ecosystem/favoriteDAppsActions'
import { getFavoriteDApps } from '~/features/ecosystem/favoriteDAppsStorage'
import { fundPasswordUseToggled } from '~/features/fund-password/fundPasswordActions'
import { hasStoredFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { loadSettings } from '~/features/settings/settingsPersistentStorage'
import { storedGeneralSettingsLoaded } from '~/features/settings/settingsSlice'
import { useAppDispatch } from '~/hooks/redux'
import { GeneralSettings } from '~/types/settings'
import { migrateNetworkSettings } from '~/utils/migration'

const useLoadStoredSettings = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadStoredSettingsIntoState = async () => {
      const generalSettings = (await loadSettings('general')) as GeneralSettings
      dispatch(storedGeneralSettingsLoaded(generalSettings))

      await migrateNetworkSettings()
      const networkSettings = (await loadSettings('network')) as NetworkSettings
      dispatch(localStorageNetworkSettingsLoaded(networkSettings))

      const isUsingFundPassword = await hasStoredFundPassword()
      dispatch(fundPasswordUseToggled(isUsingFundPassword))

      const favoriteDApps = await getFavoriteDApps()
      dispatch(favoriteDAppsLoadedFromStorage(favoriteDApps))
    }

    loadStoredSettingsIntoState()
  }, [dispatch])
}

export default useLoadStoredSettings
