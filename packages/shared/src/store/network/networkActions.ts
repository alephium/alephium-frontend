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

export const nodeApiClientInitSucceeded = createAction<{
  networkId: NetworkSettings['networkId']
  networkName: NetworkName
}>('network/nodeApiClientInitSucceeded')

export const nodeApiClientInitFailed = createAction<{ networkName: NetworkName }>('network/nodeApiClientInitFailed')

export const explorerApiClientInitSucceeded = createAction('network/explorerApiClientInitSucceeded')

export const explorerApiClientInitFailed = createAction('network/explorerApiClientInitFailed')
