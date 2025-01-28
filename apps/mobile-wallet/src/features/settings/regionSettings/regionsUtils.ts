import { upperFirst } from 'lodash'

import regionByKeys from './regions.json'

// See https://github.com/LedgerHQ/ledger-live/blob/3308c61ab3749b293167bb7485360a66187ae9eb/apps/ledger-live-mobile/src/screens/Settings/General/Region.ts
export const regionOptions = Object.keys(regionByKeys)
  .map((key) => {
    const { languageDisplayName, regionDisplayName } = regionByKeys[key as keyof typeof regionByKeys]
    const label = `${upperFirst(regionDisplayName)} (${upperFirst(languageDisplayName)})`

    return {
      value: key,
      label
    }
  })
  .sort((a, b) => a.label.localeCompare(b.label))
