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

import { upperFirst } from 'lodash'
import { useMemo } from 'react'

import { useAppSelector } from '@/hooks/redux'
import { Language } from '@/types/settings'

import regionsLocales from './regions.json'

const useRegionOptions = () => {
  const language = useAppSelector((s) => s.settings.language)

  return useMemo(() => getRegionsOptions(language ?? 'en-US'), [language])
}

export default useRegionOptions

// Inspired by https://github.com/LedgerHQ/ledger-live/blob/065dda3/apps/ledger-live-desktop/src/renderer/screens/settings/sections/General/RegionSelect.tsx
const getRegionOption = (regionLocale: string, languageLocale: string | Intl.Locale) => {
  const [language, region = ''] = regionLocale.split('-')
  const languageDisplayName = new window.Intl.DisplayNames([languageLocale], {
    type: 'language'
  }).of(language)
  const regionDisplayName = new window.Intl.DisplayNames([languageLocale], {
    type: 'region'
  }).of(region)
  const labelPrefix = upperFirst(regionDisplayName)
  const labelSuffix = regionDisplayName ? ` (${upperFirst(languageDisplayName)})` : ''
  const label = `${labelPrefix}${labelSuffix}`

  return {
    value: regionLocale,
    label
  }
}

const getRegionsOptions = (languageLocale: Language) =>
  regionsLocales
    .map((regionLocale) => getRegionOption(regionLocale, languageLocale))
    .sort((a, b) => a.label.localeCompare(b.label))
