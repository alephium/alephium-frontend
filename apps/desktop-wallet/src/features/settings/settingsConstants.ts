import { CURRENCIES, Currency, defaultNetworkSettings } from '@alephium/shared'

import { SelectOption } from '@/components/Inputs/Select'
import { Settings } from '@/features/settings/settingsTypes'

export const fiatCurrencyOptions: SelectOption<Currency>[] = Object.values(CURRENCIES).map((currency) => ({
  label: currency.ticker,
  value: currency.ticker
}))

export const LockTimes = {
  ONE_MIN: 0,
  TWO_MIN: 2,
  FIVE_MIN: 5,
  TEN_MIN: 10,
  THIRTY_MIN: 30,
  ONE_HOUR: 60,
  TWO_HOURS: 120
}
export enum AddressOrder {
  LastUse = 'lastUse',
  AlphBalance = 'alphBalance',
  Label = 'label',
  Index = 'index'
}

export const locktimeInMinutes = Object.values(LockTimes)

export const defaultSettings: Settings = {
  general: {
    theme: 'system',
    walletLockTimeInMinutes: LockTimes.FIVE_MIN,
    discreetMode: false,
    passwordRequirement: false,
    language: undefined,
    devTools: false,
    analytics: true,
    fiatCurrency: 'USD',
    region: undefined,
    addressOrderPreference: AddressOrder.LastUse
  },
  network: defaultNetworkSettings
}
