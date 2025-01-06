import { Currency, NetworkSettings } from '@alephium/shared'

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
}

export interface Settings {
  general: GeneralSettings
  network: NetworkSettings
}

export type Language =
  | 'en-US'
  | 'fr-FR'
  | 'de-DE'
  | 'vi-VN'
  | 'pt-PT'
  | 'ru-RU'
  | 'bg-BG'
  | 'es-ES'
  | 'id-ID'
  | 'tr-TR'
  | 'it-IT'
  | 'el-GR'
  | 'zh-CN'
