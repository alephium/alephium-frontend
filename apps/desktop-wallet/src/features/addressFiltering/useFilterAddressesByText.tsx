import { useUnsortedAddressesHashes } from '@alephium/shared-react'
import { useMemo } from 'react'

import useFetchAddressesSearchStrings from '@/features/addressFiltering/useFetchAddressesSearchStrings'

export const useFilterAddressesByText = (text = '') => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const { data: addressesSearchStrings } = useFetchAddressesSearchStrings(allAddressHashes)

  return useMemo(
    () =>
      text.length < 2
        ? allAddressHashes
        : allAddressHashes.filter((addressHash) => {
            const addressSearchableString = addressesSearchStrings[addressHash]

            return addressSearchableString.toLowerCase().includes(text.toLowerCase())
          }),
    [addressesSearchStrings, allAddressHashes, text]
  )
}
