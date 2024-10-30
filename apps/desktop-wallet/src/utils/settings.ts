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

import { CURRENCIES, Currency } from '@alephium/shared'

import { SelectOption } from '@/components/Inputs/Select'
import SettingsStorage from '@/storage/settings/settingsPersistentStorage'
import { GeneralSettings, Language } from '@/types/settings'

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
  { label: 'Ελληνικά', value: 'el-GR' }
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

export const getThemeType = () => {
  const storedSettings = SettingsStorage.load('general') as GeneralSettings

  return storedSettings.theme === 'system' ? 'dark' : storedSettings.theme
}
