/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { localStorageNetworkSettingsLoaded, NetworkSettings } from '@alephium/shared'
import { useEffect } from 'react'

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
    }

    loadStoredSettingsIntoState()
  }, [dispatch])
}

export default useLoadStoredSettings
