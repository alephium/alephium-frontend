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

import { createAction } from '@reduxjs/toolkit'

import { NetworkName, NetworkPreset, NetworkSettings } from '@/types/network'

export const networkPresetSwitched = createAction<NetworkPreset>('network/networkPresetSwitched')

export const customNetworkSettingsSaved = createAction<NetworkSettings>('network/customNetworkSettingsSaved')

export const localStorageNetworkSettingsMigrated = createAction<NetworkSettings>(
  'network/localStorageNetworkSettingsMigrated'
)

export const localStorageNetworkSettingsLoaded = createAction<NetworkSettings>(
  'network/localStorageNetworkSettingsLoaded'
)

export const apiClientInitSucceeded = createAction<{
  networkId: NetworkSettings['networkId']
  networkName: NetworkName
}>('network/apiClientInitSucceeded')

export const apiClientInitFailed = createAction<{ networkName: NetworkName }>('network/apiClientInitFailed')
