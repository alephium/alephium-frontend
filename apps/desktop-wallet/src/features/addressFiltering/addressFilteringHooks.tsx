import { useMemo } from 'react'

import useFetchWalletBalancesAlphByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphByAddress'
import useFetchWalletBalancesTokensByAddress from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensByAddress'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import { useUnsortedAddresses, useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

export const useFilterAddressesByText = (text = '') => {
  const allAddresses = useUnsortedAddresses()
  const allAddressHashes = useUnsortedAddressesHashes()
  const { listedFts, unlistedFts } = useFetchWalletFts({ sort: false })
  const { data: addressesAlphBalances } = useFetchWalletBalancesAlphByAddress()
  const { data: addressesTokensBalances } = useFetchWalletBalancesTokensByAddress()

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
            const addressAlphBalances = addressesAlphBalances[addressHash]
            const addressHasAlphBalances = BigInt(addressAlphBalances?.totalBalance ?? 0) > 0

            if (addressHasAlphBalances) {
              if ('alephium alph'.includes(text)) return true

              const addressTokensBalances = addressesTokensBalances[addressHash] ?? []
              const addressSearchableString = addressTokensBalances
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
    [addressesAlphBalances, addressesTokensBalances, allAddressHashes, allAddresses, listedFts, text, unlistedFts]
  )
}
