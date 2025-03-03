import { useMemo } from 'react'

import useFetchWalletBalancesByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesByAddress'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import { useUnsortedAddresses, useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

export const useFilterAddressesByText = (text = '') => {
  const allAddresses = useUnsortedAddresses()
  const allAddressHashes = useUnsortedAddressesHashes()
  const { listedFts, unlistedFts } = useFetchWalletFts({ sort: false, includeHidden: false })
  const { data: addressesBalances } = useFetchWalletBalancesByAddress()

  return useMemo(
    () =>
      text.length < 2
        ? allAddressHashes
        : allAddressHashes.filter((addressHash) => {
            // Step 1. Validate against address hash
            if (addressHash.toLowerCase().includes(text)) return true

            // Step 2. Validate against address label
            const address = allAddresses.find((address) => address.hash === addressHash)

            if (!address) return false
            if (address.label?.toLowerCase().includes(text)) return true

            // Step 3. Validate against token names
            const addressBalances = addressesBalances[addressHash]

            if (addressBalances) {
              const addressSearchableString = addressBalances
                .map(({ id }) => {
                  const listedFt = listedFts.find((token) => token.id === id)

                  if (listedFt) return `${listedFt.name} ${listedFt.symbol} ${id}`

                  const unlistedFt = unlistedFts.find((token) => token.id === id)

                  if (unlistedFt) return `${unlistedFt.name} ${unlistedFt.symbol} ${id}`
                })
                .join('')

              if (addressSearchableString.toLowerCase().includes(text)) return true
            } else {
              return false
            }
          }),
    [addressesBalances, allAddressHashes, allAddresses, listedFts, text, unlistedFts]
  )
}
