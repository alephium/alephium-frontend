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
