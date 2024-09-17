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

import { useMemo } from 'react'

import useFetchWalletAlphBalancesByAddress from '@/api/apiDataHooks/wallet/useFetchWalletAlphBalancesByAddress'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import { useFetchWalletTokensBalancesByAddress } from '@/api/apiDataHooks/wallet/useFetchWalletTokensBalancesBy'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'

export const useFilterAddressesByText = (text = '') => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const { listedFts, unlistedFts } = useFetchWalletFts({ sort: false })
  const { data: addressesAlphBalances } = useFetchWalletAlphBalancesByAddress()
  const { data: addressesTokensBalances } = useFetchWalletTokensBalancesByAddress()

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
            const addressHasAlphBalances = (addressAlphBalances?.totalBalance ?? 0) > 0

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

export const useAddressesWithBalance = () => {
  const allAddressHashes = useAppSelector(selectAllAddressHashes)
  const { data: addressesAlphBalances } = useFetchWalletAlphBalancesByAddress()

  const filteredAddressHashes = useMemo(
    () =>
      allAddressHashes.filter(
        (addressHash) => addressesAlphBalances[addressHash] && addressesAlphBalances[addressHash].totalBalance > 0
      ),
    [addressesAlphBalances, allAddressHashes]
  )

  return filteredAddressHashes
}
