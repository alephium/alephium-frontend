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

import { useAppDispatch } from '~/hooks/redux'
import { loadSettings, persistSettings } from '~/persistent-storage/settings'
import { storedGeneralSettingsLoaded } from '~/store/settingsSlice'
import { GeneralSettings } from '~/types/settings'

const useLoadStoredSettings = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadStoredSettingsIntoState = async () => {
      const generalSettings = (await loadSettings('general')) as GeneralSettings
      dispatch(storedGeneralSettingsLoaded(generalSettings))

      const networkSettings = (await loadSettings('network')) as NetworkSettings

      // TODO: Create proper migration script and tests like on the desktop wallet
      if (
        networkSettings.nodeHost === 'https://wallet-v20.mainnet.alephium.org' ||
        networkSettings.nodeHost === 'https://wallet-v20.testnet.alephium.org'
      ) {
        networkSettings.nodeHost = networkSettings.nodeHost.replace('wallet', 'node')
        await persistSettings('network', networkSettings)
      }

      dispatch(localStorageNetworkSettingsLoaded(networkSettings))
    }

    loadStoredSettingsIntoState()
  }, [dispatch])
}

export default useLoadStoredSettings
