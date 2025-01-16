import { upperFirst } from 'lodash'
import { useMemo } from 'react'

import { Language } from '@/features/localization/languages'
import { useAppSelector } from '@/hooks/redux'

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
