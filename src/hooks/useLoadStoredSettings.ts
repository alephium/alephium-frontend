/*
Copyright 2018 - 2022 The Alephium Authors
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

import { useEffect } from 'react'

import { loadSettings } from '../storage/settings'
import { networkSettingsChanged } from '../store/networkSlice'
import { generalSettingsChanged } from '../store/settingsSlice'
import { GeneralSettings, NetworkSettings } from '../types/settings'
import { useAppDispatch } from './redux'

const useLoadStoredSettings = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const loadStoredSettingsIntoState = async () => {
      const generalSettings = (await loadSettings('general')) as GeneralSettings
      dispatch(generalSettingsChanged(generalSettings))

      const networkSettings = (await loadSettings('network')) as NetworkSettings
      dispatch(networkSettingsChanged(networkSettings))
    }

    loadStoredSettingsIntoState()
  }, [dispatch])
}

export default useLoadStoredSettings
