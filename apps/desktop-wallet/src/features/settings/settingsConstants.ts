import { CURRENCIES, Currency, defaultNetworkSettings } from '@alephium/shared'

import { SelectOption } from '@/components/Inputs/Select'
import { Language, Settings } from '@/features/settings/settingsTypes'

export const languageOptions: SelectOption<Language>[] = [
  { label: 'English', value: 'en-US' },
  { label: 'Български', value: 'bg-BG' },
  { label: 'Deutsch', value: 'de-DE' },
  { label: 'Español', value: 'es-ES' },
  { label: 'Français', value: 'fr-FR' },
  { label: 'Bahasa Indonesia', value: 'id-ID' },
  { label: 'Italiano', value: 'it-IT' },
  { label: 'Português', value: 'pt-PT' },
  { label: 'Русский', value: 'ru-RU' },
  { label: 'Türkçe', value: 'tr-TR' },
  { label: 'Tiếng Việt', value: 'vi-VN' },
  { label: 'Ελληνικά', value: 'el-GR' },
  { label: '简体中文', value: 'zh-CN' }
]

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
    region: undefined
  },
  network: defaultNetworkSettings
}
