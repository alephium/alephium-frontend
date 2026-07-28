import { useUnsortedAddressesHashes } from '@alephium/shared-react'
import { useMemo } from 'react'

import { MIN_SEARCH_TERM_LENGTH } from '@/features/addressFiltering/addressFilteringConstants'
import useFetchAddressesSearchStrings from '@/features/addressFiltering/useFetchAddressesSearchStrings'

export const useFilterAddressesByText = (text = '') => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: addressesSearchStrings } = useFetchAddressesSearchStrings(allAddressHashes)

  return useMemo(
    () =>
      text.length < MIN_SEARCH_TERM_LENGTH
        ? allAddressHashes
        : allAddressHashes.filter((addressHash) => {
            const addressSearchableString = addressesSearchStrings[addressHash]

            return addressSearchableString.toLowerCase().includes(text)
          }),
    [addressesSearchStrings, allAddressHashes, text]
  )
}
