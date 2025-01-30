import { Currency, NetworkSettings } from '@alephium/shared'

import { Language } from '@/features/localization/languages'
import { AddressOrder } from '@/features/settings/settingsConstants'
import { ThemeSettings } from '@/features/theme/themeTypes'

export interface GeneralSettings {
  theme: ThemeSettings
  walletLockTimeInMinutes: number | null
  discreetMode: boolean
  passwordRequirement: boolean
  language: Language | undefined
  devTools: boolean
  analytics: boolean
  fiatCurrency: Currency
  region: string | undefined
  addressOrderPreference: AddressOrder
}

export interface Settings {
  general: GeneralSettings
  network: NetworkSettings
}
