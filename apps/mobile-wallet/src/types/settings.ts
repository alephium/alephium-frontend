import { Currency, NetworkSettings } from '@alephium/shared'

import { Language } from '~/features/localization/languages'
import { ThemeType } from '~/style/themes'

export interface GeneralSettings {
  theme: ThemeType
  discreetMode: boolean
  requireAuth: boolean
  currency: Currency
  analytics: boolean
  analyticsId?: string
  walletConnect: boolean
  usesBiometrics: boolean
  autoLockSeconds: number
  language?: Language
}

export interface Settings {
  general: GeneralSettings
  network: NetworkSettings
}

export type SettingsKey = keyof Settings

export type SettingsPartial = GeneralSettings | NetworkSettings
