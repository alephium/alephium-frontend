import { Currency, getNetworkName, networkSettingsPresets } from '@alephium/shared'

import { Language } from '@/features/localization/languages'
import { defaultSettings } from '@/features/settings/settingsConstants'
import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { Settings } from '@/features/settings/settingsTypes'
import { ThemeSettings } from '@/features/theme/themeTypes'

const mockSettings: Settings = {
  general: {
    theme: 'light' as ThemeSettings,
    walletLockTimeInMinutes: 999,
    discreetMode: false,
    passwordRequirement: false,
    language: 'en-US' as Language,
    devTools: false,
    analytics: false,
    fiatCurrency: 'USD' as Currency,
    region: undefined
  },
  network: {
    networkId: 123,
    nodeHost: 'https://node',
    explorerApiHost: 'https://explorer-backend',
    explorerUrl: 'https://explorer',
    proxy: { address: '1.1.1.1', port: '42' }
  }
}

it('Should return the network name if all settings match exactly', () => {
  expect(getNetworkName(networkSettingsPresets.devnet)).toEqual('devnet'),
    expect(getNetworkName(networkSettingsPresets.testnet)).toEqual('testnet'),
    expect(getNetworkName(networkSettingsPresets.mainnet)).toEqual('mainnet'),
    expect(
      getNetworkName({
        nodeHost: '',
        explorerApiHost: '',
        explorerUrl: '',
        networkId: 0,
        proxy: { address: '', port: '' }
      })
    ).toEqual('custom'),
    expect(
      getNetworkName({
        ...networkSettingsPresets.mainnet,
        nodeHost: 'https://mainnet-wallet.alephium2.org'
      })
    ).toEqual('custom')
})

it('Should load settings from local storage', () => {
  expect(SettingsStorage.loadAll()).toEqual(defaultSettings)

  localStorage.setItem('settings', JSON.stringify(mockSettings))
  expect(SettingsStorage.loadAll()).toEqual(mockSettings)
})

it('Should save settings in local storage', () => {
  SettingsStorage.storeAll(mockSettings)
  expect(localStorage.getItem('settings')).toEqual(JSON.stringify(mockSettings))
})

it('Should update stored settings', () => {
  const newNetworkSettings = {
    networkId: 1,
    nodeHost: 'https://node1',
    explorerApiHost: 'https://explorer-backend1',
    explorerUrl: 'https://explorer1',
    proxy: { address: '2.2.2.2', port: '69' }
  }
  SettingsStorage.store('network', newNetworkSettings)
  expect(localStorage.getItem('settings')).toEqual(JSON.stringify({ ...mockSettings, network: newNetworkSettings }))
})
